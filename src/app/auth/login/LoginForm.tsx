"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    router.push("/console");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">登录 TradePass</h1>
            <p className="text-sm text-slate-500 mt-1">管理您的产品与租户</p>
          </div>

          {verified && (
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
              邮箱验证成功，请登录
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">邮箱</label>
              <Input name="email" type="email" required className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">密码</label>
              <Input name="password" type="password" required className="mt-1" />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full bg-[#1E40AF] hover:bg-[#1E3A8A] text-white">
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            还没有账号？<Link href="/auth/register" className="text-blue-600 hover:underline">立即注册</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
