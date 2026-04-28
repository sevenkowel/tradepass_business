/**
 * GET /api/portal/dashboard
 * Portal Dashboard 概览数据
 *
 * 返回：
 * - wallets: 用户钱包列表
 * - accounts: 交易账户列表
 * - kycStatus: KYC 状态
 * - recentTransactions: 最近交易记录
 * - notifications: 待办/通知
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 并行获取所有数据
    const [wallets, accounts, kycRecord, recentTransactions] = await Promise.all([
      prisma.wallet.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.mTAccount.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.kYCRecord.findUnique({
        where: { userId: user.id },
      }),
      prisma.transaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    // 计算总资产
    const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
    const totalEquity = accounts.reduce((sum, a) => sum + a.equity, 0);

    // 构建通知/待办
    const notifications = [];
    if (!kycRecord || kycRecord.status === "not_started") {
      notifications.push({
        id: "kyc-pending",
        type: "warning",
        title: "Complete KYC",
        message: "Complete identity verification to unlock full trading features.",
        action: { label: "Start KYC", href: "/portal/kyc" },
      });
    } else if (kycRecord.status === "submitted" || kycRecord.status === "under_review") {
      notifications.push({
        id: "kyc-review",
        type: "info",
        title: "KYC Under Review",
        message: "Your identity verification is being reviewed.",
        action: { label: "View Status", href: "/portal/kyc/status" },
      });
    }

    if (accounts.length === 0 && kycRecord?.status === "approved") {
      notifications.push({
        id: "open-account",
        type: "action",
        title: "Open Trading Account",
        message: "You are approved! Open your first trading account.",
        action: { label: "Open Account", href: "/portal/trading/accounts" },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        kycStatus: kycRecord?.status || "not_started",
        kycLevel: kycRecord?.kycLevel || null,
      },
      wallets: wallets.map((w) => ({
        id: w.id,
        currency: w.currency,
        balance: w.balance,
        available: w.available,
        frozen: w.frozen,
      })),
      accounts: accounts.map((a) => ({
        id: a.id,
        accountId: a.mtLogin,
        type: a.group?.toLowerCase().includes("demo") ? "demo" : "real",
        status: a.status,
        currency: a.currency,
        balance: a.balance,
        equity: a.equity,
        leverage: a.leverage,
      })),
      totalBalance,
      totalEquity,
      totalAssets: totalBalance + totalEquity,
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        currency: t.currency,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
      })),
      notifications,
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
