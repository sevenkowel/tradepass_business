import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const PLAN_LIMITS: Record<string, { maxUsers: number; maxAccounts: number }> = {
  free: { maxUsers: 10, maxAccounts: 5 },
  starter: { maxUsers: 50, maxAccounts: 100 },
  professional: { maxUsers: 200, maxAccounts: 500 },
  enterprise: { maxUsers: 1000, maxAccounts: 2000 },
  ultimate: { maxUsers: -1, maxAccounts: -1 },
};

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  starter: 8000,
  professional: 15000,
  enterprise: 30000,
  ultimate: 60000,
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { plan, yearly } = body;

  if (!plan || !PLAN_LIMITS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findFirst({
    where: { ownerId: user.id },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const limits = PLAN_LIMITS[plan];
  const basePrice = PLAN_PRICES[plan];
  const price = yearly ? Math.round(basePrice * 0.9) : basePrice;

  // Update tenant plan and limits
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      plan,
      maxUsers: limits.maxUsers,
      maxAccounts: limits.maxAccounts,
      status: plan === "free" ? "trial" : "active",
    },
  });

  // Update or create subscription
  const existingSub = tenant.subscriptions[0];
  const businessProduct = await prisma.product.findUnique({
    where: { code: "trade_pass_business" },
  });

  if (existingSub) {
    await prisma.subscription.update({
      where: { id: existingSub.id },
      data: {
        planName: plan,
        status: plan === "free" ? "trialing" : "active",
        seatLimit: limits.maxUsers,
        features: JSON.stringify({ plan, modules: getModulesForPlan(plan) }),
      },
    });
  } else if (businessProduct) {
    await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        productId: businessProduct.id,
        status: plan === "free" ? "trialing" : "active",
        planName: plan,
        seatLimit: limits.maxUsers,
        currentSeats: 1,
        features: JSON.stringify({ plan, modules: getModulesForPlan(plan) }),
      },
    });
  }

  // Create invoice for paid plans
  if (price > 0) {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + (yearly ? 12 : 1));

    await prisma.invoice.create({
      data: {
        tenantId: tenant.id,
        invoiceNumber: `INV-${Date.now()}`,
        periodStart: now,
        periodEnd,
        amount: price,
        currency: "USD",
        status: "pending",
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  return NextResponse.json({ success: true, plan, price });
}

function getModulesForPlan(plan: string): string[] {
  switch (plan) {
    case "free":
      return ["portal", "kyc_basic", "funds_usdt"];
    case "starter":
      return ["portal", "backoffice", "kyc_standard", "funds_usdt", "funds_bank", "ib_l1", "blacklist", "economic_calendar", "news_feed", "custom_domain"];
    case "professional":
      return ["portal", "backoffice", "kyc_enhanced", "funds_usdt", "funds_bank", "funds_card", "ib_l1", "ib_l2_l3", "ib_commission_withdraw", "mt5_web_terminal", "order_management", "risk_engine", "blacklist", "economic_calendar", "news_feed", "market_commentary", "reports_advanced"];
    case "enterprise":
    case "ultimate":
      return ["all"];
    default:
      return ["portal"];
  }
}
