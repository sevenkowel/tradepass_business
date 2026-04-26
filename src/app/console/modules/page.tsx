"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import {
  TrendingUp,
  Shield,
  Globe,
  CheckCircle2,
  Clock,
  Zap,
  Settings,
  Loader2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { useTenantStore } from "@/store/tenantStore";

const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp,
  Shield,
  Globe,
};

interface ModuleSubscription {
  status: string;
  planName?: string;
  seatLimit: number;
  currentSeats: number;
  trialEndsAt?: string;
  startsAt?: string;
  endsAt?: string;
  autoRenew: boolean;
  priceMonthly?: number;
  priceYearly?: number;
  currency: string;
  features?: Record<string, boolean>;
  config?: Record<string, any>;
}

interface ModuleItem {
  code: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  features: string[];
  plans: {
    code: string;
    name: string;
    description: string;
    seatLimit: number;
    priceMonthlyUSD: number;
    priceYearlyUSD: number;
    featureFlags: Record<string, boolean>;
  }[];
  subscription: ModuleSubscription | null;
}

export default function ModulesPage() {
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionModule, setActionModule] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"trial" | "subscribe" | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const { currentTenant } = useTenantStore();

  useEffect(() => {
    if (!currentTenant) return;
    fetchModules();
  }, [currentTenant]);

  async function fetchModules() {
    setLoading(true);
    const res = await fetch(`/api/console/modules?tenantId=${currentTenant?.id}`);
    const data = await res.json();
    setModules(data.modules || []);
    setLoading(false);
  }

  async function startTrial(moduleCode: string, plan: string) {
    setActionModule(moduleCode);
    setActionType("trial");
    const res = await fetch("/api/console/modules/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: currentTenant?.id,
        moduleCode,
        plan,
        trial: true,
      }),
    });
    if (res.ok) {
      await fetchModules();
    }
    setActionModule(null);
    setActionType(null);
  }

  async function subscribe(moduleCode: string, plan: string) {
    setActionModule(moduleCode);
    setActionType("subscribe");
    const res = await fetch("/api/console/modules/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: currentTenant?.id,
        moduleCode,
        plan,
        trial: false,
      }),
    });
    if (res.ok) {
      await fetchModules();
    }
    setActionModule(null);
    setActionType(null);
  }

  function getStatusBadge(sub: ModuleSubscription | null) {
    if (!sub) return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">未订阅</span>;
    const map: Record<string, string> = {
      active: "bg-emerald-100 text-emerald-700",
      trial: "bg-amber-100 text-amber-700",
      inactive: "bg-gray-100 text-gray-500",
      cancelled: "bg-red-100 text-red-700",
      expired: "bg-red-100 text-red-700",
    };
    const labels: Record<string, string> = {
      active: "已激活",
      trial: "试用中",
      inactive: "未激活",
      cancelled: "已取消",
      expired: "已过期",
    };
    return (
      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", map[sub.status] || map.inactive)}>
        {labels[sub.status] || sub.status}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--tp-accent-rgb))]" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">产品矩阵</h1>
        <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)] mt-1">
          按需订阅 Growth Engine、Trade Engine、Trading Engine 三大核心引擎
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {modules.map((mod) => {
          const Icon = ICON_MAP[mod.icon] || Zap;
          const sub = mod.subscription;
          const isTrial = sub?.status === "trial";
          const isActive = sub?.status === "active";

          return (
            <Card key={mod.code} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header */}
                <div className="p-5 border-b border-[var(--tp-border)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[rgba(var(--tp-accent-rgb),0.1)] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[rgb(var(--tp-accent-rgb))]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[rgb(var(--tp-fg-rgb))]">{mod.shortName}</h3>
                        <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">{mod.name}</p>
                      </div>
                    </div>
                    {getStatusBadge(sub)}
                  </div>
                  <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">{mod.description}</p>
                </div>

                {/* Features */}
                <div className="p-5 border-b border-[var(--tp-border)]">
                  <h4 className="text-xs font-semibold text-[rgba(var(--tp-fg-rgb),0.5)] uppercase tracking-wide mb-3">
                    功能清单
                  </h4>
                  <ul className="space-y-2">
                    {mod.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-[rgba(var(--tp-fg-rgb),0.7)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plans */}
                <div className="p-5">
                  {isActive || isTrial ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">当前方案</span>
                        <span className="text-sm font-medium text-[rgb(var(--tp-fg-rgb))]">
                          {mod.plans.find((p) => p.code === sub?.planName)?.name || sub?.planName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">席位</span>
                        <span className="text-sm text-[rgb(var(--tp-fg-rgb))]">
                          {sub?.currentSeats || 0} / {sub?.seatLimit || 0}
                        </span>
                      </div>
                      {isTrial && sub?.trialEndsAt && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                          <Clock className="w-3.5 h-3.5" />
                          试用将于 {new Date(sub.trialEndsAt).toLocaleDateString("zh-CN")} 到期
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button variant="secondary" size="sm" className="flex-1" disabled>
                          <Settings className="w-3.5 h-3.5 mr-1" />
                          配置
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {mod.plans.map((plan) => (
                        <div
                          key={plan.code}
                          className={cn(
                            "rounded-lg border p-3 cursor-pointer transition-all",
                            selectedPlan === `${mod.code}-${plan.code}`
                              ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.03)]"
                              : "border-[var(--tp-border)] hover:border-[rgba(var(--tp-accent-rgb),0.3)]"
                          )}
                          onClick={() => setSelectedPlan(`${mod.code}-${plan.code}`)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[rgb(var(--tp-fg-rgb))]">{plan.name}</span>
                            <span className="text-sm font-bold text-[rgb(var(--tp-accent-rgb))]">
                              ${plan.priceMonthlyUSD}/月
                            </span>
                          </div>
                          <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">{plan.description}</p>
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => startTrial(mod.code, mod.plans[0].code)}
                          disabled={actionModule === mod.code}
                        >
                          {actionModule === mod.code && actionType === "trial" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 mr-1" />
                          )}
                          试用 14 天
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => {
                            const planCode = selectedPlan.startsWith(`${mod.code}-`)
                              ? selectedPlan.replace(`${mod.code}-`, "")
                              : mod.plans[0].code;
                            subscribe(mod.code, planCode);
                          }}
                          disabled={actionModule === mod.code}
                        >
                          {actionModule === mod.code && actionType === "subscribe" ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : (
                            <Zap className="w-3.5 h-3.5 mr-1" />
                          )}
                          订阅
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {modules.length === 0 && !loading && (
        <EmptyState
          icon={<Zap className="w-8 h-8" />}
          title="暂无产品模块"
          description="产品模块数据加载失败，请稍后重试"
        />
      )}
    </div>
  );
}
