import { prisma } from "@/lib/prisma";

/**
 * Copy Trading Engine MVP
 *
 * - Followers subscribe to a trader with a follow mode (ratio / fixed / mirror)
 * - When trader opens/closes a position, replicate to follower accounts
 * - Profit sharing is calculated on position close
 */

interface CopyConfig {
  followerId: string;
  traderId: string;
  mode: "ratio" | "fixed" | "mirror";
  ratio: number;      // e.g. 0.1 = 10% of trader volume
  fixedLots: number;  // for fixed mode
  maxPositions: number;
}

/**
 * Replicate a trade from trader to all active followers.
 */
export async function replicateTrade(
  traderId: string,
  trade: {
    symbol: string;
    type: "buy" | "sell";
    volume: number;
    openPrice: number;
  }
): Promise<void> {
  // Find active follower subscriptions
  const subscriptions = await prisma.iBPartner.findMany({
    where: { parentId: traderId, status: "active" },
  });

  for (const sub of subscriptions) {
    // TODO: lookup follow config per follower (stored in a CopySubscription table)
    // For MVP, use a default ratio of 0.1
    const followerVolume = trade.volume * 0.1;

    await prisma.order.create({
      data: {
        accountId: sub.userId, // TODO: map to actual MTAccount
        symbol: trade.symbol,
        type: trade.type,
        volume: followerVolume,
        openPrice: trade.openPrice,
        status: "open",
        openTime: new Date(),
      },
    });
  }
}

/**
 * Calculate profit share when a copied position closes.
 */
export async function calculateProfitShare(
  traderId: string,
  followerId: string,
  grossProfit: number
): Promise<{ traderShare: number; platformFee: number; followerNet: number }> {
  const shareRatio = 0.2; // 20% to trader (configurable per subscription)
  const platformFeeRate = 0.1; // 10% platform fee on trader share

  const traderGross = grossProfit * shareRatio;
  const platformFee = traderGross * platformFeeRate;
  const traderShare = traderGross - platformFee;
  const followerNet = grossProfit - traderGross;

  return { traderShare, platformFee, followerNet };
}
