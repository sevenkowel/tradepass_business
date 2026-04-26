import { prisma } from "@/lib/prisma";

/**
 * Commission Engine — L1/L2/L3 + Platform tiered calculation
 *
 * Hierarchy:
 *   Platform (root)
 *   └── L1 Manager (commissionRate = platform base)
 *       └── L2 IB (commissionRate = parent share)
 *           └── L3 Sub-IB (commissionRate = parent share)
 *               └── Client (trades → commission split up the chain)
 */

interface CommissionResult {
  ibId: string;
  level: number;
  amount: number;
  rate: number;
}

/**
 * Build the IB hierarchy chain for a given user.
 * Returns [L3, L2, L1] ordered from closest to root.
 */
export async function getIBChain(userId: string): Promise<
  Array<{ id: string; level: number; rate: number; parentId: string | null }>
> {
  const chain: Array<{ id: string; level: number; rate: number; parentId: string | null }> = [];

  const partner = await prisma.iBPartner.findFirst({
    where: { userId },
  });
  if (!partner) return chain;

  // Walk up the tree
  let currentId: string | null = partner.id;
  while (currentId) {
    const node: { id: string; level: number; commissionRate: number; parentId: string | null } | null =
      await prisma.iBPartner.findUnique({ where: { id: currentId } });
    if (!node) break;
    chain.unshift({
      id: node.id,
      level: node.level,
      rate: node.commissionRate,
      parentId: node.parentId,
    });
    currentId = node.parentId;
  }

  return chain;
}

/**
 * Calculate commission split for a closed order.
 *
 * @param clientId  The user who executed the trade
 * @param orderId   The closed order ID
 * @param grossCommission  Total commission charged on the trade (USD)
 * @returns Array of commission allocations per IB level
 */
export async function calculateCommission(
  clientId: string,
  orderId: string,
  grossCommission: number
): Promise<CommissionResult[]> {
  const chain = await getIBChain(clientId);
  if (chain.length === 0) {
    // No IB chain — platform keeps 100%
    return [];
  }

  const results: CommissionResult[] = [];
  let remaining = grossCommission;

  // Distribute from L1 (root) down to L3 (closest to client)
  // L1 gets their rate, L2 gets (L2 rate - L1 rate), etc.
  let prevRate = 0;
  for (const node of chain) {
    const delta = Math.max(0, node.rate - prevRate);
    const amount = Math.min(remaining, grossCommission * delta);
    if (amount > 0.001) {
      results.push({ ibId: node.id, level: node.level, amount, rate: delta });
      remaining -= amount;
    }
    prevRate = node.rate;
  }

  // Platform keeps whatever remains
  // (not recorded in CommissionRecord — platform P&L handles it)

  return results;
}

/**
 * Persist commission records for a closed order.
 */
export async function persistCommission(
  clientId: string,
  orderId: string,
  grossCommission: number
): Promise<void> {
  const allocations = await calculateCommission(clientId, orderId, grossCommission);

  await prisma.$transaction(
    allocations.map((alloc) =>
      prisma.commissionRecord.create({
        data: {
          ibId: alloc.ibId,
          clientId,
          orderId,
          amount: alloc.amount,
          currency: "USD",
          status: "pending",
          period: new Date().toISOString().slice(0, 7), // YYYY-MM
        },
      })
    )
  );

  // Update IBPartner totals
  for (const alloc of allocations) {
    await prisma.iBPartner.update({
      where: { id: alloc.ibId },
      data: {
        totalCommission: { increment: alloc.amount },
      },
    });
  }
}

/**
 * Settle pending commissions for a given period.
 */
export async function settleCommissions(period: string): Promise<number> {
  const pending = await prisma.commissionRecord.findMany({
    where: { period, status: "pending" },
  });

  await prisma.$transaction(
    pending.map((rec) =>
      prisma.commissionRecord.update({
        where: { id: rec.id },
        data: { status: "paid", paidAt: new Date() },
      })
    )
  );

  return pending.length;
}
