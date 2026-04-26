"use client";

import { useFeatureFlag } from "@/lib/feature-flags/hooks";
import { Button } from "@/components/ui/Button";
import { Lock, ArrowUpRight, AlertTriangle } from "lucide-react";

interface FeatureGateProps {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  expiredOverlay?: boolean; // Show expired-specific overlay
}

/**
 * 功能权限门控组件
 * 有权限时渲染 children，无权限时渲染升级提示或 fallback
 */
export function FeatureGate({
  featureKey,
  children,
  fallback,
  showUpgradePrompt = true,
  expiredOverlay = true,
}: FeatureGateProps) {
  const { available, requiresUpgrade, upgradeTarget, reason, loading } =
    useFeatureFlag(featureKey);

  if (loading) {
    return (
      <div className="animate-pulse bg-[rgba(var(--tp-fg-rgb),0.05)] rounded-lg h-24" />
    );
  }

  if (available) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const isExpiredReason = reason?.includes("降级") || reason?.includes("expired");

  return (
    <div className={
      isExpiredReason && expiredOverlay
        ? "relative rounded-xl border border-dashed border-red-200 bg-red-50/50 p-8 text-center"
        : "relative rounded-xl border border-dashed border-[rgba(var(--tp-fg-rgb),0.15)] bg-[rgba(var(--tp-fg-rgb),0.02)] p-8 text-center"
    }>
      <div className={
        isExpiredReason && expiredOverlay
          ? "mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4"
          : "mx-auto w-12 h-12 rounded-full bg-[rgba(var(--tp-accent-rgb),0.1)] flex items-center justify-center mb-4"
      }>
        {isExpiredReason && expiredOverlay ? (
          <AlertTriangle className="w-5 h-5 text-red-600" />
        ) : (
          <Lock className="w-5 h-5 text-[rgb(var(--tp-accent-rgb))]" />
        )}
      </div>
      <h3 className={
        isExpiredReason && expiredOverlay
          ? "text-lg font-semibold text-red-700 mb-2"
          : "text-lg font-semibold text-[rgb(var(--tp-fg-rgb))] mb-2"
      }>
        {isExpiredReason && expiredOverlay ? "试用已过期" : "功能锁定"}
      </h3>
      <p className={
        isExpiredReason && expiredOverlay
          ? "text-sm text-red-600 mb-4 max-w-sm mx-auto"
          : "text-sm text-[rgba(var(--tp-fg-rgb),0.6)] mb-4 max-w-sm mx-auto"
      }>
        {reason || "当前套餐不包含此功能"}
      </p>
      {requiresUpgrade && upgradeTarget && (
        <Button
          variant={isExpiredReason && expiredOverlay ? "default" : "default"}
          size="sm"
          className={isExpiredReason && expiredOverlay ? "bg-red-600 hover:bg-red-700 text-white" : ""}
          onClick={() => {
            window.location.href = `/console/billing?upgrade=${upgradeTarget}`;
          }}
        >
          {isExpiredReason && expiredOverlay ? "立即升级恢复" : `升级至 ${upgradeTarget}`}
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
