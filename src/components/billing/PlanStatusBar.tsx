"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Zap, ArrowUpRight, AlertTriangle, Clock, Ban, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface LifecycleState {
  status: "active_trial" | "grace_period" | "expired" | "active_paid" | "unknown";
  plan: string;
  trialEndsAt: string | null;
  gracePeriodEndsAt: string | null;
  retentionExpiresAt: string | null;
  daysLeftInTrial: number;
  daysLeftInGrace: number;
  daysLeftInRetention: number;
  isExpired: boolean;
  isGracePeriod: boolean;
  canAccessFeatures: boolean;
}

interface SubscriptionInfo {
  plan: string;
  status: string;
  trialEndsAt: string | null;
  maxUsers: number;
  maxAccounts: number;
  currentUsers: number;
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
  ultimate: "Ultimate",
  mvp: "MVP 试用",
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-slate-100 text-slate-700",
  starter: "bg-blue-100 text-blue-700",
  professional: "bg-indigo-100 text-indigo-700",
  enterprise: "bg-amber-100 text-amber-700",
  ultimate: "bg-purple-100 text-purple-700",
  mvp: "bg-emerald-100 text-emerald-700",
};

export function PlanStatusBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [lifecycle, setLifecycle] = useState<LifecycleState | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/console/billing/trial-status")
      .then((r) => r.json())
      .then((data) => {
        setLifecycle(data.state);
        setSubscription({
          plan: data.state.plan,
          status: data.state.status,
          trialEndsAt: data.state.trialEndsAt,
          maxUsers: 0,
          maxAccounts: 0,
          currentUsers: 0,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Redirect expired users to billing page (except when already on billing)
    if (lifecycle?.isExpired && pathname !== "/console/billing") {
      router.push("/console/billing?expired=1");
    }
  }, [lifecycle, pathname, router]);

  if (loading || !lifecycle || !subscription) return null;

  // Don't show on billing page
  if (pathname === "/console/billing") {
    return null;
  }

  const isTrial = lifecycle.status === "active_trial";
  const isGrace = lifecycle.status === "grace_period";
  const isExpired = lifecycle.isExpired;
  const isPaid = lifecycle.status === "active_paid";

  const nearLimit = subscription.maxUsers > 0 && subscription.currentUsers / subscription.maxUsers >= 0.8;
  const urgent = isTrial && lifecycle.daysLeftInTrial <= 3;

  let statusText = "";
  let statusIcon = null;
  let statusClass = "";

  if (isExpired) {
    statusText = `已降级 · 数据保留 ${lifecycle.daysLeftInRetention} 天`;
    statusIcon = <Ban className="w-3.5 h-3.5" />;
    statusClass = "text-red-700";
  } else if (isGrace) {
    statusText = `宽限期剩余 ${lifecycle.daysLeftInGrace} 天`;
    statusIcon = <Clock className="w-3.5 h-3.5" />;
    statusClass = "text-amber-700";
  } else if (isTrial) {
    statusText = `试用剩余 ${lifecycle.daysLeftInTrial} 天`;
    statusIcon = null;
    statusClass = "text-amber-700";
  } else if (isPaid) {
    statusText = "订阅中";
    statusIcon = null;
    statusClass = "text-emerald-700";
  }

  return (
    <div
      className={cn(
        "px-4 lg:px-8 py-2 flex items-center justify-between gap-4 text-sm",
        urgent || isGrace
          ? "bg-amber-50 border-b border-amber-200"
          : isExpired
          ? "bg-red-50 border-b border-red-200"
          : "bg-white border-b border-slate-100"
      )}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            PLAN_COLORS[subscription.plan] || PLAN_COLORS.free
          )}
        >
          {PLAN_LABELS[subscription.plan] || subscription.plan}
        </span>

        {(isTrial || isGrace || isExpired || isPaid) && (
          <span className={cn("flex items-center gap-1 font-medium", statusClass)}>
            {statusIcon}
            {statusText}
          </span>
        )}

        {isExpired && lifecycle.daysLeftInRetention > 0 && (
          <span className="flex items-center gap-1 text-red-600">
            <Database className="w-3.5 h-3.5" />
            数据将于 {lifecycle.daysLeftInRetention} 天后清理
          </span>
        )}

        {nearLimit && (
          <span className="flex items-center gap-1 text-amber-700">
            <AlertTriangle className="w-3.5 h-3.5" />
            用户接近上限 ({subscription.currentUsers}/{subscription.maxUsers})
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {(isExpired || isGrace || (isTrial && lifecycle.daysLeftInTrial <= 7)) && (
          <Button
            variant="default"
            size="sm"
            onClick={() => router.push("/console/billing")}
            className={isExpired ? "bg-red-600 hover:bg-red-700 text-white" : ""}
          >
            <Zap className="w-3.5 h-3.5 mr-1" />
            {isExpired ? "立即升级恢复" : "升级套餐"}
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
        {isPaid && subscription.plan !== "ultimate" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/console/billing")}
          >
            <Zap className="w-3.5 h-3.5 mr-1" />
            管理套餐
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
