import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { requireCsrf } from "@/lib/security";

/**
 * POST /api/portal/payments/deposit
 * Create a USDT-TRC20 deposit request
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
    const { amount, currency = "USDT", method = "usdt_trc20" } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId_currency: { userId: user.id, currency } },
    });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: user.id, currency, balance: 0, frozen: 0, available: 0 },
      });
    }

    // Generate deposit address (mock for MVP — real impl would call TronGrid)
    const depositAddress = generateDepositAddress(user.id);

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        walletId: wallet.id,
        type: "deposit",
        amount,
        fee: 0,
        currency,
        status: "pending",
        method,
        address: depositAddress,
        description: `USDT-TRC20 deposit request`,
      },
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount,
        currency,
        address: depositAddress,
        status: "pending",
        network: "TRC20",
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      },
    });
  } catch (err) {
    console.error("Deposit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateDepositAddress(userId: string): string {
  // Mock: real implementation should generate unique TRC20 addresses via TronGrid
  const suffix = userId.slice(-8).toUpperCase();
  return `T${Array.from({ length: 33 }, (_, i) =>
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[
      (suffix.charCodeAt(i % suffix.length) + i * 7) % 58
    ]
  ).join("")}`;
}
