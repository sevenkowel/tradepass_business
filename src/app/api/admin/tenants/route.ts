import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const tenants = await prisma.tenant.findMany({
    include: {
      owner: { select: { email: true, name: true } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    tenants: tenants.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      status: t.status,
      plan: t.plan,
      trialEndsAt: t.trialEndsAt?.toISOString() || null,
      gracePeriodEndsAt: t.gracePeriodEndsAt?.toISOString() || null,
      retentionExpiresAt: t.retentionExpiresAt?.toISOString() || null,
      downgradeReason: t.downgradeReason,
      maxUsers: t.maxUsers,
      maxAccounts: t.maxAccounts,
      subdomain: t.subdomain,
      createdAt: t.createdAt.toISOString(),
      owner: t.owner,
      _count: t._count,
    })),
  });
}
