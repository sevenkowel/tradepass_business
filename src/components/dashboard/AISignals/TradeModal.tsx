"use client";

import { useState, useEffect } from "react";
import { X, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { AISignal, UserTradingStatus } from "@/lib/ai-signals";

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: AISignal | null;
  userStatus: UserTradingStatus;
}

// 方向配置
const directionConfig = {
  BUY: {
    icon: TrendingUp,
    label: "买入",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  SELL: {
    icon: TrendingDown,
    label: "卖出",
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
  },
};

export function TradeModal({ isOpen, onClose, signal, userStatus }: TradeModalProps) {
  const [lotSize, setLotSize] = useState(0.1);
  const [tp, setTp] = useState<number>(0);
  const [sl, setSl] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 当信号变化时，预填参数
  useEffect(() => {
    if (signal) {
      setTp(signal.tp);
      setSl(signal.sl);
    }
  }, [signal]);

  if (!signal) return null;

  const config = directionConfig[signal.direction];
  const DirectionIcon = config.icon;

  // 计算预计保证金和收益
  const calculateMargin = () => {
    // 简化计算：假设杠杆 1:100，保证金 = 手数 * 价格 / 100
    return Math.round(lotSize * signal.entry * 10) / 10;
  };

  const calculateProfit = () => {
    const diff = Math.abs(tp - signal.entry);
    const isForexOrGold = signal.symbol.includes("/") || signal.symbol === "XAUUSD" || signal.symbol === "XAU/USD";
    const pips = isForexOrGold
      ? signal.symbol === "XAUUSD" || signal.symbol === "XAU/USD"
        ? Math.round(diff * 10)
        : Math.round(diff * 10000)
      : Math.round(diff * 100) / 100;
    // 每 pip 价值约 $1（简化）
    const profit = Math.round(pips * lotSize * 10);
    return { pips, profit };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSuccess(true);
    // 2秒后关闭
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  // 如果用户未就绪，显示引导
  if (userStatus !== "ready") {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={onClose}
            />
            {/* 弹窗 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 p-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {userStatus === "not_verified" ? "需要完成认证" : "需要入金"}
                </h3>
                <p className="text-slate-500 mb-6">
                  {userStatus === "not_verified"
                    ? "完成身份认证后即可开始交易"
                    : "入金后即可解锁交易功能"}
                </p>
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={onClose}>
                    稍后再说
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      // 跳转到相应页面
                      window.location.href =
                        userStatus === "not_verified" ? "/portal/kyc" : "/portal/deposit";
                    }}
                  >
                    {userStatus === "not_verified" ? "去认证" : "去入金"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  const profit = calculateProfit();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          {/* 弹窗 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50"
          >
            {isSuccess ? (
              /* 成功状态 */
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle size={32} className="text-emerald-600" />
                </motion.div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">下单成功</h3>
                <p className="text-slate-500">您的交易订单已提交</p>
              </div>
            ) : (
              /* 交易表单 */
              <>
                {/* 头部 */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-900">快速交易</h3>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X size={20} className="text-slate-400" />
                  </button>
                </div>

                {/* 信号信息 */}
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${config.bgColor} ${config.borderColor} border rounded-lg flex items-center justify-center`}>
                      <DirectionIcon size={20} className={config.color} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{signal.symbol}</span>
                        <span className={`text-sm ${config.color}`}>{config.label}</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        胜率 {signal.confidence}% · 信号强度
                        {signal.confidence >= 85 ? "强" : signal.confidence >= 70 ? "中" : "弱"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 表单 */}
                <div className="p-4 space-y-4">
                  {/* 手数 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">交易手数</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setLotSize(Math.max(0.01, lotSize - 0.01))}
                        className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={lotSize}
                        onChange={(e) => setLotSize(parseFloat(e.target.value) || 0)}
                        step={0.01}
                        min={0.01}
                        className="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-center font-mono"
                      />
                      <button
                        onClick={() => setLotSize(lotSize + 0.01)}
                        className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 止盈 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      止盈 (TP)
                      <span className="text-xs text-slate-400 ml-1">← 信号推荐</span>
                    </label>
                    <input
                      type="number"
                      value={tp}
                      onChange={(e) => setTp(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 font-mono"
                    />
                  </div>

                  {/* 止损 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      止损 (SL)
                      <span className="text-xs text-slate-400 ml-1">← 信号推荐</span>
                    </label>
                    <input
                      type="number"
                      value={sl}
                      onChange={(e) => setSl(parseFloat(e.target.value) || 0)}
                      className="w-full h-10 px-3 rounded-lg border border-slate-200 font-mono"
                    />
                  </div>

                  {/* 预估信息 */}
                  <div className="bg-slate-50 rounded-lg p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">预计保证金</span>
                      <span className="font-mono">${calculateMargin()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">预计收益</span>
                      <span className="font-mono text-emerald-600">
                        +{profit.pips} pips (+${profit.profit})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 底部 */}
                <div className="p-4 border-t border-slate-100 space-y-3">
                  <Button
                    className="w-full h-11"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "提交中..." : "确认下单"}
                  </Button>
                  <p className="text-xs text-slate-400 text-center">
                    💡 基于 AI Signals 信号生成
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
