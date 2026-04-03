"use client";

/**
 * 视角切换工具
 * 在开发工具箱中使用
 */

import { useDevConfig } from "@/lib/dev-config";
import { Check, User, Shield, Crown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// 视角图标映射
const perspectiveIcons: Record<string, React.ElementType> = {
  new: User,
  "kyc-pending": AlertCircle,
  "kyc-done": User,
  "account-opening-failed": AlertCircle,
  "account-rejected": AlertCircle,
  "no-deposit": User,
  "first-deposit": User,
  active: Shield,
  vip: Crown,
};

// 视角颜色映射
const perspectiveColors: Record<string, string> = {
  new: "bg-gray-100 text-gray-600",
  "kyc-pending": "bg-yellow-100 text-yellow-600",
  "kyc-done": "bg-blue-100 text-blue-600",
  "account-opening-failed": "bg-orange-100 text-orange-600",
  "account-rejected": "bg-red-100 text-red-600",
  "no-deposit": "bg-purple-100 text-purple-600",
  "first-deposit": "bg-green-100 text-green-600",
  active: "bg-indigo-100 text-indigo-600",
  vip: "bg-amber-100 text-amber-600",
};

export function PerspectiveSwitcher() {
  const { currentPerspective, setPerspective, perspectives } = useDevConfig();

  return (
    <div className="space-y-3">
      {/* 当前视角 */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500 mb-1">当前视角</p>
        <div className="flex items-center gap-2">
          {(() => {
            const Icon = perspectiveIcons[currentPerspective.id] || User;
            const colorClass = perspectiveColors[currentPerspective.id] || "bg-gray-100 text-gray-600";
            return (
              <>
                <div className={cn("p-1.5 rounded-md", colorClass)}>
                  <Icon size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {currentPerspective.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentPerspective.accounts.length} 账户 · VIP{currentPerspective.vipLevel}
                  </p>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* 视角列表 */}
      <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
        {perspectives.map((perspective) => {
          const Icon = perspectiveIcons[perspective.id] || User;
          const colorClass = perspectiveColors[perspective.id] || "bg-gray-100 text-gray-600";
          const isActive = currentPerspective.id === perspective.id;

          return (
            <button
              key={perspective.id}
              onClick={() => setPerspective(perspective.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left",
                "transition-colors duration-150",
                isActive
                  ? "bg-gray-100 border border-gray-200"
                  : "hover:bg-gray-50 border border-transparent"
              )}
            >
              <div className={cn("p-1.5 rounded-md shrink-0", colorClass)}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm truncate",
                  isActive ? "font-medium text-gray-900" : "text-gray-700"
                )}>
                  {perspective.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {perspective.accounts.length > 0
                    ? `${perspective.accounts.length} 账户`
                    : "未开户"}
                  {perspective.hasDeposit && " · 已入金"}
                  {perspective.vipLevel > 0 && ` · VIP${perspective.vipLevel}`}
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
        切换后页面数据将实时更新
      </p>
    </div>
  );
}
