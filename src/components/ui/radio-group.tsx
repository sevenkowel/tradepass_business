"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-3", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "group flex items-center gap-3 text-sm font-medium text-slate-700 transition-all",
        "focus:outline-none",
        className
      )}
      {...props}
    >
      {/* 圆形 Radio 指示器 - 与 Checkbox 的方形明显区分 */}
      <div className={cn(
        // 圆形外观
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
        // 边框样式
        "border-2 border-slate-300 bg-white",
        // 悬停效果
        "group-hover:border-slate-400",
        // 焦点样式
        "group-focus-visible:ring-2 group-focus-visible:ring-[var(--tp-primary)] group-focus-visible:ring-offset-2",
        // 选中状态
        "group-data-[state=checked]:border-[var(--tp-primary)] group-data-[state=checked]:bg-white",
        // 过渡动画
        "transition-all duration-150 ease-in-out"
      )}>
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          {/* 圆点填充 - Radio 特有 */}
          <div className="h-2.5 w-2.5 rounded-full bg-[var(--tp-primary)]" />
        </RadioGroupPrimitive.Indicator>
      </div>
      {children}
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
