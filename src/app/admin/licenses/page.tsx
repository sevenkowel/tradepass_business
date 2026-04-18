"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Ban, RotateCcw, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface LicenseItem {
  id: string;
  key: string;
  productCode: string;
  status: string;
  issuedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  tenant: { name: string; slug: string };
  subscription: { planName: string; product: { name: string } };
}

export default function AdminLicensesPage() {
  const [licenses, setLicenses] = useState<LicenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchLicenses();
  }, []);

  async function fetchLicenses() {
    const res = await fetch("/api/admin/licenses");
    const data = await res.json();
    setLicenses(data.licenses || []);
    setLoading(false);
  }

  async function updateStatus(licenseId: string, status: string) {
    setUpdatingId(licenseId);
    await fetch("/api/admin/licenses", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseId, status }),
    });
    await fetchLicenses();
    setUpdatingId(null);
  }

  const filtered = licenses.filter(
    (l) =>
      l.key.toLowerCase().includes(search.toLowerCase()) ||
      l.tenant.name.toLowerCase().includes(search.toLowerCase()) ||
      l.productCode.toLowerCase().includes(search.toLowerCase())
  );

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
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索 License Key、租户或产品..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">License Key</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">产品</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">租户</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">状态</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">签发时间</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <LicenseKeyCell keyValue={l.key} />
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{l.subscription.product.name}</p>
                      <p className="text-xs text-slate-500">{l.subscription.planName}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{l.tenant.name}</p>
                      <p className="text-xs text-slate-500">{l.tenant.slug}</p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(l.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {l.status === "active" ? (
                        <ConfirmDialog
                          title="确认吊销 License"
                          description={`确定要吊销租户 ${l.tenant.name} 的 License 吗？吊销后该租户将无法使用对应产品。`}
                          confirmText="吊销"
                          variant="danger"
                          onConfirm={() => updateStatus(l.id, "revoked")}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingId === l.id}
                            >
                              {updatingId === l.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Ban className="w-3.5 h-3.5 mr-1" />
                              )}
                              吊销
                            </Button>
                          }
                        />
                      ) : (
                        <ConfirmDialog
                          title="确认恢复 License"
                          description={`确定要恢复租户 ${l.tenant.name} 的 License 吗？`}
                          confirmText="恢复"
                          onConfirm={() => updateStatus(l.id, "active")}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingId === l.id}
                            >
                              {updatingId === l.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                              )}
                              恢复
                            </Button>
                          }
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <EmptyState
                icon={<KeyRound className="w-5 h-5" />}
                title={search ? "未找到匹配 License" : "暂无 License"}
                description={search ? "请尝试其他搜索关键词" : "还没有 License 被创建。"}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    revoked: "bg-red-100 text-red-700",
    expired: "bg-slate-100 text-slate-600",
  };
  return (
    <span
      className={cn(
        "text-xs px-2 py-0.5 rounded-full font-medium",
        map[status] || "bg-slate-100 text-slate-600"
      )}
    >
      {status}
    </span>
  );
}

function LicenseKeyCell({ keyValue }: { keyValue: string }) {
  const [revealed, setRevealed] = useState(false);

  const masked = keyValue.length > 8
    ? keyValue.slice(0, 4) + "****" + keyValue.slice(-4)
    : "****";

  return (
    <button
      onClick={() => setRevealed(!revealed)}
      className="font-mono text-xs text-slate-900 hover:text-blue-600 transition-colors"
      title={revealed ? "点击隐藏" : "点击显示"}
    >
      {revealed ? keyValue : masked}
    </button>
  );
}
