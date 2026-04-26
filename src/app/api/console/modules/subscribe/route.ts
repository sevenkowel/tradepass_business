import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { MODULE_CODES, getModulePlan } from "@/lib/modules/constants";

/**
 * POST /api/console/modules/subscribe
 * Subscribe to a product module (trial or paid).
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { tenantId, moduleCode, plan, trial = false } = body;

  if (!tenantId || !moduleCode || !MODULE_CODES.includes(moduleCode)) {
    return NextResponse.json({ error: "Invalid moduleCode or tenantId" }, { status: 400 });
  }

  const member = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId, userId: user.id } },
  });

  if (!member || member.role !== "owner") {
    return NextResponse.json({ error: "Only owner can subscribe" }, { status: 403 });
  }

  const planDef = getModulePlan(moduleCode, plan);
  if (!planDef && !trial) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const now = new Date();

  if (trial) {
    // Start a 14-day trial
    const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    await prisma.productModule.upsert({
      where: {
        tenantId_moduleCode: { tenantId, moduleCode },
      },
      update: {
        status: "trial",
        planName: plan || "basic",
        trialEndsAt,
        seatLimit: planDef?.seatLimit || 3,
        features: JSON.stringify(planDef?.featureFlags || {}),
        updatedAt: now,
      },
      create: {
        tenantId,
        moduleCode,
        moduleName: moduleCode.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
        status: "trial",
        planName: plan || "basic",
        trialEndsAt,
        seatLimit: planDef?.seatLimit || 3,
        features: JSON.stringify(planDef?.featureFlags || {}),
        priceMonthly: planDef?.priceMonthlyUSD,
        priceYearly: planDef?.priceYearlyUSD,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        action: "module_trial_started",
        resource: "product_module",
        resourceId: moduleCode,
        metadata: JSON.stringify({ plan, trialEndsAt }),
      },
    });

    return NextResponse.json({ success: true, trial: true, trialEndsAt });
  }

  // Paid subscription
  await prisma.productModule.upsert({
    where: {
      tenantId_moduleCode: { tenantId, moduleCode },
    },
    update: {
      status: "active",
      planName: plan,
      seatLimit: planDef!.seatLimit,
      features: JSON.stringify(planDef!.featureFlags),
      priceMonthly: planDef!.priceMonthlyUSD,
      priceYearly: planDef!.priceYearlyUSD,
      startsAt: now,
      trialEndsAt: null,
      updatedAt: now,
    },
    create: {
      tenantId,
      moduleCode,
      moduleName: moduleCode.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
      status: "active",
      planName: plan,
      seatLimit: planDef!.seatLimit,
      features: JSON.stringify(planDef!.featureFlags),
      priceMonthly: planDef!.priceMonthlyUSD,
      priceYearly: planDef!.priceYearlyUSD,
      startsAt: now,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: user.id,
      action: "module_subscribed",
      resource: "product_module",
      resourceId: moduleCode,
      metadata: JSON.stringify({ plan }),
    },
  });

  return NextResponse.json({ success: true, plan });
}
