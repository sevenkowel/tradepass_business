"use client";

import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Target, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Signal {
  id: string;
  symbol: string;
  direction: "buy" | "sell" | "neutral";
  title: string;
  confidence: number;
  time: string;
}

const mockSignals: Signal[] = [
  {
    id: "1",
    symbol: "XAU/USD",
    direction: "buy",
    title: "黄金突破关键阻力位",
    confidence: 85,
    time: "10分钟前",
  },
  {
    id: "2",
    symbol: "USOIL",
    direction: "sell",
    title: "原油形成双顶形态",
    confidence: 72,
    time: "25分钟前",
  },
  {
    id: "3",
    symbol: "EUR/USD",
    direction: "buy",
    title: "欧元触及支撑位反弹",
    confidence: 68,
    time: "1小时前",
  },
];

const directionConfig = {
  buy: {
    icon: TrendingUp,
    bgColor: "bg-emerald-100",
    iconColor: "text-emerald-600",
    label: "看涨",
  },
  sell: {
    icon: TrendingDown,
    bgColor: "bg-rose-100",
    iconColor: "text-rose-600",
    label: "看跌",
  },
  neutral: {
    icon: AlertCircle,
    bgColor: "bg-slate-100",
    iconColor: "text-slate-600",
    label: "观望",
  },
};

export function AISignals() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-full"
    >
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">AI Signals</h3>
        </div>
        <Link
          href="/portal/insights/ai-signals"
          className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-0.5 transition-colors"
        >
          查看全部
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* 信号列表 */}
      <div className="space-y-3">
        {mockSignals.map((signal, index) => {
          const config = directionConfig[signal.direction];
          const Icon = config.icon;
          return (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 ${config.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon size={14} className={config.iconColor} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{signal.symbol}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{signal.title}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Target size={12} />
                    <span>{signal.confidence}%</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{signal.time}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
