"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  size?: "sm" | "md" | "lg"
  variant?: "default" | "success" | "error" | "warning"
  showValue?: boolean
  label?: string
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
}

const variantClasses = {
  default: "bg-blue-600",
  success: "bg-emerald-500",
  error: "bg-red-500",
  warning: "bg-amber-500",
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      size = "md",
      variant = "default",
      showValue = false,
      label,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))

    return (
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {(label || showValue) && (
          <div className="flex justify-between mb-2">
            {label && (
              <span className="text-sm font-medium text-slate-700">{label}</span>
            )}
            {showValue && (
              <span className="text-sm text-slate-500">{Math.round(percentage)}%</span>
            )}
          </div>
        )}
        <div
          className={cn(
            "w-full overflow-hidden rounded-full bg-slate-100",
            sizeClasses[size]
          )}
        >
          <div
            className={cn(
              "h-full transition-all duration-300 ease-out rounded-full",
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
