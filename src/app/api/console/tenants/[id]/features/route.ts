import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const DEFAULT_FEATURES = {
  portal: true,
  backoffice: true,
  kyc: true,
  fund_system: true,
  copy_trading: false,
  ib_system: false,
  api_access: false,
  white_label: false,
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tenantId } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const hasAccess =
    tenant.ownerId === user.id ||
    (await prisma.tenantMember.findFirst({ where: { tenantId, userId: user.id } }));
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const subscription = await prisma.subscription.findFirst({
    where: { tenantId, status: { in: ["active", "trial"] } },
    orderBy: { createdAt: "desc" },
  });

  let features = DEFAULT_FEATURES;
  if (subscription?.features) {
    try {
      features = { ...DEFAULT_FEATURES, ...JSON.parse(subscription.features) };
    } catch {}
  }

  return NextResponse.json({ features });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tenantId } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  const membership = await prisma.tenantMember.findFirst({
    where: { tenantId, userId: user.id },
  });
  const canEdit =
    tenant.ownerId === user.id || membership?.role === "admin" || membership?.role === "owner";
  if (!canEdit) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { features } = body;
  if (!features || typeof features !== "object") {
    return NextResponse.json({ error: "Invalid features" }, { status: 400 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { tenantId, status: { in: ["active", "trial"] } },
    orderBy: { createdAt: "desc" },
  });

  if (!subscription) {
    return NextResponse.json({ error: "No active subscription" }, { status: 400 });
  }

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: { features: JSON.stringify(features) },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: user.id,
      action: "features_updated",
      resource: "subscription",
      resourceId: subscription.id,
      metadata: JSON.stringify(features),
    },
  });

  return NextResponse.json({ subscription: updated });
}
