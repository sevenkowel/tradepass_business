"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function InviteMemberPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setResult(null);

    const res = await fetch(`/api/console/tenants/${id}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });

    const data = await res.json();
    if (res.ok) {
      setResult({ success: true, message: `邀请已发送至 ${email}` });
      setEmail("");
    } else {
      setResult({ success: false, message: data.error || "邀请失败" });
    }
    setLoading(false);
  }

  return (
    <div className=" mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/console/tenants/${id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> 返回
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-slate-900">邀请成员</h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                邮箱地址
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                角色权限
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "admin", label: "管理员", desc: "管理租户、成员和订阅" },
                  { value: "operator", label: "运营", desc: "管理业务数据和配置" },
                  { value: "viewer", label: "观察员", desc: "只读访问所有数据" },
                ].map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      role === r.value
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-sm font-medium">{r.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {result && (
              <div
                className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  result.success
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                {result.message}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="submit"
                disabled={loading || !email}
                className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "发送邀请"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/console/tenants/${id}`)}
              >
                取消
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
