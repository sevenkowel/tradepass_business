/**
 * AI Signals 统一类型定义
 * 基于 Feed 页面标准格式
 */

export type SignalDirection = "BUY" | "SELL";
export type SignalStatus = "active" | "closed" | "pending";
export type SignalTimeframe = "M15" | "H1" | "H4" | "D1" | "W1";

export interface AISignal {
  id: string | number;
  symbol: string;
  direction: SignalDirection;
  entry: number;
  sl: number; // Stop Loss
  tp: number; // Take Profit
  confidence: number; // 0-100 胜率/置信度
  timeframe: SignalTimeframe;
  time: string; // 显示时间（如 "2h ago"）
  timestamp?: number; // 时间戳（可选，用于排序）
  rrr: string; // Risk Reward Ratio (如 "1:1.6")
  status: SignalStatus;
  tags: string[]; // 标签：["Trend", "Breakout", "AI-High"]
}

// 用户交易状态
export type UserTradingStatus = "not_verified" | "not_funded" | "ready";

export interface UserSignalState {
  status: UserTradingStatus;
  savedIds: Set<string | number>;
}

// 置信度颜色配置
export interface ConfidenceColor {
  text: string;
  bg: string;
  border: string;
  stroke: string;
}

export const getConfidenceColor = (confidence: number): ConfidenceColor => {
  if (confidence >= 85) {
    return {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      stroke: "stroke-emerald-500",
    };
  }
  if (confidence >= 70) {
    return {
      text: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
      stroke: "stroke-blue-500",
    };
  }
  return {
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    stroke: "stroke-amber-500",
  };
};

// 方向颜色配置
export const getDirectionColor = (direction: SignalDirection) => {
  return direction === "BUY"
    ? {
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        gradient: "from-emerald-500 to-emerald-300",
        bar: "bg-emerald-500",
      }
    : {
        text: "text-red-700",
        bg: "bg-red-50",
        border: "border-red-200",
        gradient: "from-red-500 to-red-300",
        bar: "bg-red-500",
      };
};

// 状态颜色配置
export const getStatusColor = (status: SignalStatus) => {
  return status === "active"
    ? {
        text: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
      }
    : status === "pending"
      ? {
          text: "text-amber-700",
          bg: "bg-amber-50",
          border: "border-amber-200",
          dot: "bg-amber-500",
        }
      : {
          text: "text-gray-600",
          bg: "bg-gray-100",
          border: "border-gray-200",
          dot: "bg-gray-400",
        };
};

// 标签颜色配置
export const getTagColor = (tag: string) => {
  const tagLower = tag.toLowerCase();
  if (tagLower === "ai-high" || tagLower === "ai-high") {
    return {
      text: "text-blue-700",
      bg: "bg-blue-50",
      border: "border-blue-200",
    };
  }
  if (["trend", "breakout", "momentum"].includes(tagLower)) {
    return {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    };
  }
  if (["reversal", "support/resistance"].includes(tagLower)) {
    return {
      text: "text-purple-700",
      bg: "bg-purple-50",
      border: "border-purple-200",
    };
  }
  return {
    text: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
  };
};
