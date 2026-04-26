"use client";

import { useFeatureFlag } from "@/lib/feature-flags/hooks";
import { Button } from "@/components/ui/Button";
import { Lock, ArrowUpRight } from "lucide-react";

interface FeatureGateProps {
  featureKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
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

  return (
    <div className="relative rounded-xl border border-dashed border-[rgba(var(--tp-fg-rgb),0.15)] bg-[rgba(var(--tp-fg-rgb),0.02)] p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-[rgba(var(--tp-accent-rgb),0.1)] flex items-center justify-center mb-4">
        <Lock className="w-5 h-5 text-[rgb(var(--tp-accent-rgb))]" />
      </div>
      <h3 className="text-lg font-semibold text-[rgb(var(--tp-fg-rgb))] mb-2">
        功能锁定
      </h3>
      <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)] mb-4 max-w-sm mx-auto">
        {reason || "当前套餐不包含此功能"}
      </p>
      {requiresUpgrade && upgradeTarget && (
        <Button
          variant="default"
          size="sm"
          onClick={() => {
            window.location.href = `/console/billing?upgrade=${upgradeTarget}`;
          }}
        >
          升级至 {upgradeTarget}
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </Button>
      )}
    </div>
  );
}
