export interface AISignal {
  id: string;
  signalId: string;
  symbol: string;
  direction: "buy" | "sell";
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  status: "active" | "expired" | "hit_sl" | "hit_tp" | "withdrawn";
  model: string;
  description: string;
  createdAt: string;
  expiresAt: string;
  hitPrice?: number;
  pnl?: number;
}

export interface SignalUsage {
  id: string;
  userId: string;
  username: string;
  email: string;
  planType: "free" | "basic" | "pro" | "enterprise";
  quotaTotal: number;
  quotaUsed: number;
  quotaRemaining: number;
  validUntil: string;
  status: "active" | "expired" | "suspended";
  price: number;
  lastUsedAt: string;
}

export interface SignalModel {
  id: string;
  name: string;
  type: "technical" | "ml" | "sentiment" | "composite";
  accuracy: number;
  totalSignals: number;
  winSignals: number;
  frequency: "realtime" | "hourly" | "daily";
  status: "active" | "inactive" | "training";
  params: Record<string, unknown>;
  backtestReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  createdAt: string;
}
