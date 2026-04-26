import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantLifecycleState } from "@/lib/tenant/lifecycle";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      owner: { select: { id: true, email: true, name: true } },
      _count: { select: { members: true } },
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const lifecycle = await getTenantLifecycleState(tenant.id);
  const sub = tenant.subscriptions[0];

  return NextResponse.json({
    tenant: {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan,
      status: tenant.status,
      trialEndsAt: tenant.trialEndsAt?.toISOString() || null,
      gracePeriodEndsAt: tenant.gracePeriodEndsAt?.toISOString() || null,
      retentionExpiresAt: tenant.retentionExpiresAt?.toISOString() || null,
      downgradeReason: tenant.downgradeReason,
      maxUsers: tenant.maxUsers,
      maxAccounts: tenant.maxAccounts,
      currentUsers: (tenant._count?.members ?? 0) + 1,
      subdomain: tenant.subdomain,
      customDomain: tenant.customDomain,
      createdAt: tenant.createdAt.toISOString(),
      owner: tenant.owner,
    },
    subscription: sub
      ? {
          id: sub.id,
          status: sub.status,
          planName: sub.planName,
          seatLimit: sub.seatLimit,
          currentSeats: sub.currentSeats,
          trialEndsAt: sub.trialEndsAt?.toISOString() || null,
          gracePeriodEndsAt: sub.gracePeriodEndsAt?.toISOString() || null,
          startsAt: sub.startsAt.toISOString(),
          endsAt: sub.endsAt?.toISOString() || null,
          autoRenew: sub.autoRenew,
        }
      : null,
    lifecycle: {
      status: lifecycle.status,
      daysLeftInTrial: lifecycle.daysLeftInTrial,
      daysLeftInGrace: lifecycle.daysLeftInGrace,
      daysLeftInRetention: lifecycle.daysLeftInRetention,
      isExpired: lifecycle.isExpired,
      isGracePeriod: lifecycle.isGracePeriod,
      canAccessFeatures: lifecycle.canAccessFeatures,
    },
  });
}
