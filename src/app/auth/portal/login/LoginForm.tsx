"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowRight, Loader2, Shield, Eye, EyeOff } from "lucide-react";
import type { AuthConfig } from "@/lib/auth-config";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId");

  // 登录成功后跳转到 Portal（纯路径模式）
  const portalUrl = "/portal";

  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  const [step, setStep] = useState<"password" | "2fa">("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");

  const [otpCode, setOtpCode] = useState("");
  const [twoFAHint, setTwoFAHint] = useState("");

  useEffect(() => {
    async function loadConfig() {
      try {
        const url = tenantId
          ? `/api/config/auth?tenantId=${tenantId}`
          : "/api/config/auth";
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setConfig(data.data);
          if (data.data.loginMethods.includes("email")) {
            setLoginMethod("email");
          } else if (data.data.loginMethods.includes("phone")) {
            setLoginMethod("phone");
          }
        }
      } catch {
        // fallback
      } finally {
        setConfigLoading(false);
      }
    }
    loadConfig();
  }, [tenantId]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginMethod === "email" ? email : undefined,
          phone: loginMethod === "phone" ? phone : undefined,
          password,
          loginStep: "password",
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        if (data.require2FA) {
          setStep("2fa");
          setTwoFAHint(data.hint || "");
          return;
        }
        setError(data.error || "登录失败");
        return;
      }

      if (data.redirectTo) {
        window.location.href = portalUrl;
      } else {
        window.location.href = portalUrl;
      }
    } catch {
      setLoading(false);
      setError("网络错误，请稍后重试");
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginMethod === "email" ? email : undefined,
          phone: loginMethod === "phone" ? phone : undefined,
          password,
          otpCode,
          loginStep: "2fa",
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "2FA 验证失败");
        return;
      }

      if (data.redirectTo) {
        window.location.href = portalUrl;
      } else {
        window.location.href = portalUrl;
      }
    } catch {
      setLoading(false);
      setError("网络错误，请稍后重试");
    }
  };

  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (step === "2fa") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-5">
            <div className="text-center">
              <Shield className="w-10 h-10 text-primary mx-auto mb-2" />
              <h1 className="text-xl font-bold text-gray-900">双重验证</h1>
              <p className="text-sm text-gray-500 mt-1">
                请输入 2FA 验证码完成登录
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <p className="font-medium">Demo 模式</p>
              <p>{twoFAHint || "请输入当天 2FA 验证码"}</p>
              <p className="text-xs mt-1">
                今天的验证码：
                <span className="font-mono font-bold">
                  {String(new Date().getFullYear()).slice(-2)}
                  {String(new Date().getMonth() + 1).padStart(2, "0")}
                  {String(new Date().getDate()).padStart(2, "0")}
                </span>
              </p>
            </div>

            <form onSubmit={handle2FASubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">2FA 验证码</label>
                <Input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="请输入6位验证码"
                  maxLength={6}
                  className="mt-1 text-center text-lg tracking-widest"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1"
                  onClick={() => setStep("password")}
                  disabled={loading}
                >
                  返回
                </Button>
                <Button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "验证登录"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-5">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">登录交易门户</h1>
            <p className="text-sm text-gray-500 mt-1">访问您的交易账户和资金</p>
          </div>

          {config && config.loginMethods.length > 1 && (
            <div className="flex rounded-lg bg-gray-100 p-1">
              {config.loginMethods.map((method) => (
                <button
                  key={method}
                  onClick={() => setLoginMethod(method)}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    loginMethod === method
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {method === "email" ? "邮箱登录" : "手机登录"}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {loginMethod === "email" ? (
              <div>
                <label className="text-sm font-medium text-gray-700">邮箱</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="mt-1"
                />
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-700">手机号</label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+86 138 0000 0000"
                  required
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">密码</label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-600">记住我</span>
              </label>
              <Link href="#" className="text-sm text-primary hover:underline">
                忘记密码？
              </Link>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  登录 <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500">
            还没有账号？
            <Link
              href={`/auth/portal/register${tenantId ? `?tenantId=${tenantId}` : ""}`}
              className="text-primary hover:underline"
            >
              立即注册
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
