"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  circle?: boolean
}

function Skeleton({ className, circle, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200",
        circle && "rounded-full",
        !circle && "rounded-md",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
