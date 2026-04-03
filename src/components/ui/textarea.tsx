"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | boolean
  showCount?: boolean
  maxLength?: number
  resize?: "none" | "vertical" | "horizontal" | "both"
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, error, showCount, maxLength, resize = "vertical", ...props },
    ref
  ) => {
    const value = props.value || ""
    const currentLength = typeof value === "string" ? value.length : 0

    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            "flex min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50",
            resize === "none" && "resize-none",
            resize === "vertical" && "resize-y",
            resize === "horizontal" && "resize-x",
            resize === "both" && "resize",
            error && "border-red-300 focus:border-red-300 focus:ring-red-100",
            className
          )}
          ref={ref}
          maxLength={maxLength}
          {...props}
        />
        {(showCount || error) && (
          <div className="flex justify-between mt-1.5">
            {error && typeof error === "string" ? (
              <span className="text-xs text-red-500">{error}</span>
            ) : (
              <span />
            )}
            {showCount && maxLength && (
              <span className="text-xs text-slate-400">
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
