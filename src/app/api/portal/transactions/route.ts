/**
 * GET /api/portal/transactions
 * 获取当前登录用户的交易记录
 *
 * Query params:
 *   type: deposit | withdrawal | transfer | commission (optional)
 *   status: pending | processing | completed | failed | cancelled (optional)
 *   currency: USD | USDT | ... (optional)
 *   page: number (default 1)
 *   limit: number (default 20)
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

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || undefined;
    const status = searchParams.get("status") || undefined;
    const currency = searchParams.get("currency") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where: Record<string, unknown> = { userId: user.id };
    if (type) where.type = type;
    if (status) where.status = status;
    if (currency) where.currency = currency;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { wallet: { select: { currency: true } } },
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        fee: t.fee,
        currency: t.currency,
        status: t.status,
        method: t.method,
        address: t.address,
        txHash: t.txHash,
        description: t.description,
        createdAt: t.createdAt.toISOString(),
        processedAt: t.processedAt?.toISOString() || null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Transactions API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
