import { prisma } from "@/lib/prisma";

/**
 * R2: Risk Engine v0 — Minimal implementation
 * Checks margin levels and creates RiskEvent alerts
 */

export async function checkMarginRisk(accountId: string): Promise<boolean> {
  const account = await prisma.mTAccount.findUnique({ where: { id: accountId } });
  if (!account) return false;

  const marginLevel = account.margin > 0
    ? (account.equity / account.margin) * 100
    : 100;

  if (marginLevel < 50) {
    await prisma.riskEvent.create({
      data: {
        type: "margin_call",
        severity: marginLevel < 20 ? "critical" : "high",
        userId: account.userId,
        accountId,
        description: `Margin level ${marginLevel.toFixed(2)}% — below threshold`,
        metadata: JSON.stringify({ marginLevel, equity: account.equity, margin: account.margin }),
      },
    });
    return true;
  }
  return false;
}

export async function checkBlacklist(
  params: { email?: string; phone?: string; ip?: string; address?: string }
): Promise<{ blocked: boolean; reason?: string }> {
  const checks = [
    params.email ? { type: "email", value: params.email } : null,
    params.phone ? { type: "phone", value: params.phone } : null,
    params.ip ? { type: "ip", value: params.ip } : null,
    params.address ? { type: "address", value: params.address } : null,
  ].filter(Boolean) as { type: string; value: string }[];

  for (const check of checks) {
    const entry = await prisma.blacklistEntry.findUnique({
      where: { type_value: { type: check.type, value: check.value } },
    });
    if (entry) {
      return { blocked: true, reason: entry.reason ?? `${check.type} blacklisted` };
    }
  }
  return { blocked: false };
}
