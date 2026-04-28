/**
 * GET /api/portal/wallets
 * 获取当前登录用户的所有钱包
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

    const wallets = await prisma.wallet.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      wallets: wallets.map((w) => ({
        id: w.id,
        currency: w.currency,
        balance: w.balance,
        frozen: w.frozen,
        available: w.available,
        createdAt: w.createdAt.toISOString(),
        updatedAt: w.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("Wallets API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
