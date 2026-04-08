"use client";

/**
 * 账户数量切换工具
 * 在开发工具箱中使用，快速切换 1个/3个账户
 */

import { useDevConfig } from "@/lib/dev-config";
import { Check, Wallet, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// 账户数量选项
const accountOptions = [
  { id: "single", label: "1个账户", count: 1, icon: Wallet },
  { id: "multiple", label: "3个账户", count: 3, icon: Users },
];

export function AccountCountSwitcher() {
  const { currentPerspective, setAccountCount, accountCount } = useDevConfig();

  // 获取当前账户数量
  const currentCount = currentPerspective.accounts.length;

  return (
    <div className="space-y-3">
      {/* 当前状态 */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 mb-1">当前账户</p>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-600">
            <Wallet size={16} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {currentCount} 个交易账户
            </p>
            <p className="text-xs text-gray-500">
              {currentPerspective.accounts.map(a => a.currency).join(" / ") || "无账户"}
            </p>
          </div>
        </div>
      </div>

      {/* 切换选项 */}
      <div className="space-y-1">
        {accountOptions.map((option) => {
          const Icon = option.icon;
          const isActive = currentCount === option.count;

          return (
            <button
              key={option.id}
              onClick={() => setAccountCount(option.id as "single" | "multiple")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left",
                "transition-colors duration-150",
                isActive
                  ? "bg-gray-100 border border-gray-200"
                  : "hover:bg-gray-50 border border-transparent"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-md shrink-0",
                isActive ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"
              )}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm truncate",
                  isActive ? "font-medium text-gray-900" : "text-gray-700"
                )}>
                  {option.label}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {option.id === "single" ? "USD 账户" : "USD / EUR / JPY 账户"}
                </p>
              </div>
              {isActive && (
                <Check size={16} className="text-gray-900 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* 提示 */}
      <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
        切换后账户卡片将实时更新
      </p>
    </div>
  );
}
