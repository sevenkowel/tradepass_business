"use client";

import { motion } from "framer-motion";
import {
  Bookmark,
  BookmarkCheck,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AISignal,
  getConfidenceColor,
  getDirectionColor,
  getStatusColor,
  getTagColor,
  UserTradingStatus,
} from "@/lib/ai-signals";

export interface SignalCardProps {
  signal: AISignal;
  saved?: boolean;
  onSave?: () => void;
  onTrade?: () => void;
  variant?: "default" | "compact" | "minimal";
  userStatus?: UserTradingStatus;
  showTradeButton?: boolean;
}

export function SignalCard({
  signal,
  saved = false,
  onSave,
  onTrade,
  variant = "default",
  userStatus = "ready",
  showTradeButton = false,
}: SignalCardProps) {
  const isBuy = signal.direction === "BUY";
  const conf = getConfidenceColor(signal.confidence);
  const dir = getDirectionColor(signal.direction);
  const status = getStatusColor(signal.status);

  // Compact 模式（Dashboard 用）
  if (variant === "compact") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className="rounded-xl bg-white border border-gray-200 hover:border-blue-300 transition-all overflow-hidden h-full"
      >
        {/* Header bar */}
        <div className={cn("h-1 w-full bg-gradient-to-r", dir.gradient)} />

        <div className="p-4 xl:p-5">
          {/* Top row */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-base text-gray-900">
                  {signal.symbol}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                    dir.bg,
                    dir.text,
                    dir.border
                  )}
                >
                  {isBuy ? "做多" : "做空"}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {signal.tags.slice(0, 2).map((tag) => {
                  const tagColor = getTagColor(tag);
                  return (
                    <span
                      key={tag}
                      className={cn(
                        "text-[9px] px-1 py-0.5 rounded font-medium border",
                        tagColor.bg,
                        tagColor.text,
                        tagColor.border
                      )}
                    >
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Confidence ring */}
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  className={conf.stroke}
                  strokeWidth="3"
                  strokeDasharray={`${(signal.confidence / 100) * 100.5} 100.5`}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={cn(
                  "absolute inset-0 flex items-center justify-center text-[10px] font-bold",
                  conf.text
                )}
              >
                {signal.confidence}%
              </span>
            </div>
          </div>

          {/* Entry / SL / TP */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "入场", value: signal.entry, color: "text-gray-900" },
              { label: "止损", value: signal.sl, color: "text-red-600" },
              { label: "止盈", value: signal.tp, color: "text-emerald-600" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="p-2 rounded-lg bg-gray-50 border border-gray-100 text-center"
              >
                <p className="text-[9px] xl:text-[10px] text-gray-400 mb-0.5">{label}</p>
                <p
                  className={cn(
                    "text-xs xl:text-sm font-semibold font-mono truncate",
                    color
                  )}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              <span className="flex items-center gap-0.5">
                <Target size={10} />
                R:R {signal.rrr}
              </span>
              <span className="flex items-center gap-0.5">
                <Clock size={10} />
                {signal.time}
              </span>
            </div>

            {showTradeButton && (
              <TradeButton
                userStatus={userStatus}
                onClick={onTrade}
                size="sm"
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Minimal 模式（列表用）
  if (variant === "minimal") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ backgroundColor: "rgba(249, 250, 251, 1)" }}
        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-all cursor-pointer"
        onClick={onTrade}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              dir.bg
            )}
          >
            {isBuy ? (
              <TrendingUp size={16} className={dir.text} />
            ) : (
              <TrendingDown size={16} className={dir.text} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900">
                {signal.symbol}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded",
                  dir.bg,
                  dir.text
                )}
              >
                {isBuy ? "做多" : "做空"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-500">
              <span>胜率 {signal.confidence}%</span>
              <span>·</span>
              <span>{signal.time}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-mono text-gray-900">{signal.entry}</p>
            <p className="text-[10px] text-emerald-600">目标 {signal.tp}</p>
          </div>
          {onSave && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onSave();
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {saved ? (
                <BookmarkCheck size={16} className="text-blue-600" />
              ) : (
                <Bookmark size={16} className="text-gray-400" />
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  // Default 模式（Feed 页面用）
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-300 transition-all overflow-hidden"
    >
      {/* Header bar */}
      <div className={cn("h-1 w-full bg-gradient-to-r", dir.gradient)} />

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-lg text-gray-900">
                {signal.symbol}
              </span>
              <span
                className={cn(
                  "text-xs font-bold px-2 py-0.5 rounded-lg border",
                  dir.bg,
                  dir.text,
                  dir.border
                )}
              >
                {signal.direction}
              </span>
              <span className="text-[11px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                {signal.timeframe}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {signal.tags.map((tag) => {
                const tagColor = getTagColor(tag);
                return (
                  <span
                    key={tag}
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded font-medium border",
                      tagColor.bg,
                      tagColor.text,
                      tagColor.border
                    )}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Confidence ring */}
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  fill="none"
                  className={conf.stroke}
                  strokeWidth="3"
                  strokeDasharray={`${(signal.confidence / 100) * 125.6} 125.6`}
                  strokeLinecap="round"
                />
              </svg>
              <span
                className={cn(
                  "absolute inset-0 flex items-center justify-center text-[11px] font-bold",
                  conf.text
                )}
              >
                {signal.confidence}%
              </span>
            </div>
            {onSave && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={onSave}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
              >
                {saved ? (
                  <BookmarkCheck size={16} className="text-blue-600" />
                ) : (
                  <Bookmark size={16} className="text-gray-400" />
                )}
              </motion.button>
            )}
          </div>
        </div>

        {/* Entry / SL / TP */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Entry", value: signal.entry, color: "text-gray-900" },
            { label: "Stop Loss", value: signal.sl, color: "text-red-600" },
            { label: "Take Profit", value: signal.tp, color: "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-center"
            >
              <p className="text-[10px] text-gray-400 mb-1">{label}</p>
              <p className={cn("text-sm font-semibold font-mono", color)}>
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Target size={11} />
              R:R {signal.rrr}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {signal.time}
            </span>
          </div>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium border",
              status.bg,
              status.text,
              status.border
            )}
          >
            {signal.status === "active" ? "● Active" : "Closed"}
          </span>
        </div>

        {/* Trade Button */}
        {showTradeButton && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <TradeButton
              userStatus={userStatus}
              onClick={onTrade}
              size="lg"
              fullWidth
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// 交易按钮组件
interface TradeButtonProps {
  userStatus: UserTradingStatus;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

function TradeButton({
  userStatus,
  onClick,
  size = "md",
  fullWidth = false,
}: TradeButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-sm",
  };

  if (userStatus === "not_verified") {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          "rounded-lg font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors",
          sizeClasses[size],
          fullWidth && "w-full"
        )}
      >
        完成认证后交易
      </motion.button>
    );
  }

  if (userStatus === "not_funded") {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          "rounded-lg font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors",
          sizeClasses[size],
          fullWidth && "w-full"
        )}
      >
        入金后解锁交易
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm",
        sizeClasses[size],
        fullWidth && "w-full"
      )}
    >
      立即交易
    </motion.button>
  );
}
