import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { randomUUID } from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { productId } = body;

  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({ where: { id } });
  if (!tenant || tenant.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const existing = await prisma.subscription.findFirst({
    where: { tenantId: id, productId },
  });
  if (existing) {
    return NextResponse.json({ error: "Already subscribed" }, { status: 409 });
  }

  const subscription = await prisma.subscription.create({
    data: {
      tenantId: id,
      productId,
      status: "active",
      planName: "starter",
      seatLimit: 5,
      currentSeats: 1,
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      features: product.features,
    },
  });

  const license = await prisma.license.create({
    data: {
      key: `TP-${product.code.toUpperCase()}-${randomUUID()}`,
      tenantId: id,
      subscriptionId: subscription.id,
      productCode: product.code,
      status: "active",
      features: product.features,
      expiresAt: subscription.trialEndsAt,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: id,
      userId: user.id,
      action: "subscription_created",
      resource: "subscription",
      resourceId: subscription.id,
    },
  });

  return NextResponse.json({ subscription, license });
}
