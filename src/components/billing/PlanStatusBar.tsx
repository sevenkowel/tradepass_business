"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Zap, ArrowUpRight, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

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
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-slate-100 text-slate-700",
  starter: "bg-blue-100 text-blue-700",
  professional: "bg-indigo-100 text-indigo-700",
  enterprise: "bg-amber-100 text-amber-700",
  ultimate: "bg-purple-100 text-purple-700",
};

export function PlanStatusBar() {
  const router = useRouter();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/console/subscription")
      .then((r) => r.json())
      .then((data) => {
        setSubscription(data.subscription);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !subscription) return null;

  const isTrial = subscription.status === "trialing";
  const trialDaysLeft = subscription.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const nearLimit = subscription.maxUsers > 0 && subscription.currentUsers / subscription.maxUsers >= 0.8;
  const urgent = isTrial && trialDaysLeft <= 3;

  // Don't show on billing page
  if (typeof window !== "undefined" && window.location.pathname === "/console/billing") {
    return null;
  }

  return (
    <div
      className={cn(
        "px-4 lg:px-8 py-2 flex items-center justify-between gap-4 text-sm",
        urgent ? "bg-amber-50 border-b border-amber-200" : "bg-white border-b border-slate-100"
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            PLAN_COLORS[subscription.plan] || PLAN_COLORS.free
          )}
        >
          {PLAN_LABELS[subscription.plan] || subscription.plan}
        </span>

        {isTrial && (
          <span className="text-amber-700">
            试用剩余 <strong>{trialDaysLeft}</strong> 天
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
        {subscription.plan !== "ultimate" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/console/billing")}
          >
            <Zap className="w-3.5 h-3.5 mr-1" />
            {isTrial ? "升级套餐" : "管理套餐"}
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
