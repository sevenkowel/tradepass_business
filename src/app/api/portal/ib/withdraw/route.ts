import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

const withdrawSchema = z.object({
  amount: z.number().positive(),
  method: z.enum(["usdt_trc20", "bank_transfer"]),
  address: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = withdrawSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { amount, method, address } = parsed.data;

    const ib = await prisma.iBPartner.findFirst({
      where: { userId: user.id },
    });
    if (!ib) {
      return NextResponse.json({ error: "Not an IB partner" }, { status: 403 });
    }

    // Check available commission balance (simplified — real system would track separately)
    if (ib.totalCommission < amount) {
      return NextResponse.json({ error: "Insufficient commission balance" }, { status: 400 });
    }

    // Create withdrawal transaction
    const tx = await prisma.transaction.create({
      data: {
        userId: user.id,
        walletId: "ib_commission_wallet", // TODO: create proper commission wallet
        type: "withdrawal",
        amount: -amount,
        fee: 0,
        currency: "USD",
        status: "pending",
        method,
        address,
        description: `IB commission withdrawal (${method})`,
      },
    });

    // Deduct from IB total (simplified — real system would use ledger)
    await prisma.iBPartner.update({
      where: { id: ib.id },
      data: { totalCommission: { decrement: amount } },
    });

    return NextResponse.json({
      success: true,
      transactionId: tx.id,
      message: "Withdrawal request submitted. Pending review.",
    });
  } catch (error) {
    console.error("IB withdrawal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
