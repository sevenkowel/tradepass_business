"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, Ban, CheckCircle2, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { cn } from "@/lib/utils";

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  status: string;
  kycStatus: string | null;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data.users || []);
    setLoading(false);
  }

  async function updateStatus(userId: string, status: string) {
    setUpdatingId(userId);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status }),
    });
    await fetchUsers();
    setUpdatingId(null);
  }

  const filtered = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(search.toLowerCase()))
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
            placeholder="搜索邮箱或姓名..."
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
                  <th className="text-left px-5 py-3 font-medium text-slate-500">用户</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">状态</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">KYC</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">注册时间</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">最后登录</th>
                  <th className="text-right px-5 py-3 font-medium text-slate-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{u.name || "-"}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-slate-500">{u.kycStatus || "-"}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {u.status === "active" ? (
                        <ConfirmDialog
                          title="确认禁用用户"
                          description={`确定要禁用用户 ${u.email} 吗？禁用后该用户将无法登录。`}
                          confirmText="禁用"
                          variant="danger"
                          onConfirm={() => updateStatus(u.id, "suspended")}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingId === u.id}
                            >
                              {updatingId === u.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Ban className="w-3.5 h-3.5 mr-1" />
                              )}
                              禁用
                            </Button>
                          }
                        />
                      ) : (
                        <ConfirmDialog
                          title="确认恢复用户"
                          description={`确定要恢复用户 ${u.email} 的访问权限吗？`}
                          confirmText="恢复"
                          onConfirm={() => updateStatus(u.id, "active")}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={updatingId === u.id}
                            >
                              {updatingId === u.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
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
                icon={<Users className="w-5 h-5" />}
                title={search ? "未找到匹配用户" : "暂无用户"}
                description={search ? "请尝试其他搜索关键词" : "还没有用户注册。"}
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
    suspended: "bg-red-100 text-red-700",
    pending_verification: "bg-amber-100 text-amber-700",
    pending_invite: "bg-blue-100 text-blue-700",
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
