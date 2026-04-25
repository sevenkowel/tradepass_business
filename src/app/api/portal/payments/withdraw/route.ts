import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { requireCsrf } from "@/lib/security";

/**
 * POST /api/portal/payments/withdraw
 * Create a withdrawal request
 */
export async function POST(req: NextRequest) {
  const csrfError = requireCsrf(req);
  if (csrfError) return csrfError;

  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, currency = "USDT", address, method = "usdt_trc20" } = body;

    if (!amount || amount <= 0 || !address) {
      return NextResponse.json({ error: "Invalid amount or address" }, { status: 400 });
    }

    // Check blacklist
    const blacklisted = await prisma.blacklistEntry.findFirst({
      where: { type: "address", value: address },
    });
    if (blacklisted) {
      return NextResponse.json(
        { error: "Withdrawal address is blacklisted" },
        { status: 403 }
      );
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId_currency: { userId: user.id, currency } },
    });
    if (!wallet || wallet.available < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
    }

    // Freeze funds
    await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        frozen: { increment: amount },
        available: { decrement: amount },
      },
    });

    const fee = amount * 0.001; // 0.1% fee
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        walletId: wallet.id,
        type: "withdrawal",
        amount,
        fee,
        currency,
        status: "pending",
        method,
        address,
        description: `Withdrawal to ${address}`,
      },
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount,
        fee,
        currency,
        address,
        status: "pending",
        network: "TRC20",
      },
    });
  } catch (err) {
    console.error("Withdrawal error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
