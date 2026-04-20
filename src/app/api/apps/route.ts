import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentTenant } from "@/lib/api/tenant";

// Seed official apps if not exists
const OFFICIAL_APPS = [
  { appId: "copy_trading", name: "Copy Trading", description: "Social copy trading system with profit sharing", icon: "Copy", category: "trading" },
  { appId: "ai_signals", name: "AI Signals", description: "AI-powered trading signals and market analysis", icon: "Brain", category: "analytics" },
  { appId: "ib_referral", name: "IB & Referral", description: "Introducing broker rebate and referral system", icon: "Network", category: "marketing" },
  { appId: "advanced_reports", name: "Advanced Reports", description: "Advanced reporting and data analytics", icon: "BarChart3", category: "analytics" },
  { appId: "risk_enhanced", name: "Risk Enhanced", description: "Enhanced risk control rules and alerts", icon: "Shield", category: "risk" },
  { appId: "multi_terminal", name: "Multi Terminal", description: "Multi-account trading terminal", icon: "Monitor", category: "trading" },
];

async function seedApps() {
  const count = await prisma.appCatalog.count();
  if (count === 0) {
    for (const app of OFFICIAL_APPS) {
      await prisma.appCatalog.upsert({
        where: { appId: app.appId },
        update: {},
        create: app,
      });
    }
  }
}

export async function GET(req: NextRequest) {
  const tenant = await getCurrentTenant(req);
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await seedApps();

  const apps = await prisma.appCatalog.findMany({
    orderBy: { createdAt: "asc" },
  });

  const installed = await prisma.tenantApp.findMany({
    where: { tenantId: tenant.id, status: "installed" },
  });

  const installedIds = new Set(installed.map((a) => a.appId));

  const result = apps.map((app) => ({
    ...app,
    isInstalled: installedIds.has(app.appId),
    installedAt: installed.find((i) => i.appId === app.appId)?.installedAt || null,
  }));

  return NextResponse.json({ apps: result });
}
