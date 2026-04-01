"use client";

import { motion } from "framer-motion";
import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  delay?: number;
  size?: "sm" | "md" | "lg";
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-[var(--color-primary)]",
  iconBg = "bg-[var(--color-primary)]/5",
  delay = 0,
  size = "md",
}: StatCardProps) {
  const isPositive = change !== undefined ? change >= 0 : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -1, transition: { duration: 0.15 } }}
      className={cn(
        "relative rounded-xl p-4 cursor-default overflow-hidden",
        "bg-[var(--surface)] border border-[var(--border)]",
        "hover:border-[var(--color-primary)]/20 hover:shadow-sm transition-all duration-200",
        size === "sm" && "p-3",
        size === "lg" && "p-5"
      )}
    >
      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--foreground)]/60 mb-1">{title}</p>
          <p
            className={cn(
              "font-semibold text-[var(--foreground)] tracking-tight",
              size === "sm" ? "text-lg" : size === "lg" ? "text-2xl" : "text-xl"
            )}
          >
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1.5 mt-1.5">
              {isPositive ? (
                <TrendingUp size={12} className="text-[var(--color-success)]" />
              ) : (
                <TrendingDown size={12} className="text-[var(--color-error)]" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  isPositive ? "text-[var(--color-success)]" : "text-[var(--color-error)]"
                )}
              >
                {isPositive ? "+" : ""}
                {change.toFixed(2)}%
              </span>
              {changeLabel && (
                <span className="text-[11px] text-[var(--foreground)]/40">{changeLabel}</span>
              )}
            </div>
          )}
        </div>

        <div className={cn("p-2 rounded-lg shrink-0", iconBg)}>
          <Icon size={size === "sm" ? 16 : size === "lg" ? 22 : 18} className={iconColor} />
        </div>
      </div>
    </motion.div>
  );
}
