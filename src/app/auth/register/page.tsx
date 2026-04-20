"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verifyUrl, setVerifyUrl] = useState("");
  const [skipVerify, setSkipVerify] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        name: form.get("name"),
        company: form.get("company"),
        skipVerification: skipVerify,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }

    if (data.autoLogin && data.token) {
      document.cookie = `token=${data.token}; path=/; max-age=604800`;
      router.push("/console/onboarding");
      return;
    }

    setSuccess(true);
    setVerifyUrl(data.verifyUrl || "");
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <h1 className="text-xl font-bold text-slate-900">注册成功</h1>
            <p className="text-slate-600">请查收验证邮件并点击链接激活账号。</p>
            {verifyUrl && (
              <div className="p-3 bg-slate-100 rounded text-sm text-left">
                <p className="text-slate-500 mb-1">Demo 验证链接：</p>
                <Link href={verifyUrl} className="text-blue-600 hover:underline break-all">
                  {verifyUrl}
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">注册 TradePass</h1>
            <p className="text-sm text-slate-500 mt-1">开启您的 SaaS 之旅</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">姓名</label>
              <Input name="name" required className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">邮箱</label>
              <Input name="email" type="email" required className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">公司名称（选填）</label>
              <Input name="company" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">密码</label>
              <Input name="password" type="password" required minLength={8} className="mt-1" />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={skipVerify}
                onChange={(e) => setSkipVerify(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-600">跳过邮箱验证，直接激活（开发环境）</span>
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full bg-[#1E40AF] hover:bg-[#1E3A8A] text-white">
              {loading ? "注册中..." : skipVerify ? "注册并进入 Console" : "注册"}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-500">
            已有账号？<Link href="/auth/login" className="text-blue-600 hover:underline">立即登录</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
