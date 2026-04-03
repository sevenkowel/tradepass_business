"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200",
        primary:
          "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200",
        secondary:
          "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-200",
        success:
          "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
        warning:
          "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200",
        error:
          "border-transparent bg-red-100 text-red-700 hover:bg-red-200",
        info:
          "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-200",
        outline: "text-slate-700 border-slate-200",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "mr-1.5 h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-emerald-500",
            variant === "error" && "bg-red-500",
            variant === "warning" && "bg-amber-500",
            variant === "info" && "bg-blue-500",
            variant === "primary" && "bg-blue-500",
            (!variant || variant === "default" || variant === "secondary" || variant === "outline") && "bg-slate-500"
          )}
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
