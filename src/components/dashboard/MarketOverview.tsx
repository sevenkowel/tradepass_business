"use client";

import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const mockMarketData: MarketData[] = [
  { symbol: "XAU/USD", name: "黄金", price: 2034.50, change: 12.30, changePercent: 0.61 },
  { symbol: "EUR/USD", name: "欧元/美元", price: 1.0852, change: 0.0012, changePercent: 0.11 },
  { symbol: "USOIL", name: "原油", price: 78.45, change: -0.85, changePercent: -1.07 },
];

export function MarketOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-full"
    >
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">市场概览</h3>
        </div>
        <Link
          href="/portal/market"
          className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-0.5 transition-colors"
        >
          查看行情
          <TrendingUp size={14} />
        </Link>
      </div>

      {/* 行情列表 */}
      <div className="space-y-3">
        {mockMarketData.map((item, index) => {
          const isUp = item.change >= 0;
          return (
            <motion.div
              key={item.symbol}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{item.symbol}</p>
                <p className="text-xs text-slate-400">{item.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {item.price.toFixed(item.symbol.includes("XAU") ? 2 : 4)}
                </p>
                <p className={`text-xs flex items-center justify-end gap-0.5 ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
                  {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {isUp ? "+" : ""}{item.changePercent.toFixed(2)}%
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
