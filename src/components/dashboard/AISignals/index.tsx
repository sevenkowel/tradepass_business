"use client";

import { useState } from "react";
import { Flame, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SignalCard } from "@/components/ai-signals";
import { getRecommendedSignals, AISignal, UserTradingStatus } from "@/lib/ai-signals";
import { TradeModal } from "./TradeModal";

interface AISignalsProps {
  userStatus?: UserTradingStatus;
}

export function AISignals({ userStatus = "ready" }: AISignalsProps) {
  const [selectedSignal, setSelectedSignal] = useState<AISignal | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);

  // 使用共享数据获取推荐信号（高置信度前3）
  const signals = getRecommendedSignals(3);

  const handleTrade = (signal: AISignal) => {
    setSelectedSignal(signal);
    setIsTradeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsTradeModalOpen(false);
    setSelectedSignal(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-full"
      >
        {/* 模块头部 */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <Flame size={18} className="text-white" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">AI Signals</h3>
            </div>
            <p className="text-xs text-slate-500 ml-10">
              今日推荐信号
              <span className="text-slate-400 ml-1">· 仅展示3条优质机会</span>
            </p>
          </div>
          <Link
            href="/portal/ai-signals/feed"
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-0.5 transition-colors shrink-0"
          >
            查看全部
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* 信号卡片区域 - 横向排列3张，大屏更舒展 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {signals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              variant="compact"
              userStatus={userStatus}
              showTradeButton
              onTrade={() => handleTrade(signal)}
            />
          ))}
        </div>

        {/* 模块级 CTA */}
        <div className="mt-4 text-center">
          <Link
            href="/portal/ai-signals/feed"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <Sparkles size={14} />
            查看更多信号
            <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>

      {/* 交易弹窗 */}
      <TradeModal
        isOpen={isTradeModalOpen}
        onClose={handleCloseModal}
        signal={selectedSignal}
        userStatus={userStatus}
      />
    </>
  );
}
