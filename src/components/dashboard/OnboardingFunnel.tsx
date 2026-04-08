"use client";

import { Check, ChevronRight, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { UserPerspective } from "@/types/user";
import { getOnboardingSteps, getPrimaryCTA } from "@/lib/user-perspectives";

interface OnboardingFunnelProps {
  user: UserPerspective;
}

export function OnboardingFunnel({ user }: OnboardingFunnelProps) {
  const steps = getOnboardingSteps(user);
  const primaryCTA = getPrimaryCTA(user);
  const allCompleted = steps.every((s) => s.completed);

  // 全部完成且非强制展示时隐藏
  if (allCompleted) return null;

  // 判断特殊状态
  const isAccountFailed = user.stage === "account_opening_failed";
  const isAccountRejected = user.stage === "account_rejected";

  return (
    <section className="py-6 border-b border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-medium text-gray-900">
          {isAccountFailed
            ? "您的开户流程尚未完成"
            : isAccountRejected
            ? "您的开户申请未通过审核"
            : "开始你的交易之旅"}
        </h2>
        <span className="text-xs text-gray-400">
          {user.stage === "kyc_pending" ? "审核中" : "预计 2 分钟完成"}
        </span>
      </div>

      {/* 开户被拒绝时的警告提示 */}
      {isAccountRejected && user.rejectionReason && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-red-800 font-medium">审核未通过</p>
            <p className="text-sm text-red-700">{user.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* 步骤进度 */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-2">
            {/* 步骤指示器 */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                step.completed
                  ? "text-gray-500 bg-gray-50"
                  : step.current
                  ? "text-gray-900 border-2 border-gray-900 bg-white"
                  : step.action
                  ? "text-gray-900 border border-gray-200"
                  : "text-gray-400"
              }`}
            >
              {step.completed ? (
                <Check size={14} className="text-green-600" />
              ) : step.id === "kyc" && user.kycStatus === "pending" ? (
                <Loader2 size={14} className="animate-spin text-gray-600" />
              ) : step.current && isAccountFailed ? (
                <RefreshCw size={14} className="text-gray-600" />
              ) : step.current && isAccountRejected ? (
                <AlertCircle size={14} className="text-red-600" />
              ) : null}
              <span>{step.label}</span>
            </div>

            {/* 分隔箭头 */}
            {index < steps.length - 1 && (
              <ChevronRight size={14} className="text-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* 主 CTA 和次要操作 */}
      <div className="flex items-center gap-3">
        {primaryCTA.href && (
          <Link
            href={primaryCTA.href}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            {primaryCTA.text}
            <ChevronRight size={16} className="ml-1" />
          </Link>
        )}

        {/* 开户中断时的次要操作：重新开始 */}
        {isAccountFailed && (
          <Link
            href="/portal/trading/open-account"
            className="inline-flex items-center justify-center px-4 py-2.5 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors"
          >
            <RefreshCw size={14} className="mr-1.5" />
            重新开始
          </Link>
        )}
      </div>
    </section>
  );
}
