import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const tenantId = searchParams.get("tenantId");

  const where: any = {};
  if (status) where.status = status;
  if (tenantId) where.tenantId = tenantId;

  const licenses = await prisma.license.findMany({
    where,
    include: {
      tenant: { select: { name: true, slug: true } },
      subscription: { select: { planName: true, product: { select: { name: true } } } },
    },
    orderBy: { issuedAt: "desc" },
  });

  return NextResponse.json({ licenses });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { licenseId, status } = body;
  if (!licenseId || !status) {
    return NextResponse.json({ error: "Missing licenseId or status" }, { status: 400 });
  }

  const updated = await prisma.license.update({
    where: { id: licenseId },
    data: {
      status,
      revokedAt: status === "revoked" ? new Date() : null,
    },
  });

  return NextResponse.json({ license: updated });
}
