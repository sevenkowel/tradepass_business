"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  delay?: number;
  progressColor?: "blue" | "green" | "red" | "orange" | "purple" | "default";
  progressValue?: number;
}

export function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  delay = 0,
  progressColor = "default",
  progressValue,
}: StatCardProps) {
  const isPositive = change === undefined ? undefined : change > 0;
  const isNegative = change === undefined ? undefined : change < 0;

  const colorMap = {
    blue:    { icon: "text-blue-500",    bg: "bg-blue-500/10",    border: "border-blue-500/20",   bar: "bg-blue-500"   },
    green:   { icon: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "bg-emerald-500" },
    red:     { icon: "text-rose-500",    bg: "bg-rose-500/10",    border: "border-rose-500/20",    bar: "bg-rose-500"    },
    orange:  { icon: "text-amber-500",   bg: "bg-amber-500/10",   border: "border-amber-500/20",  bar: "bg-amber-500"  },
    purple:  { icon: "text-violet-500",  bg: "bg-violet-500/10",  border: "border-violet-500/20", bar: "bg-violet-500" },
    default: { icon: "text-[var(--tp-accent)]", bg: "bg-[var(--tp-accent)]/10", border: "border-[var(--tp-accent)]/20", bar: "bg-[var(--tp-accent)]" },
  };

  const c = colorMap[progressColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -2 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-5">
          {/* Icon + badge row */}
          <div className="flex items-start justify-between mb-4">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center border", c.bg, c.border)}>
              <Icon size={20} className={c.icon} />
            </div>
            {change !== undefined && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full",
                isPositive && "bg-emerald-500/10 text-emerald-600",
                isNegative && "bg-rose-500/10 text-rose-600",
                !isPositive && !isNegative && "bg-[var(--tp-muted)]/10 text-[var(--tp-muted)]"
              )}>
                {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : null}
                {isPositive && "+"}
                {change}%
              </div>
            )}
          </div>

          {/* Value */}
          <p className="text-2xl font-bold text-[var(--tp-fg)] tracking-tight">{value}</p>

          {/* Title */}
          <p className="text-sm text-[var(--tp-muted)] mt-1">{title}</p>

          {/* Change label */}
          {changeLabel && (
            <p className="text-xs text-[var(--tp-muted)]/70 mt-0.5">{changeLabel}</p>
          )}

          {/* Progress bar */}
          {progressValue !== undefined && (
            <div className="mt-4">
              <div className="w-full h-1.5 bg-[var(--tp-border)] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressValue, 100)}%` }}
                  transition={{ duration: 0.8, delay: delay + 0.2 }}
                  className={cn("h-full rounded-full", c.bar)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
