/**
 * AI Signals 共享数据
 * 统一的 mock 数据，用于 Dashboard 和 Feed 页面
 */

import { AISignal } from "./types";

// 统一的信号数据源
export const mockSignals: AISignal[] = [
  {
    id: 1,
    symbol: "XAUUSD",
    direction: "BUY",
    entry: 2334.5,
    sl: 2318.0,
    tp: 2360.0,
    confidence: 87,
    timeframe: "H4",
    time: "2h ago",
    rrr: "1:1.6",
    status: "active",
    tags: ["Trend", "Breakout"],
  },
  {
    id: 2,
    symbol: "EURUSD",
    direction: "SELL",
    entry: 1.0882,
    sl: 1.0910,
    tp: 1.0835,
    confidence: 74,
    timeframe: "H1",
    time: "4h ago",
    rrr: "1:1.7",
    status: "active",
    tags: ["Reversal"],
  },
  {
    id: 3,
    symbol: "BTCUSDT",
    direction: "BUY",
    entry: 68200,
    sl: 66500,
    tp: 71000,
    confidence: 91,
    timeframe: "D1",
    time: "6h ago",
    rrr: "1:1.6",
    status: "active",
    tags: ["Trend", "AI-High"],
  },
  {
    id: 4,
    symbol: "GBPUSD",
    direction: "SELL",
    entry: 1.2645,
    sl: 1.2680,
    tp: 1.2570,
    confidence: 68,
    timeframe: "H4",
    time: "8h ago",
    rrr: "1:2.1",
    status: "closed",
    tags: ["Support/Resistance"],
  },
  {
    id: 5,
    symbol: "USDJPY",
    direction: "BUY",
    entry: 151.82,
    sl: 151.2,
    tp: 153.4,
    confidence: 79,
    timeframe: "H4",
    time: "10h ago",
    rrr: "1:2.5",
    status: "active",
    tags: ["Trend"],
  },
  {
    id: 6,
    symbol: "ETHUSD",
    direction: "BUY",
    entry: 3520,
    sl: 3380,
    tp: 3820,
    confidence: 83,
    timeframe: "H4",
    time: "12h ago",
    rrr: "1:2.1",
    status: "active",
    tags: ["AI-High", "Momentum"],
  },
];

// 获取前 N 个活跃信号（用于 Dashboard）
export const getTopSignals = (count: number = 3): AISignal[] => {
  return mockSignals
    .filter((s) => s.status === "active")
    .slice(0, count);
};

// 获取推荐信号（高置信度优先）
export const getRecommendedSignals = (count: number = 3): AISignal[] => {
  return mockSignals
    .filter((s) => s.status === "active")
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, count);
};

// 根据方向筛选
export const filterSignalsByDirection = (
  signals: AISignal[],
  direction: "BUY" | "SELL" | "all"
): AISignal[] => {
  if (direction === "all") return signals;
  return signals.filter((s) => s.direction === direction);
};

// 获取信号统计
export const getSignalStats = () => {
  const active = mockSignals.filter((s) => s.status === "active").length;
  const closed = mockSignals.filter((s) => s.status === "closed").length;
  const avgConfidence = Math.round(
    mockSignals.reduce((sum, s) => sum + s.confidence, 0) / mockSignals.length
  );
  return { active, closed, avgConfidence, total: mockSignals.length };
};
