"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import {
  Key,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Globe,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { useTenantStore } from "@/store/tenantStore";

interface OAuthApp {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  clientSecret: string;
  redirectUris: string[];
  scopes: string[];
  status: string;
  rateLimit: number;
  lastUsedAt?: string;
  createdAt: string;
}

export default function OAuthAppsPage() {
  const [apps, setApps] = useState<OAuthApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newAppSecret, setNewAppSecret] = useState<string | null>(null);
  const { currentTenant } = useTenantStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    redirectUri: "",
    scopes: ["read"],
    rateLimit: 1000,
  });

  useEffect(() => {
    if (!currentTenant) return;
    fetchApps();
  }, [currentTenant]);

  async function fetchApps() {
    setLoading(true);
    const res = await fetch(`/api/console/oauth-apps?tenantId=${currentTenant?.id}`);
    const data = await res.json();
    setApps(data.apps || []);
    setLoading(false);
  }

  async function createApp() {
    if (!formData.name || !formData.redirectUri) return;
    setCreating(true);
    const res = await fetch("/api/console/oauth-apps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantId: currentTenant?.id,
        name: formData.name,
        description: formData.description,
        redirectUris: [formData.redirectUri],
        scopes: formData.scopes,
        rateLimit: formData.rateLimit,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setNewAppSecret(data.app.clientSecret);
      setShowForm(false);
      setFormData({ name: "", description: "", redirectUri: "", scopes: ["read"], rateLimit: 1000 });
      await fetchApps();
    }
    setCreating(false);
  }

  async function deleteApp(id: string) {
    if (!confirm("确认删除此应用？删除后所有使用该 Client ID 的集成将失效。")) return;
    await fetch(`/api/console/oauth-apps/${id}`, { method: "DELETE" });
    await fetchApps();
  }

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--tp-accent-rgb))]" />
      </div>
    );
  }

  return (
    <div className="p-6  mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">OAuth2 应用</h1>
          <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)] mt-1">
            管理第三方应用接入，控制 API 访问权限
          </p>
        </div>
        <Button variant="default" onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-1.5" />
          {showForm ? "取消" : "创建应用"}
        </Button>
      </div>

      {/* New App Secret Alert */}
      {newAppSecret && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800">应用创建成功</p>
                <p className="text-xs text-emerald-700 mt-1 mb-2">
                  Client Secret 仅显示一次，请妥善保存。
                </p>
                <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-emerald-200">
                  <code className="text-xs font-mono text-emerald-800 flex-1">{newAppSecret}</code>
                  <button onClick={() => copy(newAppSecret, "new-secret")}>
                    {copiedId === "new-secret" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                </div>
                <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => setNewAppSecret(null)}>
                  我已保存
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Form */}
      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-4 text-[rgb(var(--tp-fg-rgb))]">新建 OAuth2 应用</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)] mb-1 block">应用名称 *</label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="My Trading Bot" />
              </div>
              <div>
                <label className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)] mb-1 block">重定向 URI *</label>
                <Input value={formData.redirectUri} onChange={(e) => setFormData({ ...formData, redirectUri: e.target.value })} placeholder="https://myapp.com/callback" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)] mb-1 block">描述</label>
                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="应用用途说明" />
              </div>
              <div>
                <label className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)] mb-1 block">权限范围</label>
                <div className="flex gap-2">
                  {["read", "write"].map((scope) => (
                    <label key={scope} className="flex items-center gap-1.5 text-sm text-[rgb(var(--tp-fg-rgb))]">
                      <input
                        type="checkbox"
                        checked={formData.scopes.includes(scope)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...formData.scopes, scope]
                            : formData.scopes.filter((s) => s !== scope);
                          setFormData({ ...formData, scopes: next });
                        }}
                        className="rounded border-[var(--tp-border)]"
                      />
                      {scope === "read" ? "读取" : "写入"}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)] mb-1 block">请求限流 (次/小时)</label>
                <Input type="number" value={formData.rateLimit} onChange={(e) => setFormData({ ...formData, rateLimit: Number(e.target.value) })} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>取消</Button>
              <Button variant="default" size="sm" onClick={createApp} disabled={creating || !formData.name || !formData.redirectUri}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                创建
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* App List */}
      {apps.length === 0 ? (
        <EmptyState icon={<Key className="w-8 h-8" />} title="暂无 OAuth2 应用" description="创建应用以启用第三方 API 集成" />
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <Card key={app.id} className={cn("overflow-hidden", app.status !== "active" && "opacity-60")}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[rgba(var(--tp-accent-rgb),0.1)] flex items-center justify-center">
                      <Shield className="w-5 h-5 text-[rgb(var(--tp-accent-rgb))]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[rgb(var(--tp-fg-rgb))]">{app.name}</h3>
                      {app.description && <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">{app.description}</p>}
                    </div>
                  </div>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", app.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                    {app.status === "active" ? "生效中" : "已停用"}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                    <span className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)] w-20 flex-shrink-0">Client ID</span>
                    <code className="text-xs font-mono text-[rgb(var(--tp-fg-rgb))] flex-1 truncate">{app.clientId}</code>
                    <button onClick={() => copy(app.clientId, `id-${app.id}`)}>
                      {copiedId === `id-${app.id}` ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[rgba(var(--tp-fg-rgb),0.4)]" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-lg px-3 py-2">
                    <span className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)] w-20 flex-shrink-0">Secret</span>
                    <code className="text-xs font-mono text-[rgb(var(--tp-fg-rgb))] flex-1">
                      {showSecret[app.id] ? app.clientSecret : "••••••••••••••••"}
                    </code>
                    <button onClick={() => setShowSecret((prev) => ({ ...prev, [app.id]: !prev[app.id] }))}>
                      {showSecret[app.id] ? <EyeOff className="w-3.5 h-3.5 text-[rgba(var(--tp-fg-rgb),0.4)]" /> : <Eye className="w-3.5 h-3.5 text-[rgba(var(--tp-fg-rgb),0.4)]" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[rgba(var(--tp-fg-rgb),0.6)] mb-4">
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {app.redirectUris.length} 个重定向 URI
                  </span>
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    {app.scopes.join(", ")}
                  </span>
                  <span>限流: {app.rateLimit}/小时</span>
                  {app.lastUsedAt && <span>最后使用: {new Date(app.lastUsedAt).toLocaleDateString("zh-CN")}</span>}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[var(--tp-border)]">
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => deleteApp(app.id)}>
                    <Trash2 className="w-3.5 h-3.5 mr-1 text-red-400" />
                    删除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
