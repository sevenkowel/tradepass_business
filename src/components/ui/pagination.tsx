"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./Button"

interface PaginationProps {
  current: number
  pageSize: number
  total: number
  onChange?: (page: number, pageSize: number) => void
  showSizeChanger?: boolean
  showQuickJumper?: boolean
  showTotal?: (total: number, range: [number, number]) => React.ReactNode
  pageSizeOptions?: number[]
  disabled?: boolean
  className?: string
}

const Pagination = ({
  current,
  pageSize,
  total,
  onChange,
  showSizeChanger = false,
  showQuickJumper = false,
  showTotal,
  pageSizeOptions = [10, 20, 50, 100],
  disabled = false,
  className,
}: PaginationProps) => {
  const totalPages = Math.ceil(total / pageSize)
  const startItem = (current - 1) * pageSize + 1
  const endItem = Math.min(current * pageSize, total)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (current >= totalPages - 3) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === current || disabled) return
    onChange?.(page, pageSize)
  }

  const handleSizeChange = (newSize: number) => {
    const newPage = Math.min(current, Math.ceil(total / newSize))
    onChange?.(newPage, newSize)
  }

  if (total === 0) return null

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {showTotal && (
        <div className="text-sm text-slate-500">
          {showTotal(total, [startItem, endItem])}
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Previous */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(current - 1)}
          disabled={current === 1 || disabled}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className="px-2 py-1 text-slate-400">
                  <MoreHorizontal className="h-4 w-4" />
                </span>
              ) : (
                <Button
                  variant={current === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page as number)}
                  disabled={disabled}
                  className="min-w-[32px]"
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(current + 1)}
          disabled={current === totalPages || disabled}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Size Changer */}
        {showSizeChanger && (
          <select
            value={pageSize}
            onChange={(e) => handleSizeChange(Number(e.target.value))}
            disabled={disabled}
            className="ml-2 h-8 rounded-md border border-slate-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} 条/页
              </option>
            ))}
          </select>
        )}

        {/* Quick Jumper */}
        {showQuickJumper && (
          <div className="flex items-center gap-2 ml-2">
            <span className="text-sm text-slate-500">跳至</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              defaultValue={current}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const value = parseInt((e.target as HTMLInputElement).value)
                  handlePageChange(value)
                }
              }}
              disabled={disabled}
              className="h-8 w-16 rounded-md border border-slate-200 px-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
            />
            <span className="text-sm text-slate-500">页</span>
          </div>
        )}
      </div>
    </div>
  )
}

export { Pagination }
