"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Newspaper, TrendingUp, TrendingDown, Target, Shield } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TestUser, getAISignalQuota } from "@/lib/test-users";

interface AISignal {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL";
  entry: number;
  tp: number;
  sl: number;
  confidence: number;
  timeframe: string;
}

interface MarketNews {
  id: string;
  title: string;
  impact: "high" | "medium" | "low";
  summary: string;
}

const mockSignals: AISignal[] = [
  {
    id: "1",
    symbol: "EURUSD",
    direction: "BUY",
    entry: 1.082,
    tp: 1.09,
    sl: 1.078,
    confidence: 87,
    timeframe: "H4",
  },
  {
    id: "2",
    symbol: "XAUUSD",
    direction: "SELL",
    entry: 2345.5,
    tp: 2320.0,
    sl: 2360.0,
    confidence: 74,
    timeframe: "H1",
  },
  {
    id: "3",
    symbol: "BTCUSDT",
    direction: "BUY",
    entry: 68200,
    tp: 71000,
    sl: 66500,
    confidence: 91,
    timeframe: "D1",
  },
];

const mockNews: MarketNews[] = [
  {
    id: "1",
    title: "黄金突破2000关口",
    impact: "high",
    summary: "地缘政治风险推动避险需求",
  },
  {
    id: "2",
    title: "美联储暗示暂停加息",
    impact: "high",
    summary: "美元指数承压，非美货币走强",
  },
  {
    id: "3",
    title: "原油库存意外增加",
    impact: "medium",
    summary: "油价短期承压，关注OPEC+动向",
  },
];

interface MarketInsightsProps {
  user: TestUser;
}

export function MarketInsights({ user }: MarketInsightsProps) {
  const [activeTab, setActiveTab] = useState<"signals" | "news">("signals");
  const quota = getAISignalQuota(user);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35 }}
      className="bg-white rounded-2xl border-2 border-gray-200 p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="text-lg">📊</span>
          市场机会
        </h2>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("signals")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
              activeTab === "signals"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            AI信号
          </button>
          <button
            onClick={() => setActiveTab("news")}
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-md transition-all",
              activeTab === "news"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            热门资讯
          </button>
        </div>
      </div>

      {/* Quota Info */}
      <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 rounded-xl">
        <span className="text-xs text-blue-700 font-medium">
          今日剩余 {quota.remaining} 次 AI 信号
        </span>
        <Link
          href="/portal/ai-signals/limits"
          className="text-xs text-blue-600 hover:underline"
        >
          查看配额
        </Link>
      </div>

      {/* Content */}
      {activeTab === "signals" ? (
        <div className="space-y-3">
          {mockSignals.map((signal) => (
            <div
              key={signal.id}
              className="p-4 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-xs font-bold px-2.5 py-1 rounded-lg",
                      signal.direction === "BUY"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {signal.direction === "BUY" ? (
                      <TrendingUp size={12} className="inline mr-1" />
                    ) : (
                      <TrendingDown size={12} className="inline mr-1" />
                    )}
                    {signal.direction}
                  </span>
                  <span className="font-bold text-gray-800">{signal.symbol}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {signal.timeframe}
                  </span>
                </div>
                <div
                  className={cn(
                    "text-sm font-bold px-3 py-1 rounded-lg",
                    signal.confidence >= 80
                      ? "bg-blue-600 text-white"
                      : "bg-blue-100 text-blue-700"
                  )}
                >
                  {signal.confidence}%
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div className="bg-gray-50 rounded-lg p-2">
                  <span className="text-gray-400">Entry</span>
                  <p className="font-semibold text-gray-800">{signal.entry}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2">
                  <span className="text-emerald-600">TP</span>
                  <p className="font-semibold text-emerald-700">{signal.tp}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2">
                  <span className="text-red-600">SL</span>
                  <p className="font-semibold text-red-700">{signal.sl}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  一键交易
                </button>
                <Link
                  href={`/portal/ai-signals/${signal.id}`}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors text-center"
                >
                  查看详情
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {mockNews.map((news) => (
            <div
              key={news.id}
              className="p-4 rounded-xl border-2 border-gray-100 hover:border-amber-200 transition-all"
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "text-xs font-bold px-2 py-1 rounded shrink-0",
                    news.impact === "high"
                      ? "bg-red-100 text-red-700"
                      : news.impact === "medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  )}
                >
                  {news.impact === "high"
                    ? "High"
                    : news.impact === "medium"
                    ? "Medium"
                    : "Low"}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-gray-800 mb-1">
                    {news.title}
                  </h3>
                  <p className="text-xs text-gray-500">{news.summary}</p>
                </div>
              </div>
              <button className="mt-3 w-full py-2 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition-colors">
                查看交易机会
              </button>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/portal/ai-signals/feed"
        className="mt-4 block text-center text-xs text-blue-600 hover:underline"
      >
        查看更多市场机会 →
      </Link>
    </motion.div>
  );
}
