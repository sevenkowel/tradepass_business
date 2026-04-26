import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await prisma.tenant.findFirst({
    where: { ownerId: user.id },
    include: {
      members: { include: { user: { select: { id: true, email: true, name: true, status: true, createdAt: true } } } },
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  try {
    // Gather all tenant-related data
    const [
      kycRecords,
      mtAccounts,
      wallets,
      transactions,
      orders,
      positions,
      ibPartners,
      commissionRecords,
      riskEvents,
      auditLogs,
    ] = await Promise.all([
      prisma.kYCRecord.findMany({ where: { userId: { in: tenant.members.map((m) => m.userId) } } }),
      prisma.mTAccount.findMany({ where: { userId: { in: tenant.members.map((m) => m.userId) } } }),
      prisma.wallet.findMany({ where: { userId: { in: tenant.members.map((m) => m.userId) } } }),
      prisma.transaction.findMany({ where: { userId: { in: tenant.members.map((m) => m.userId) } } }),
      prisma.order.findMany({ where: { accountId: { in: [] } } }), // Would need account IDs
      prisma.position.findMany({ where: { accountId: { in: [] } } }),
      prisma.iBPartner.findMany({ where: { userId: { in: tenant.members.map((m) => m.userId) } } }),
      prisma.commissionRecord.findMany({ where: { ibId: { in: [] } } }),
      prisma.riskEvent.findMany({ where: { userId: { in: tenant.members.map((m) => m.userId) } } }),
      prisma.auditLog.findMany({ where: { tenantId: tenant.id } }),
    ]);

    // Get orders and positions via accounts
    const accountIds = mtAccounts.map((a) => a.id);
    const [allOrders, allPositions] = await Promise.all([
      accountIds.length > 0 ? prisma.order.findMany({ where: { accountId: { in: accountIds } } }) : [],
      accountIds.length > 0 ? prisma.position.findMany({ where: { accountId: { in: accountIds } } }) : [],
    ]);

    const ibIds = ibPartners.map((ib) => ib.id);
    const allCommissions = ibIds.length > 0
      ? await prisma.commissionRecord.findMany({ where: { ibId: { in: ibIds } } })
      : [];

    const exportData = {
      exportedAt: new Date().toISOString(),
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        status: tenant.status,
        createdAt: tenant.createdAt,
        trialEndsAt: tenant.trialEndsAt,
        retentionExpiresAt: tenant.retentionExpiresAt,
      },
      users: tenant.members.map((m) => ({
        ...m.user,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
      kycRecords,
      mtAccounts,
      wallets,
      transactions,
      orders: allOrders,
      positions: allPositions,
      ibPartners,
      commissionRecords: allCommissions,
      riskEvents,
      auditLogs,
    };

    // Update data retention record
    await prisma.tenantDataRetention.upsert({
      where: { tenantId: tenant.id },
      update: {
        dataExported: true,
        exportRequestedAt: new Date(),
      },
      create: {
        tenantId: tenant.id,
        status: "active",
        retentionDays: 90,
        retentionEndsAt: tenant.retentionExpiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        dataExported: true,
        exportRequestedAt: new Date(),
      },
    });

    // In production, this would upload to S3 and return a signed URL
    // For now, return a data URI for download
    const blob = Buffer.from(JSON.stringify(exportData, null, 2));
    const base64 = blob.toString("base64");

    return NextResponse.json({
      success: true,
      downloadUrl: `data:application/json;base64,${base64}`,
      filename: `tradepass-export-${tenant.slug}-${new Date().toISOString().split("T")[0]}.json`,
      recordCounts: {
        users: exportData.users.length,
        kycRecords: kycRecords.length,
        mtAccounts: mtAccounts.length,
        wallets: wallets.length,
        transactions: transactions.length,
        orders: allOrders.length,
        positions: allPositions.length,
        ibPartners: ibPartners.length,
        commissions: allCommissions.length,
        riskEvents: riskEvents.length,
        auditLogs: auditLogs.length,
      },
    });
  } catch (err) {
    console.error("Export data error:", err);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
