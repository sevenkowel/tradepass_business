"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, ArrowRight, Shield } from "lucide-react";
import type { AuthConfig, AuthFormField } from "@/lib/auth-config";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId");

  // 从当前 URL 推断 portal 子域名
  // 当前在 {tenant}.localhost:3002 → http://portal.{tenant}.localhost:3002
  const portalUrl = (() => {
    if (typeof window !== "undefined") {
      const host = window.location.host;
      // host = "2026429-cmok2r.localhost:3002"
      // 只要有 "." 就认为这是一个租户域名
      if (host.includes(".")) {
        return `http://portal.${host}`;
      }
    }
    return "/portal";
  })();

  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);

  const [step, setStep] = useState<"form" | "verify" | "success">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [agreements, setAgreements] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [skipVerify, setSkipVerify] = useState(true);

  const [otpCode, setOtpCode] = useState("");
  const [otpTarget, setOtpTarget] = useState("");
  const [otpType, setOtpType] = useState<"email" | "phone">("email");
  const [otpHint, setOtpHint] = useState("");
  const [otpSending, setOtpSending] = useState(false);

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
          const initialAgreements: Record<string, boolean> = {};
          data.data.agreements.forEach((a: { id: string }) => {
            initialAgreements[a.id] = false;
          });
          setAgreements(initialAgreements);
        }
      } catch {
        // fallback
      } finally {
        setConfigLoading(false);
      }
    }
    loadConfig();
  }, [tenantId]);

  const handleFieldChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const validateForm = useCallback((): boolean => {
    if (!config) return false;
    const errors: Record<string, string> = {};

    for (const field of config.registerFields) {
      const value = formData[field.name];
      if (field.required && (!value || value.trim() === "")) {
        errors[field.name] = `${field.label} 为必填项`;
      }
      if (field.type === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[field.name] = "请输入有效的邮箱地址";
      }
      if (field.type === "password" && value) {
        const policy = config.passwordPolicy;
        if (value.length < policy.minLength) {
          errors[field.name] = `密码至少 ${policy.minLength} 位`;
        }
      }
    }

    for (const agr of config.agreements) {
      if (agr.required && !agreements[agr.id]) {
        errors[`agreement_${agr.id}`] = `请同意 ${agr.title}`;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [config, formData, agreements]);

  const sendOTP = useCallback(async () => {
    const target = otpType === "email" ? formData.email : formData.phone;
    if (!target) return;
    setOtpSending(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "otp", target, action: "register" }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpHint(data.hint);
        setOtpTarget(target);
      }
    } catch {
      setOtpHint("发送验证码失败，请重试");
    } finally {
      setOtpSending(false);
    }
  }, [otpType, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    const email = formData.email;
    const phone = formData.phone;

    if (!skipVerify && config) {
      const needEmailOtp = config.emailVerificationRequired && email;
      const needPhoneOtp = config.phoneVerificationRequired && phone;
      if (needEmailOtp || needPhoneOtp) {
        setOtpType(needEmailOtp ? "email" : "phone");
        setStep("verify");
        sendOTP();
        return;
      }
    }

    await doRegister(skipVerify ? formData : { ...formData, otpCode });
  };

  const handleVerifySubmit = async () => {
    if (!otpCode.trim()) {
      setError("请输入验证码");
      return;
    }
    await doRegister({ ...formData, otpCode });
  };

  const doRegister = async (payload: Record<string, string>) => {
    setLoading(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        name: payload.name,
        otpCode: payload.otpCode,
        skipVerification: skipVerify,
      };
      if (tenantId) body.tenantId = tenantId;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        if (data.requireOtp) {
          setOtpType(data.otpType === "email" ? "email" : "phone");
          setStep("verify");
          sendOTP();
          return;
        }
        setError(data.error || "注册失败");
        return;
      }

      // 无论 autoLogin 是否为 true，都确保 token cookie 已设置
      if (data.token) {
        document.cookie = `token=${data.token}; path=/; max-age=604800; domain=.localhost`;
      }
      if (data.tenantId) {
        document.cookie = `portal_tenant=${data.tenantId}; path=/; max-age=604800; domain=.localhost`;
      }

      setStep("success");
      setTimeout(() => {
        window.location.href = portalUrl;
      }, 1500);
    } catch {
      setLoading(false);
      setError("网络错误，请稍后重试");
    }
  };

  const renderField = (field: AuthFormField) => {
    const value = formData[field.name] || "";
    const errorMsg = fieldErrors[field.name];

    if (field.type === "select" && field.options) {
      return (
        <select
          value={value}
          onChange={(e) => handleFieldChange(field.name, e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
        >
          <option value="">{field.placeholder || `请选择${field.label}`}</option>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => handleFieldChange(field.name, e.target.checked ? "true" : "")}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-600">{field.placeholder || field.label}</span>
        </label>
      );
    }

    return (
      <Input
        name={field.name}
        type={field.type === "password" && !showPassword ? "password" : field.type === "password" ? "text" : field.type}
        value={value}
        onChange={(e) => handleFieldChange(field.name, e.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        className={errorMsg ? "border-red-300 focus:border-red-400" : ""}
      />
    );
  };

  if (configLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h1 className="text-xl font-bold text-gray-900">注册成功</h1>
            <p className="text-gray-600">正在跳转至交易门户...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-5">
            <div className="text-center">
              <Shield className="w-10 h-10 text-primary mx-auto mb-2" />
              <h1 className="text-xl font-bold text-gray-900">验证您的{otpType === "email" ? "邮箱" : "手机"}</h1>
              <p className="text-sm text-gray-500 mt-1">
                验证码已发送至 {otpTarget}
              </p>
            </div>

            {otpHint && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <p className="font-medium">Demo 模式</p>
                <p>{otpHint}</p>
                <p className="text-xs mt-1">今天的验证码：{new Date().getMonth() + 1}月{new Date().getDate()}日 → <span className="font-mono font-bold">{String(new Date().getMonth() + 1).padStart(2, "0")}{String(new Date().getDate()).padStart(2, "0")}</span></p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">验证码</label>
              <Input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="请输入4位验证码"
                maxLength={4}
                className="mt-1 text-center text-lg tracking-widest"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setStep("form")}
                disabled={loading}
              >
                返回
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary-dark text-white"
                onClick={handleVerifySubmit}
                disabled={loading || otpCode.length < 4}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "验证并注册"}
              </Button>
            </div>

            <button
              onClick={sendOTP}
              disabled={otpSending}
              className="w-full text-sm text-primary hover:underline"
            >
              {otpSending ? "发送中..." : "重新发送验证码"}
            </button>
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
            <h1 className="text-2xl font-bold text-gray-900">开通交易账户</h1>
            <p className="text-sm text-gray-500 mt-1">注册 TradePass 交易门户</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {config?.registerFields.map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                <div className="mt-1">
                  {renderField(field)}
                </div>
                {fieldErrors[field.name] && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors[field.name]}</p>
                )}
              </div>
            ))}

            {config?.registerFields.some((f) => f.type === "password") && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-600">显示密码</span>
              </label>
            )}

            {config && config.agreements.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700">注册协议</p>
                {config.agreements.map((agr) => (
                  <label key={agr.id} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!agreements[agr.id]}
                      onChange={(e) =>
                        setAgreements((prev) => ({ ...prev, [agr.id]: e.target.checked }))
                      }
                      className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-600">
                      我已阅读并同意
                      <span className="text-primary hover:underline cursor-pointer">《{agr.title}》</span>
                      {agr.required && <span className="text-red-500 ml-0.5">*</span>}
                    </span>
                  </label>
                ))}
                {fieldErrors[`agreement_${config.agreements[0]?.id}`] && (
                  <p className="text-xs text-red-500">
                    请阅读并同意所有必填协议
                  </p>
                )}
              </div>
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={skipVerify}
                onChange={(e) => setSkipVerify(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-600">跳过验证，直接激活（Demo 模式）</span>
            </label>

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
                  注册 <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500">
            已有账号？
            <Link href={`/auth/portal/login${tenantId ? `?tenantId=${tenantId}` : ""}`} className="text-primary hover:underline">
              立即登录
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
