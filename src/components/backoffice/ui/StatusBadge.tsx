"use client";

import { cn } from "@/lib/utils";
import type { StatusType } from "@/types/backoffice";

// Status Badge Component
interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  size?: "sm" | "md";
  className?: string;
}

const statusConfig: Record<string, { type: StatusType; label: string }> = {
  // User Status
  active: { type: "success", label: "Active" },
  frozen: { type: "error", label: "Frozen" },
  pending: { type: "warning", label: "Pending" },
  closed: { type: "default", label: "Closed" },
  
  // KYC Status
  not_submitted: { type: "default", label: "Not Submitted" },
  approved: { type: "success", label: "Approved" },
  rejected: { type: "error", label: "Rejected" },
  supplement_required: { type: "warning", label: "Supplement Required" },
  
  // Order/Transaction Status
  open: { type: "info", label: "Open" },
  success: { type: "success", label: "Success" },
  failed: { type: "error", label: "Failed" },
  cancelled: { type: "default", label: "Cancelled" },
  refunded: { type: "warning", label: "Refunded" },
  processing: { type: "info", label: "Processing" },
  
  // Withdrawal Status
  初审通过: { type: "info", label: "初审通过" },
  复审通过: { type: "info", label: "复审通过" },
  executing: { type: "info", label: "Executing" },
  suspended: { type: "warning", label: "Suspended" },
  
  // Account Status
  deleted: { type: "default", label: "Deleted" },
  
  // Channel Status
  active_channel: { type: "success", label: "Active" },
  inactive: { type: "default", label: "Inactive" },
  maintenance: { type: "warning", label: "Maintenance" },
  
  // Order types
  buy: { type: "success", label: "Buy" },
  sell: { type: "error", label: "Sell" },
};

const typeStyles: Record<StatusType, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  default: "bg-gray-50 text-gray-600 border-gray-200",
};

export function StatusBadge({
  status,
  type,
  size = "sm",
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase()] || {
    type: type || "default",
    label: status,
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-medium border rounded-lg",
        typeStyles[config.type],
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        className
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full mr-1.5",
          config.type === "success" && "bg-emerald-500",
          config.type === "warning" && "bg-amber-500",
          config.type === "error" && "bg-red-500",
          config.type === "info" && "bg-blue-500",
          config.type === "pending" && "bg-amber-500",
          config.type === "default" && "bg-gray-400"
        )}
      />
      {config.label}
    </span>
  );
}

// Level Badge Component
interface LevelBadgeProps {
  level: string;
  className?: string;
}

const levelConfig: Record<string, { color: string; bg: string }> = {
  standard: { color: "text-gray-600", bg: "bg-gray-100" },
  vip: { color: "text-amber-600", bg: "bg-amber-100" },
  premium: { color: "text-purple-600", bg: "bg-purple-100" },
  enterprise: { color: "text-blue-600", bg: "bg-blue-100" },
};

export function LevelBadge({ level, className }: LevelBadgeProps) {
  const config = levelConfig[level.toLowerCase()] || levelConfig.standard;

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded uppercase tracking-wide",
        config.bg,
        config.color,
        className
      )}
    >
      {level}
    </span>
  );
}

// Type Badge Component (Buy/Sell)
interface TypeBadgeProps {
  type: "buy" | "sell";
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded",
        type === "buy"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-red-100 text-red-700",
        className
      )}
    >
      {type.toUpperCase()}
    </span>
  );
}
