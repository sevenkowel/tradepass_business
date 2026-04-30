"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Plus, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
  _count?: { members: number; subscriptions: number };
}

export default function TenantsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const handleCreateTenant = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/console/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `我的租户 ${new Date().toLocaleDateString()}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "创建失败");
        setCreating(false);
        return;
      }
      router.push("/console/onboarding");
    } catch {
      alert("网络错误，请稍后重试");
      setCreating(false);
    }
  };

  useEffect(() => {
    fetch("/api/console/tenants")
      .then((r) => r.json())
      .then((data) => {
        setTenants(data.tenants || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400 mr-2" />
        <span className="text-sm text-slate-500">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">租户管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理您的租户和业务系统</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleCreateTenant}
            disabled={creating}
          >
            {creating ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-1" />
            )}
            {creating ? "创建中..." : "创建租户"}
          </Button>
        </div>
      </div>

      {tenants.length === 0 ? (
        <Card className="border-slate-200/60">
          <EmptyState
            icon={<Building2 className="w-5 h-5" />}
            title="暂无租户"
            description="您还没有创建任何租户，创建后即可订阅产品和管理业务。"
            action={
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleCreateTenant}
                disabled={creating}
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-1" />
                )}
                {creating ? "创建中..." : "创建第一个租户"}
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenants.map((t) => (
            <Link key={t.id} href={`/console/tenants/${t.id}`}>
              <Card className="border-slate-200/60 shadow-sm hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {t.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{t.name}</h3>
                        <p className="text-sm text-slate-500">{t.slug}</p>
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                        t.status === "active"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : t.status === "trial"
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {t.status === "active"
                        ? "运行中"
                        : t.status === "trial"
                        ? "试用中"
                        : t.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                    <span>成员: {t._count?.members ?? 0}</span>
                    <span className="text-slate-300">|</span>
                    <span>产品: {t._count?.subscriptions ?? 0}</span>
                    <span className="text-slate-300">|</span>
                    <span>创建于 {new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-4 text-sm text-blue-600 font-medium group-hover:gap-2 transition-all">
                    查看详情 <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
