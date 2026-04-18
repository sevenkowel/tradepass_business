"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Copy, CheckCircle2, Users, Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TenantDetail {
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: string;
    region: string;
    trialEndsAt: string | null;
  };
  subscriptions: {
    id: string;
    product: { name: string; code: string };
    status: string;
    planName: string;
    trialEndsAt: string | null;
  }[];
  licenses: {
    id: string;
    key: string;
    productCode: string;
    status: string;
  }[];
  members: {
    id: string;
    role: string;
    user: { email: string; name: string | null };
  }[];
}

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<TenantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [featuresLoading, setFeaturesLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/console/tenants/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
    fetch(`/api/console/tenants/${id}/features`)
      .then((r) => r.json())
      .then((d) => {
        if (d.features) setFeatures(d.features);
      });
  }, [id]);

  function copyLicense(key: string) {
    navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function toggleFeature(key: string) {
    const next = { ...features, [key]: !features[key] };
    setFeatures(next);
    setFeaturesLoading(true);
    await fetch(`/api/console/tenants/${id}/features`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ features: next }),
    });
    setFeaturesLoading(false);
  }

  if (loading || !data) {
    return <p className="text-slate-500">加载中...</p>;
  }

  const { tenant, subscriptions, licenses, members } = data;
  const hasBrokerOS = subscriptions.some((s) => s.product.code === "broker_os");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/console">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> 返回
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-slate-900">{tenant.name}</h1>
        <span
          className={cn(
            "text-xs px-2 py-1 rounded-full font-medium",
            tenant.status === "trial" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
          )}
        >
          {tenant.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Access Cards */}
          {hasBrokerOS && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <h2 className="font-semibold text-slate-900">业务系统入口</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link
                    href={`/portal?tenant=${tenant.id}`}
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-900">Portal</p>
                      <p className="text-xs text-slate-500">客户交易门户</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </Link>
                  <Link
                    href={`/backoffice?tenant=${tenant.id}`}
                    className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-900">Backoffice</p>
                      <p className="text-xs text-slate-500">运营管理后台</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscriptions */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900">已订阅产品</h2>
                <Link href={`/console/tenants/${id}/subscribe`}>
                  <Button variant="outline" size="sm">新增订阅</Button>
                </Link>
              </div>
              {subscriptions.length === 0 ? (
                <p className="text-sm text-slate-500">尚未订阅任何产品</p>
              ) : (
                <div className="space-y-3">
                  {subscriptions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{s.product.name}</p>
                        <p className="text-xs text-slate-500">{s.planName} · {s.status}</p>
                      </div>
                      {s.trialEndsAt && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          试用至 {new Date(s.trialEndsAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Licenses */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-semibold text-slate-900">License 密钥</h2>
              {licenses.length === 0 ? (
                <p className="text-sm text-slate-500">暂无 License</p>
              ) : (
                <div className="space-y-3">
                  {licenses.map((l) => (
                    <div key={l.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500 uppercase">{l.productCode}</p>
                        <p className="font-mono text-sm text-slate-900 truncate">{l.key}</p>
                      </div>
                      <button
                        onClick={() => copyLicense(l.key)}
                        className="p-2 hover:bg-white rounded-lg text-slate-500 transition-colors"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Feature Toggles */}
          {hasBrokerOS && Object.keys(features).length > 0 && (
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-slate-900">产品功能开关</h2>
                  {featuresLoading && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                </div>
                <div className="space-y-2">
                  {[
                    { key: "portal", label: "客户门户 (Portal)", desc: "终端客户交易与账户管理" },
                    { key: "backoffice", label: "运营后台 (Backoffice)", desc: "经纪商运营管理后台" },
                    { key: "kyc", label: "KYC 认证", desc: "身份验证与合规审核流程" },
                    { key: "fund_system", label: "资金系统", desc: "出入金、钱包与费率管理" },
                    { key: "copy_trading", label: "跟单交易", desc: "社交化跟单与信号复制" },
                    { key: "ib_system", label: "IB 代理系统", desc: "多级代理与佣金结算" },
                    { key: "api_access", label: "API 接入", desc: "REST API 与 WebSocket 行情" },
                    { key: "white_label", label: "白标定制", desc: "品牌定制与域名绑定" },
                  ].map((f) => (
                    <div
                      key={f.key}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900">{f.label}</p>
                        <p className="text-xs text-slate-500">{f.desc}</p>
                      </div>
                      <button
                        onClick={() => toggleFeature(f.key)}
                        disabled={featuresLoading}
                        className="shrink-0"
                      >
                        {features[f.key] ? (
                          <ToggleRight className="w-8 h-8 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-slate-300" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 space-y-4">
              <h2 className="font-semibold text-slate-900">基本信息</h2>
              <div className="text-sm space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">标识</span><span>{tenant.slug}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">区域</span><span>{tenant.region}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">状态</span><span>{tenant.status}</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Users className="w-4 h-4" />成员</h2>
                <Link href={`/console/tenants/${id}/members/invite`}>
                  <Button variant="outline" size="sm">邀请</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-900">{m.user.name || m.user.email}</p>
                      <p className="text-xs text-slate-500">{m.user.email}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{m.role}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
