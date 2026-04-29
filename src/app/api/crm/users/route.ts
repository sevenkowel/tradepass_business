import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/permissions";

export const GET = requireRole(["admin", "compliance_officer"], async () => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      status: true,
      kycStatus: true,
      createdAt: true,
      lastLoginAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const wallets = await prisma.wallet.findMany({
    select: { userId: true, balance: true },
  });
  const walletMap = new Map(wallets.map((w) => [w.userId, w.balance]));

  const items = users.map((u, i) => ({
    id: u.id,
    uid: `USR${String(i + 1).padStart(3, "0")}`,
    name: u.name ?? "Unknown",
    email: u.email,
    phone: u.phone ?? "-",
    status: u.status === "active" ? "active" : u.status === "suspended" ? "frozen" : "pending",
    kycStatus: u.kycStatus ?? "not_submitted",
    level: (walletMap.get(u.id) ?? 0) > 10000 ? "vip" : (walletMap.get(u.id) ?? 0) > 5000 ? "premium" : "standard",
    balance: walletMap.get(u.id) ?? 0,
    equity: walletMap.get(u.id) ?? 0,
    createdAt: u.createdAt.toISOString(),
    lastLoginAt: u.lastLoginAt?.toISOString() ?? u.createdAt.toISOString(),
    tags: [],
    country: "-",
  }));

  return NextResponse.json({ success: true, items, total: items.length });
});
