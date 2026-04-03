"use client";

import { Lock } from "lucide-react";
import { Label } from "@/components/ui/label";
import type { FieldConfig } from "@/lib/kyc/field-config";

interface OCRFieldLockedProps {
  config: FieldConfig;
  value: string | undefined;
}

export function OCRFieldLocked({ config, value }: OCRFieldLockedProps) {
  const displayValue = value || "-";

  // 格式化日期显示
  const formatValue = (val: string): string => {
    if (config.type === "date" && val && val !== "-") {
      try {
        const date = new Date(val);
        return date.toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch {
        return val;
      }
    }
    return val;
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-sm font-medium text-[rgba(var(--tp-fg-rgb),0.7)]">
        <Lock className="w-3.5 h-3.5 text-[rgba(var(--tp-fg-rgb),0.4)]" />
        {config.labelCn}
        <span className="text-xs text-[rgba(var(--tp-fg-rgb),0.4)]">
          ({config.label})
        </span>
      </Label>
      <div className="relative">
        <div
          className="w-full px-3 py-2.5 rounded-lg bg-[rgba(var(--tp-fg-rgb),0.05)] border border-[rgba(var(--tp-fg-rgb),0.08)] text-[rgb(var(--tp-fg-rgb))] text-sm select-all"
          title={displayValue}
        >
          {formatValue(displayValue)}
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Lock className="w-4 h-4 text-[rgba(var(--tp-fg-rgb),0.3)]" />
        </div>
      </div>
    </div>
  );
}
