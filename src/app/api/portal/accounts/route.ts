/**
 * GET /api/portal/accounts
 * 获取当前登录用户的交易账户列表
 *
 * POST /api/portal/accounts
 * 创建新的交易账户（开户）
 * Body: {
 *   type: "demo" | "real"
 *   currency?: string (default "USD")
 *   leverage?: number (default 100)
 *   group?: string (default "standard")
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { requireCsrf } from "@/lib/security";

// ─── GET ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await prisma.mTAccount.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        orders: {
          where: { status: "open" },
          select: { id: true },
        },
        positions: {
          select: { id: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      accounts: accounts.map((a) => ({
        id: a.id,
        accountId: a.mtLogin,
        type: a.group?.toLowerCase().includes("demo") ? "demo" : "real",
        status: a.status,
        currency: a.currency,
        leverage: a.leverage,
        balance: a.balance,
        equity: a.equity,
        margin: a.margin,
        freeMargin: a.freeMargin,
        group: a.group,
        openOrders: a.orders.length,
        openPositions: a.positions.length,
        createdAt: a.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("Accounts API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── POST ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const csrfError = requireCsrf(req);
  if (csrfError) return csrfError;

  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      type = "real",
      currency = "USD",
      leverage = 100,
      group = "standard",
    } = body;

    // 检查 KYC 状态（开户需要 KYC approved）
    const kycRecord = await prisma.kYCRecord.findUnique({
      where: { userId: user.id },
    });

    if (!kycRecord || kycRecord.status !== "approved") {
      return NextResponse.json(
        { error: "KYC approval required to open a trading account" },
        { status: 403 }
      );
    }

    // 生成模拟 MT5 账号
    const accountCount = await prisma.mTAccount.count({
      where: { userId: user.id },
    });
    const mtLogin = generateMTLogin(user.id, accountCount);
    const mtPassword = generateRandomPassword();

    const isDemo = type === "demo";
    const resolvedGroup = isDemo ? "demo" : group;
    const initialBalance = isDemo ? 100000 : 0;

    const account = await prisma.mTAccount.create({
      data: {
        userId: user.id,
        mtLogin,
        mtPassword,
        group: resolvedGroup,
        leverage,
        balance: initialBalance,
        equity: initialBalance,
        margin: 0,
        freeMargin: initialBalance,
        currency,
        status: "active",
      },
    });

    // 同时创建对应钱包（如果不存在）
    await prisma.wallet.upsert({
      where: { userId_currency: { userId: user.id, currency } },
      update: {},
      create: {
        userId: user.id,
        currency,
        balance: 0,
        frozen: 0,
        available: 0,
      },
    });

    return NextResponse.json({
      success: true,
      account: {
        id: account.id,
        accountId: account.mtLogin,
        type: isDemo ? "demo" : "real",
        status: account.status,
        currency: account.currency,
        leverage: account.leverage,
        balance: account.balance,
        equity: account.equity,
        group: account.group,
        createdAt: account.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Create account error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────
function generateMTLogin(userId: string, index: number): string {
  const prefix = "88";
  const suffix = userId.slice(-4);
  const seq = String(index + 1).padStart(3, "0");
  return `${prefix}${suffix}${seq}`;
}

function generateRandomPassword(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  return Array.from({ length: 12 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}
