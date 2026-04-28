/**
 * POST /api/portal/wallets/transfer
 * 账户间转账
 *
 * Body: {
 *   fromWalletId: string
 *   toWalletId: string
 *   amount: number
 *   description?: string
 * }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { requireCsrf } from "@/lib/security";

export async function POST(req: NextRequest) {
  const csrfError = requireCsrf(req);
  if (csrfError) return csrfError;

  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fromWalletId, toWalletId, amount, description } = body;

    if (!fromWalletId || !toWalletId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Missing required fields: fromWalletId, toWalletId, amount" },
        { status: 400 }
      );
    }

    if (fromWalletId === toWalletId) {
      return NextResponse.json(
        { error: "Cannot transfer to the same wallet" },
        { status: 400 }
      );
    }

    // 验证两个钱包都属于当前用户
    const [fromWallet, toWallet] = await Promise.all([
      prisma.wallet.findFirst({
        where: { id: fromWalletId, userId: user.id },
      }),
      prisma.wallet.findFirst({
        where: { id: toWalletId, userId: user.id },
      }),
    ]);

    if (!fromWallet) {
      return NextResponse.json(
        { error: "Source wallet not found" },
        { status: 404 }
      );
    }
    if (!toWallet) {
      return NextResponse.json(
        { error: "Destination wallet not found" },
        { status: 404 }
      );
    }

    if (fromWallet.available < amount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    const fee = 0; // 内部转账免手续费

    // 执行转账（使用事务保证原子性）
    const [outTx, inTx] = await prisma.$transaction([
      // 转出记录
      prisma.transaction.create({
        data: {
          userId: user.id,
          walletId: fromWallet.id,
          type: "transfer",
          amount: -amount,
          fee,
          currency: fromWallet.currency,
          status: "completed",
          description: description || `Transfer to ${toWallet.currency} wallet`,
          metadata: JSON.stringify({ toWalletId: toWallet.id }),
          processedAt: new Date(),
        },
      }),
      // 转入记录
      prisma.transaction.create({
        data: {
          userId: user.id,
          walletId: toWallet.id,
          type: "transfer",
          amount,
          fee,
          currency: toWallet.currency,
          status: "completed",
          description: description || `Transfer from ${fromWallet.currency} wallet`,
          metadata: JSON.stringify({ fromWalletId: fromWallet.id }),
          processedAt: new Date(),
        },
      }),
      // 更新源钱包余额
      prisma.wallet.update({
        where: { id: fromWallet.id },
        data: {
          balance: { decrement: amount },
          available: { decrement: amount },
        },
      }),
      // 更新目标钱包余额
      prisma.wallet.update({
        where: { id: toWallet.id },
        data: {
          balance: { increment: amount },
          available: { increment: amount },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      transfer: {
        outTransactionId: outTx.id,
        inTransactionId: inTx.id,
        amount,
        fee,
        fromCurrency: fromWallet.currency,
        toCurrency: toWallet.currency,
        status: "completed",
        completedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Transfer API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
