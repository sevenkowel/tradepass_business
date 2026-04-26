import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getAllModules } from "@/lib/modules/constants";
import type { ModuleCode } from "@/lib/modules/constants";

/**
 * GET /api/console/modules
 * Returns all modules with their subscription status for the current tenant.
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) {
    return NextResponse.json({ error: "tenantId required" }, { status: 400 });
  }

  // Verify user belongs to tenant
  const member = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId, userId: user.id } },
  });

  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Get existing module subscriptions
  const existingModules = await prisma.productModule.findMany({
    where: { tenantId },
  });

  const moduleMap = new Map(existingModules.map((m) => [m.moduleCode, m]));

  // Build response with all available modules + their status
  const allModules = getAllModules().map((mod) => {
    const existing = moduleMap.get(mod.code);
    return {
      code: mod.code,
      name: mod.name,
      shortName: mod.shortName,
      description: mod.description,
      icon: mod.icon,
      features: mod.features,
      plans: mod.plans,
      subscription: existing
        ? {
            status: existing.status,
            planName: existing.planName,
            seatLimit: existing.seatLimit,
            currentSeats: existing.currentSeats,
            trialEndsAt: existing.trialEndsAt?.toISOString(),
            startsAt: existing.startsAt?.toISOString(),
            endsAt: existing.endsAt?.toISOString(),
            autoRenew: existing.autoRenew,
            priceMonthly: existing.priceMonthly,
            priceYearly: existing.priceYearly,
            currency: existing.currency,
            features: existing.features ? JSON.parse(existing.features) : null,
            config: existing.config ? JSON.parse(existing.config) : null,
          }
        : null,
    };
  });

  return NextResponse.json({ modules: allModules });
}
