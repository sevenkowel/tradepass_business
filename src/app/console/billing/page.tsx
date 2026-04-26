"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Zap,
  ArrowUpRight,
  Users,
  Globe,
  Shield,
  TrendingUp,
  Sparkles,
  Crown,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  tenant: { name: string };
  amount: number;
  currency: string;
  status: "pending" | "paid" | "overdue";
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  paidAt: string | null;
}

interface SubscriptionInfo {
  plan: string;
  status: string;
  trialEndsAt: string | null;
  maxUsers: number;
  maxAccounts: number;
  currentUsers: number;
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    yearlyPrice: 0,
    users: 10,
    accounts: 5,
    description: "14 天 MVP 试用，体验核心功能",
    icon: Zap,
    color: "slate",
    features: [
      "Portal 访问",
      "基础 KYC（1 地区）",
      "USDT 存取款",
      "最大 10 用户 / 5 账户",
    ],
    modules: ["Business Limited"],
  },
  {
    id: "starter",
    name: "Starter",
    price: 8000,
    yearlyPrice: 7200,
    users: 50,
    accounts: 100,
    description: "适合初创经纪商快速上线",
    icon: Globe,
    color: "blue",
    features: [
      "Backoffice 完整访问",
      "标准 KYC（多地区）",
      "银行转账",
      "L1 IB 代理",
      "黑名单管理",
      "财经日历 + 新闻",
      "自定义域名",
    ],
    modules: ["Business", "Growth Limited", "Edge Limited", "Media"],
    popular: false,
  },
  {
    id: "professional",
    name: "Professional",
    price: 15000,
    yearlyPrice: 13500,
    users: 200,
    accounts: 500,
    description: "适合成长中的经纪商",
    icon: TrendingUp,
    color: "indigo",
    features: [
      "增强 KYC + AML",
      "信用卡支付",
      "MT5 Web 终端",
      "订单管理",
      "风控引擎",
      "L2/L3 IB 代理",
      "高级报表",
      "市场评论",
    ],
    modules: ["Business", "Growth", "Engine Limited", "Edge", "Media"],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 30000,
    yearlyPrice: 27000,
    users: 1000,
    accounts: 2000,
    description: "适合中大型经纪商",
    icon: Shield,
    color: "amber",
    features: [
      "跟单交易",
      "API 集成",
      "AI 交易信号",
      "AI 策略 + 报告",
      "LP 管理",
      "客户数据平台 CDP",
      "白标定制",
      "SLA 99.9% 支持",
    ],
    modules: ["全部模块", "Media", "AI"],
    popular: false,
  },
  {
    id: "ultimate",
    name: "Ultimate",
    price: 60000,
    yearlyPrice: 54000,
    users: -1,
    accounts: -1,
    description: "无限扩展，专属定制",
    icon: Crown,
    color: "purple",
    features: [
      "无限用户 / 账户",
      "专属基础设施",
      "专属客户经理",
      "定制开发",
      "私有化部署",
      "所有功能无限制",
    ],
    modules: ["全部 + 专属"],
    popular: false,
  },
];

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [yearly, setYearly] = useState(false);
  const [upgrading, setUpgrading] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/console/billing").then((r) => r.json()),
      fetch("/api/console/subscription").then((r) => r.json()),
    ]).then(([billingData, subData]) => {
      setInvoices(billingData.invoices || []);
      setSubscription(subData.subscription || null);
      setLoading(false);
    });
  }, []);

  async function payInvoice(invoiceId: string) {
    setPayingId(invoiceId);
    const res = await fetch("/api/console/billing/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, method: "card" }),
    });
    const data = await res.json();
    if (data.invoice) {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? { ...inv, ...data.invoice } : inv))
      );
    }
    setPayingId(null);
  }

  async function upgradePlan(planId: string) {
    setUpgrading(planId);
    const res = await fetch("/api/console/billing/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId, yearly }),
    });
    const data = await res.json();
    if (data.success) {
      window.location.reload();
    }
    setUpgrading(null);
  }

  const totalPending = invoices
    .filter((i) => i.status === "pending")
    .reduce((sum, i) => sum + i.amount, 0);

  const currentPlan = PLANS.find((p) => p.id === subscription?.plan) || PLANS[0];
  const isTrial = subscription?.status === "trialing";
  const trialDaysLeft = subscription?.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Current Plan Banner */}
      <CurrentPlanBanner
        plan={currentPlan}
        subscription={subscription}
        isTrial={isTrial}
        trialDaysLeft={trialDaysLeft}
      />

      {/* Plan Selection */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-[rgb(var(--tp-fg-rgb))]">选择套餐</h2>
            <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)] mt-1">
              升级套餐解锁更多功能，年付享 9 折优惠
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[rgba(var(--tp-fg-rgb),0.05)] rounded-lg p-1">
            <button
              onClick={() => setYearly(false)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                !yearly
                  ? "bg-[rgb(var(--tp-accent-rgb))] text-white"
                  : "text-[rgba(var(--tp-fg-rgb),0.6)]"
              )}
            >
              月付
            </button>
            <button
              onClick={() => setYearly(true)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                yearly
                  ? "bg-[rgb(var(--tp-accent-rgb))] text-white"
                  : "text-[rgba(var(--tp-fg-rgb),0.6)]"
              )}
            >
              年付 <span className="text-xs opacity-80">-10%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={currentPlan.id === plan.id}
              yearly={yearly}
              onUpgrade={() => upgradePlan(plan.id)}
              upgrading={upgrading === plan.id}
            />
          ))}
        </div>
      </div>

      {/* Feature Comparison */}
      <FeatureComparison currentPlan={currentPlan.id} />

      {/* Invoices */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">账单列表</h2>
        {invoices.length === 0 ? (
          <Card>
            <EmptyState
              title="暂无账单"
              description="当前没有待处理的账单，系统会在产生费用时自动生成。"
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <Card key={inv.id} className="hover:border-slate-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-slate-900">{inv.invoiceNumber}</p>
                        <StatusBadge status={inv.status} />
                      </div>
                      <p className="text-sm text-slate-500">
                        {inv.tenant.name} · {new Date(inv.periodStart).toLocaleDateString()} -{" "}
                        {new Date(inv.periodEnd).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        到期日: {new Date(inv.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-slate-900">
                        {inv.currency} {inv.amount.toFixed(2)}
                      </p>
                      {inv.status === "pending" && (
                        <Button
                          onClick={() => payInvoice(inv.id)}
                          disabled={payingId === inv.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {payingId === inv.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 mr-1.5" /> 支付
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CurrentPlanBanner({
  plan,
  subscription,
  isTrial,
  trialDaysLeft,
}: {
  plan: (typeof PLANS)[0];
  subscription: SubscriptionInfo | null;
  isTrial: boolean;
  trialDaysLeft: number;
}) {
  const PlanIcon = plan.icon;

  return (
    <div className="rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[rgba(var(--tp-accent-rgb),0.1)] flex items-center justify-center">
            <PlanIcon className="w-6 h-6 text-[rgb(var(--tp-accent-rgb))]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[rgb(var(--tp-fg-rgb))]">
                当前套餐: {plan.name}
              </h2>
              {isTrial && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                  试用中
                </span>
              )}
            </div>
            <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">
              {plan.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {isTrial && (
            <div className="text-right">
              <p className="text-2xl font-bold text-amber-600">{trialDaysLeft}</p>
              <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">剩余试用天数</p>
            </div>
          )}
          <div className="text-right">
            <p className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">
              {subscription?.currentUsers || 0}
              <span className="text-sm font-normal text-[rgba(var(--tp-fg-rgb),0.5)]">
                /{plan.users === -1 ? "∞" : plan.users}
              </span>
            </p>
            <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">用户 / 限额</p>
          </div>
          {plan.id !== "ultimate" && (
            <Button
              variant="default"
              onClick={() => {
                document.getElementById("plans-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              升级套餐
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {isTrial && trialDaysLeft <= 3 && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700">
            试用期即将结束（剩余 {trialDaysLeft} 天），升级套餐可保留全部功能。降级后数据保留 90 天。
          </p>
        </div>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  isCurrent,
  yearly,
  onUpgrade,
  upgrading,
}: {
  plan: (typeof PLANS)[0];
  isCurrent: boolean;
  yearly: boolean;
  onUpgrade: () => void;
  upgrading: boolean;
}) {
  const PlanIcon = plan.icon;
  const price = yearly ? plan.yearlyPrice : plan.price;

  const colorMap: Record<string, string> = {
    slate: "border-slate-200 hover:border-slate-300",
    blue: "border-blue-200 hover:border-blue-300",
    indigo: "border-indigo-200 hover:border-indigo-300",
    amber: "border-amber-200 hover:border-amber-300",
    purple: "border-purple-200 hover:border-purple-300",
  };

  const badgeColorMap: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-100 text-blue-700",
    indigo: "bg-indigo-100 text-indigo-700",
    amber: "bg-amber-100 text-amber-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border-2 p-5 flex flex-col transition-all",
        isCurrent
          ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.02)]"
          : colorMap[plan.color] || "border-[var(--tp-border)]",
        plan.popular && !isCurrent && "border-indigo-300"
      )}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-600 text-white font-medium">
            最受欢迎
          </span>
        </div>
      )}
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="text-xs px-3 py-1 rounded-full bg-[rgb(var(--tp-accent-rgb))] text-white font-medium">
            当前套餐
          </span>
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", badgeColorMap[plan.color])}>
          <PlanIcon className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-[rgb(var(--tp-fg-rgb))]">{plan.name}</h3>
      </div>

      <div className="mb-4">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">
            ${price.toLocaleString()}
          </span>
          <span className="text-sm text-[rgba(var(--tp-fg-rgb),0.5)]">/月</span>
        </div>
        {yearly && price > 0 && (
          <p className="text-xs text-emerald-600">
            年付节省 ${((plan.price - plan.yearlyPrice) * 12).toLocaleString()}/年
          </p>
        )}
      </div>

      <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)] mb-3">{plan.description}</p>

      <div className="flex items-center gap-1 text-xs text-[rgba(var(--tp-fg-rgb),0.6)] mb-4">
        <Users className="w-3.5 h-3.5" />
        {plan.users === -1 ? "无限用户" : `最多 ${plan.users} 用户`}
      </div>

      <ul className="space-y-2 mb-5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-[rgba(var(--tp-fg-rgb),0.7)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-1">
          {plan.modules.map((m) => (
            <span
              key={m}
              className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(var(--tp-fg-rgb),0.05)] text-[rgba(var(--tp-fg-rgb),0.5)]"
            >
              {m}
            </span>
          ))}
        </div>
        {isCurrent ? (
          <Button variant="outline" className="w-full" disabled>
            当前套餐
          </Button>
        ) : (
          <Button
            variant={plan.popular ? "default" : "outline"}
            className="w-full"
            onClick={onUpgrade}
            disabled={upgrading}
          >
            {upgrading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>升级 <ArrowUpRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

function FeatureComparison({ currentPlan }: { currentPlan: string }) {
  const features = [
    { category: "TradePass Business", items: [
      { name: "Portal 访问", free: true, starter: true, professional: true, enterprise: true, ultimate: true },
      { name: "Backoffice 访问", free: false, starter: true, professional: true, enterprise: true, ultimate: true },
      { name: "基础 KYC", free: true, starter: true, professional: true, enterprise: true, ultimate: true },
      { name: "标准 KYC", free: false, starter: true, professional: true, enterprise: true, ultimate: true },
      { name: "增强 KYC + AML", free: false, starter: false, professional: true, enterprise: true, ultimate: true },
      { name: "USDT 存取款", free: true, starter: true, professional: true, enterprise: true, ultimate: true },
      { name: "银行转账", free: false, starter: true, professional: true, enterprise: true, ultimate: true },
      { name: "信用卡支付", free: false, starter: false, professional: true, enterprise: true, ultimate: true },
      { name: "用户管理", free: false, starter: true, professional: true, enterprise: true, ultimate: true },
      { name: "基础报表", free: false, starter: true, professional: true, enterprise: true, ultimate: true },
      { name: "高级报表", free: false, starter: false, professional: true, enterprise: true, ultimate: true },
    ]},
    { category: "TradePass Growth", items: [
      { name: "L1 IB 代理", free: false, starter: true, professional: true, enterprise: true, ultimate: true },
      { name: "L2/L3 IB 代理", free: false, starter: false, professional: true, enterprise: true, ultimate: true },
      { name: "IB 佣金提现", free: false, starter: false, professional: true, enterprise: true, ultimate: true },
      { name: "营销活动", free: false, starter: false, professional: true, enterprise: true, ultimate: true },
      { name: "客户数据平台 CDP", free: false, starter: false, professional: false, enterprise: true, ultimate: true },
    ]},
    { category: "TradePass Engine", items: [
      { name: "MT5 Web 终端", free: false, starter: false, professional: true, enterprise: true, ultimate: true },
      { name: "订单管理", free: false, starter: false, professional: true, enterprise: true, ultimate: true },
      { name: "跟单交易", free: false, starter: false, professional: false, enterprise: true, ultimate: true },
      { name: "API 集成", free: false, starter: false, professional: false, enterprise: true, ultimate: true },
      { name: "AI 交易信号", free: false, starter: false, professional: false, enterprise: true, ultimate: true },
    ]},
    { category: "TradePass Edge", items: [
      { name: "风控引擎", free: false, starter: false, professional: true, enterprise: true, ultimate: true },
      { name: "LP 管理", free: false, starter: false, professional: false, enterprise: true, ultimate: true },
      { name: "黑名单", free: false, starter: true, professional: true, enterprise: true, ultimate: true },
    ]},
    { category: "TradePass Media", items: [
      { name: "财经日历", free: false, starter: true, professional: true, enterprise: true, ultimate: true },
      { name: "新闻快讯", free: false, starter: true, professional: true, enterprise: true, ultimate: true },
      { name: "市场评论", free: false, starter: false, professional: true, enterprise: true, ultimate: true },
    ]},
    { category: "TradePass AI", items: [
      { name: "AI 交易策略", free: false, starter: false, professional: false, enterprise: true, ultimate: true },
      { name: "AI 订单分析", free: false, starter: false, professional: false, enterprise: true, ultimate: true },
      { name: "AI 报告", free: false, starter: false, professional: false, enterprise: true, ultimate: true },
      { name: "AI 风控预警", free: false, starter: false, professional: false, enterprise: true, ultimate: true },
    ]},
    { category: "基础设施", items: [
      { name: "自定义域名", free: false, starter: true, professional: true, enterprise: true, ultimate: true },
      { name: "白标定制", free: false, starter: false, professional: false, enterprise: true, ultimate: true },
      { name: "Webhooks", free: false, starter: false, professional: false, enterprise: true, ultimate: true },
      { name: "SLA 支持", free: false, starter: false, professional: false, enterprise: true, ultimate: true },
      { name: "专属基础设施", free: false, starter: false, professional: false, enterprise: false, ultimate: true },
    ]},
  ];

  const plans = ["free", "starter", "professional", "enterprise", "ultimate"];
  const planLabels: Record<string, string> = {
    free: "Free",
    starter: "Starter",
    professional: "Professional",
    enterprise: "Enterprise",
    ultimate: "Ultimate",
  };

  return (
    <div id="plans-section">
      <h2 className="text-xl font-bold text-[rgb(var(--tp-fg-rgb))] mb-4">功能对比</h2>
      <div className="rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--tp-border)]">
                <th className="text-left p-4 font-medium text-[rgba(var(--tp-fg-rgb),0.5)] sticky left-0 bg-[var(--tp-surface)] min-w-[200px]">
                  功能
                </th>
                {plans.map((p) => (
                  <th
                    key={p}
                    className={cn(
                      "p-4 text-center font-medium min-w-[80px]",
                      currentPlan === p
                        ? "text-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.03)]"
                        : "text-[rgba(var(--tp-fg-rgb),0.6)]"
                    )}
                  >
                    {planLabels[p]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((group) => (
                <>
                  <tr key={group.category} className="bg-[rgba(var(--tp-fg-rgb),0.02)]">
                    <td
                      colSpan={6}
                      className="p-3 text-xs font-semibold text-[rgb(var(--tp-accent-rgb))] uppercase tracking-wider sticky left-0"
                    >
                      {group.category}
                    </td>
                  </tr>
                  {group.items.map((item) => (
                    <tr key={item.name} className="border-b border-[var(--tp-border)] last:border-0">
                      <td className="p-4 text-[rgb(var(--tp-fg-rgb))] sticky left-0 bg-[var(--tp-surface)]">
                        {item.name}
                      </td>
                      {plans.map((p) => (
                        <td
                          key={p}
                          className={cn(
                            "p-4 text-center",
                            currentPlan === p && "bg-[rgba(var(--tp-accent-rgb),0.03)]"
                          )}
                        >
                          {(item as any)[p] ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : (
                            <span className="text-[rgba(var(--tp-fg-rgb),0.2)]">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
    paid: {
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      className: "bg-emerald-100 text-emerald-700",
      label: "已支付",
    },
    pending: {
      icon: <Clock className="w-3.5 h-3.5" />,
      className: "bg-amber-100 text-amber-700",
      label: "待支付",
    },
    overdue: {
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      className: "bg-red-100 text-red-700",
      label: "已逾期",
    },
  };
  const c = config[status] || config.pending;
  return (
    <span className={cn("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium", c.className)}>
      {c.icon} {c.label}
    </span>
  );
}
