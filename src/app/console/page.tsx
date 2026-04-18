"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Package, CreditCard, Plus } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
}

export default function ConsoleDashboard() {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">租户数量</p>
              <p className="text-2xl font-bold text-slate-900">{tenants.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">已订阅产品</p>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">待支付账单</p>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">我的租户</h2>
        <Link href="/console/tenants/new">
          <Button className="bg-slate-900 hover:bg-slate-800 text-white">
            <Plus className="w-4 h-4 mr-2" /> 创建租户
          </Button>
        </Link>
      </div>

      {loading ? (
        <p className="text-slate-500">加载中...</p>
      ) : tenants.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            还没有租户，<Link href="/console/tenants/new" className="text-blue-600 hover:underline">立即创建</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenants.map((t) => (
            <Link key={t.id} href={`/console/tenants/${t.id}`}>
              <Card className="hover:border-slate-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{t.name}</h3>
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                      {t.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{t.slug}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
