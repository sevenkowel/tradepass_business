"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Loader2,
  Clock,
  Ban,
  Database,
  Calendar,
  Search,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan: string;
  trialEndsAt: string | null;
  gracePeriodEndsAt: string | null;
  retentionExpiresAt: string | null;
  downgradeReason: string | null;
  maxUsers: number;
  maxAccounts: number;
  subdomain: string | null;
  createdAt: string;
  owner: { email: string; name: string | null };
  _count: { members: number };
}

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<AdminTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "trial" | "expired" | "grace">("all");
  const [extendingId, setExtendingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    setLoading(true);
    const res = await fetch("/api/backoffice/tenants");
    const data = await res.json();
    setTenants(data.tenants || []);
    setLoading(false);
  }

  async function extendTrial(tenantId: string) {
    setExtendingId(tenantId);
    const res = await fetch(`/api/admin/tenants/${tenantId}/extend-trial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ days: 14 }),
    });
    if (res.ok) {
      await fetchTenants();
    }
    setExtendingId(null);
  }

  const filtered = tenants.filter((t) => {
    const matchesSearch =
      !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      t.owner.email.toLowerCase().includes(search.toLowerCase());

    const now = Date.now();
    const trialEnds = t.trialEndsAt ? new Date(t.trialEndsAt).getTime() : 0;
    const graceEnds = t.gracePeriodEndsAt ? new Date(t.gracePeriodEndsAt).getTime() : 0;
    const isExpired = trialEnds > 0 && graceEnds > 0 && now > graceEnds;
    const isGrace = trialEnds > 0 && now > trialEnds && now <= graceEnds;
    const isTrial = trialEnds > 0 && now <= trialEnds;

    const matchesFilter =
      filter === "all" ||
      (filter === "trial" && isTrial) ||
      (filter === "grace" && isGrace) ||
      (filter === "expired" && isExpired);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400 mr-2" />
        <span className="text-sm text-slate-500">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          租户订阅管理
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTenants}>
            刷新
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索租户名称、标识或邮箱..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          {([
            { key: "all", label: "全部" },
            { key: "trial", label: "试用中" },
            { key: "grace", label: "宽限期" },
            { key: "expired", label: "已过期" },
          ] as const).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                filter === f.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tenant List */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Building2 className="w-5 h-5" />}
            title="暂无租户"
            description="没有符合条件的租户。"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <TenantCard
              key={t.id}
              tenant={t}
              onExtend={() => extendTrial(t.id)}
              extending={extendingId === t.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TenantCard({
  tenant,
  onExtend,
  extending,
}: {
  tenant: AdminTenant;
  onExtend: () => void;
  extending: boolean;
}) {
  const now = Date.now();
  const trialEnds = tenant.trialEndsAt ? new Date(tenant.trialEndsAt).getTime() : 0;
  const graceEnds = tenant.gracePeriodEndsAt ? new Date(tenant.gracePeriodEndsAt).getTime() : 0;
  const retentionEnds = tenant.retentionExpiresAt ? new Date(tenant.retentionExpiresAt).getTime() : 0;

  const isExpired = trialEnds > 0 && graceEnds > 0 && now > graceEnds;
  const isGrace = trialEnds > 0 && now > trialEnds && now <= graceEnds;
  const isTrial = trialEnds > 0 && now <= trialEnds;

  const trialDaysLeft = trialEnds > 0 ? Math.max(0, Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24))) : 0;
  const graceDaysLeft = graceEnds > 0 ? Math.max(0, Math.ceil((graceEnds - now) / (1000 * 60 * 60 * 24))) : 0;
  const retentionDaysLeft = retentionEnds > 0 ? Math.max(0, Math.ceil((retentionEnds - now) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <Card className={cn("hover:border-slate-300 transition-colors", isExpired && "border-red-200")}>
      <CardContent className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{tenant.name}</h3>
              <StatusBadge isTrial={isTrial} isGrace={isGrace} isExpired={isExpired} status={tenant.status} />
            </div>
            <p className="text-xs text-slate-500">
              {tenant.slug} · {tenant.owner.email} · {tenant._count.members + 1} 用户
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>套餐: <span className="font-medium text-slate-600">{tenant.plan}</span></span>
              <span>限额: {tenant.maxUsers} 用户 / {tenant.maxAccounts} 账户</span>
              {tenant.subdomain && (
                <span className="text-blue-600">{tenant.subdomain}.tradepass.io</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Status indicators */}
            <div className="flex items-center gap-3 text-sm">
              {isTrial && (
                <div className="text-right">
                  <p className="font-bold text-amber-600">{trialDaysLeft}</p>
                  <p className="text-[10px] text-slate-400">试用剩余</p>
                </div>
              )}
              {isGrace && (
                <div className="text-right">
                  <p className="font-bold text-amber-600">{graceDaysLeft}</p>
                  <p className="text-[10px] text-slate-400">宽限期</p>
                </div>
              )}
              {isExpired && (
                <div className="text-right">
                  <p className="font-bold text-red-600">{retentionDaysLeft}</p>
                  <p className="text-[10px] text-slate-400">数据保留</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {(isExpired || isGrace) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onExtend}
                  disabled={extending}
                >
                  {extending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                  )}
                  延长试用
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  window.open(`/console/tenants/${tenant.id}`, "_blank");
                }}
              >
                详情 <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({
  isTrial,
  isGrace,
  isExpired,
  status,
}: {
  isTrial: boolean;
  isGrace: boolean;
  isExpired: boolean;
  status: string;
}) {
  if (isExpired) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium flex items-center gap-1">
        <Ban className="w-3 h-3" />已降级
      </span>
    );
  }
  if (isGrace) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium flex items-center gap-1">
        <Clock className="w-3 h-3" />宽限期
      </span>
    );
  }
  if (isTrial) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium flex items-center gap-1">
        <Calendar className="w-3 h-3" />试用中
      </span>
    );
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium flex items-center gap-1">
      <CheckCircle2 className="w-3 h-3" />{status}
    </span>
  );
}
