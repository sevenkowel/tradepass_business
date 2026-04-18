"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Plus, ArrowRight } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
  _count?: { members: number; subscriptions: number };
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">租户管理</h1>
        <Link href="/console/tenants/new">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="w-4 h-4 mr-2" /> 创建租户
          </Button>
        </Link>
      </div>

      {tenants.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-slate-500 space-y-4">
            <Building2 className="w-12 h-12 mx-auto text-slate-300" />
            <p>还没有租户</p>
            <Link href="/console/tenants/new">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                <Plus className="w-4 h-4 mr-2" /> 创建第一个租户
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenants.map((t) => (
            <Link key={t.id} href={`/console/tenants/${t.id}`}>
              <Card className="hover:border-slate-300 transition-colors h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-900">{t.name}</h3>
                      <p className="text-sm text-slate-500">{t.slug}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        t.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : t.status === "trial"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {t.status === "active"
                        ? "运行中"
                        : t.status === "trial"
                        ? "试用中"
                        : t.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
                    <span>成员: {t._count?.members ?? 0}</span>
                    <span>产品: {t._count?.subscriptions ?? 0}</span>
                    <span>创建: {new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-sm text-blue-600 font-medium">
                    查看详情 <ArrowRight className="w-3.5 h-3.5" />
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
