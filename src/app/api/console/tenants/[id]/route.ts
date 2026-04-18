import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const membership = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId: id, userId: user.id } },
  });
  const tenant = await prisma.tenant.findUnique({ where: { id } });

  if (!tenant || (!membership && tenant.ownerId !== user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { tenantId: id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  const licenses = await prisma.license.findMany({
    where: { tenantId: id },
    orderBy: { issuedAt: "desc" },
  });

  const members = await prisma.tenantMember.findMany({
    where: { tenantId: id },
    include: { user: { select: { email: true, name: true } } },
  });

  return NextResponse.json({
    tenant,
    subscriptions,
    licenses,
    members,
  });
}
