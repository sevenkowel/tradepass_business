export interface CopyTrader {
  id: string;
  traderId: string;
  name: string;
  email: string;
  avatar?: string;
  returnRate: number;
  totalReturn: number;
  followers: number;
  aum: number;
  riskLevel: "low" | "medium" | "high";
  status: "active" | "inactive" | "suspended";
  maxFollowers: number;
  strategy: string;
  winRate: number;
  totalTrades: number;
  monthlyReturn: number;
  createdAt: string;
}

export interface CopyFollower {
  id: string;
  userId: string;
  username: string;
  email: string;
  traderId: string;
  traderName: string;
  followAmount: number;
  followMode: "ratio" | "fixed" | "mirror";
  followRatio: number;
  fixedLots: number;
  pnl: number;
  pnlPercent: number;
  status: "active" | "paused" | "stopped";
  copyCount: number;
  createdAt: string;
}

export interface ProfitRecord {
  id: string;
  traderId: string;
  traderName: string;
  followerId: string;
  followerName: string;
  profitAmount: number;
  shareRatio: number;
  platformFee: number;
  traderShare: number;
  netAmount: number;
  status: "pending" | "settled" | "disputed";
  period: string;
  createdAt: string;
  settledAt?: string;
}

export interface CopySettings {
  id: string;
  followMode: "ratio" | "fixed" | "mirror";
  defaultRatio: number;
  minFollowAmount: number;
  maxPositions: number;
  stopLossPercent: number;
  forcedClosePercent: number;
  platformShare: number;
  traderShare: number;
  followerShare: number;
  minFollowerBalance: number;
  allowPause: boolean;
  autoStopLoss: boolean;
}
