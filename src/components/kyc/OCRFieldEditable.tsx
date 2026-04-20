"use client";

import { useState, useCallback } from "react";
import { AlertCircle, Check, Edit2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { FieldConfig } from "@/lib/kyc/field-config";

interface OCRFieldEditableProps {
  config: FieldConfig;
  originalValue: string | undefined;
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
  similarity?: number; // 姓名相似度（仅用于姓名字段）
}

// Extracted to module level to avoid "Cannot create components during render"
interface SimilarityIndicatorProps {
  similarity: number | undefined;
  fieldKey: string;
}

function SimilarityIndicator({ similarity, fieldKey }: SimilarityIndicatorProps) {
  if (similarity === undefined || fieldKey !== "fullName") return null;

  const isGood = similarity >= 0.8;
  const isWarning = similarity >= 0.6 && similarity < 0.8;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs mt-1.5",
        isGood && "text-green-600",
        isWarning && "text-[#d97706]",
        !isGood && !isWarning && "text-red-600"
      )}
    >
      {isGood ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5" />
      )}
      <span>
        与OCR识别相似度: {Math.round(similarity * 100)}%
        {isGood && " (通过)"}
        {isWarning && " (需确认)"}
        {!isGood && !isWarning && " (不匹配)"}
      </span>
    </div>
  );
}

interface ChangeIndicatorProps {
  hasChanged: boolean;
  originalValue: string | undefined;
}

function ChangeIndicator({ hasChanged, originalValue }: ChangeIndicatorProps) {
  if (!hasChanged) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs text-[#d97706] mt-1.5">
      <Edit2 className="w-3 h-3" />
      <span>已修改 (原值: {originalValue || "-"})</span>
    </div>
  );
}

export function OCRFieldEditable({
  config,
  originalValue,
  value,
  onChange,
  error,
  similarity,
}: OCRFieldEditableProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasChanged = value !== originalValue;

  // 处理值变化
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  return (
    <div className="space-y-2">
      <Label
        htmlFor={config.key}
        className={cn(
          "flex items-center gap-2 text-sm font-medium",
          error ? "text-red-500" : "text-[rgb(var(--tp-fg-rgb))]"
        )}
      >
        {config.labelCn}
        <span className="text-xs text-[rgba(var(--tp-fg-rgb),0.4)]">
          ({config.label})
        </span>
        {config.required && (
          <span className="text-red-500">*</span>
        )}
      </Label>

      <div className="relative">
        {config.type === "textarea" ? (
          <Textarea
            id={config.key}
            value={value || ""}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={config.placeholder}
            className={cn(
              "min-h-[80px] resize-none transition-all duration-200",
              error
                ? "border-red-500 focus:border-red-500 focus-visible:border-red-500 focus:ring-red-500/20 focus-visible:ring-red-500/20"
                : "border-[#fbbf24] focus:border-[#fbbf24] focus-visible:border-[#fbbf24] focus:ring-[#fbbf24]/20 focus-visible:ring-[#fbbf24]/20"
            )}
          />
        ) : (
          <Input
            id={config.key}
            type={config.type === "date" ? "date" : "text"}
            value={value || ""}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={config.placeholder}
            className={cn(
              "transition-all duration-200",
              error
                ? "border-red-500 focus:border-red-500 focus-visible:border-red-500 focus:ring-red-500/20 focus-visible:ring-red-500/20"
                : "border-[#fbbf24] focus:border-[#fbbf24] focus-visible:border-[#fbbf24] focus:ring-[#fbbf24]/20 focus-visible:ring-[#fbbf24]/20"
            )}
          />
        )}

        {/* 修改指示点 */}
        {hasChanged && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#fbbf24' }} />
          </div>
        )}
      </div>

      {/* 字段说明 */}
      {config.description && isFocused && (
        <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">
          {config.description}
        </p>
      )}

      {/* 错误提示 */}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="w-3.5 h-3.5" />
          {error}
        </p>
      )}

      {/* 相似度指示 */}
      <SimilarityIndicator similarity={similarity} fieldKey={config.key} />

      {/* 修改提示 */}
      <ChangeIndicator hasChanged={hasChanged} originalValue={originalValue} />
    </div>
  );
}
