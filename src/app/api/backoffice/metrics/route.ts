import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    totalUsers,
    activeUsers,
    totalTenants,
    trialTenants,
    totalLicenses,
    activeLicenses,
    totalInvoices,
    paidInvoices,
    revenueAgg,
    recentUsers,
    recentTenants,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: "active" } }),
    prisma.tenant.count(),
    prisma.tenant.count({ where: { status: "trial" } }),
    prisma.license.count(),
    prisma.license.count({ where: { status: "active" } }),
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: "paid" } }),
    prisma.invoice.aggregate({
      where: { status: "paid" },
      _sum: { amount: true },
    }),
    prisma.user.findMany({
      select: { id: true, email: true, name: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.tenant.findMany({
      include: { owner: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    users: { total: totalUsers, active: activeUsers },
    tenants: { total: totalTenants, trial: trialTenants },
    licenses: { total: totalLicenses, active: activeLicenses },
    invoices: { total: totalInvoices, paid: paidInvoices, revenue: revenueAgg._sum.amount || 0 },
    recentUsers,
    recentTenants,
  });
}
