"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Shield,
  TrendingUp,
  Wallet,
  Rocket,
  ChevronRight,
  ChevronLeft,
  Check,
  Globe,
  Lock,
  CreditCard,
  Landmark,
  Bitcoin,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "品牌与身份", icon: Building2 },
  { id: 2, title: "业务配置", icon: Shield },
  { id: 3, title: "交易配置", icon: TrendingUp },
  { id: 4, title: "资金配置", icon: Wallet },
  { id: 5, title: "三方通道", icon: Globe },
  { id: 6, title: "审核与发布", icon: Rocket },
];

const KYC_REGIONS = [
  { code: "VN", name: "越南" },
  { code: "TH", name: "泰国" },
  { code: "IN", name: "印度" },
  { code: "AE", name: "阿联酋" },
  { code: "KR", name: "韩国" },
  { code: "JP", name: "日本" },
  { code: "FR", name: "法国" },
  { code: "ES", name: "西班牙" },
  { code: "BR", name: "巴西" },
];

const TRADING_GROUPS = [
  { id: "forex", label: "外汇 (Forex)" },
  { id: "metals", label: "贵金属 (Metals)" },
  { id: "indices", label: "指数 (Indices)" },
  { id: "crypto", label: "加密货币 (Crypto)" },
  { id: "stocks", label: "股票 (Stocks)" },
];

const LEVERAGES = ["1:50", "1:100", "1:200", "1:500"];

const SPREAD_MODES = [
  { id: "fixed", label: "固定点差" },
  { id: "floating", label: "浮动点差" },
  { id: "raw", label: "原始点差 + 佣金" },
];

const CURRENCIES = ["USD", "EUR", "GBP", "JPY"];

const PAYMENT_CHANNELS = [
  { id: "bank", label: "银行转账", icon: Landmark },
  { id: "usdt", label: "USDT (TRC20)", icon: Bitcoin },
  { id: "card", label: "信用卡", icon: CreditCard },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch("/api/onboarding")
      .then((r) => r.json())
      .then((res) => {
        if (res.onboarding) {
          setStep(res.onboarding.step);
          try {
            setData(JSON.parse(res.onboarding.data) || {});
          } catch {
            setData({});
          }
          if (res.onboarding.status === "completed") {
            router.replace("/console");
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  const saveStep = useCallback(
    async (nextStep: number, stepData?: any) => {
      setSaving(true);
      const merged = { ...data, ...(stepData || {}) };
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: nextStep, data: merged }),
      });
      setData(merged);
      setStep(nextStep);
      setSaving(false);
    },
    [data]
  );

  const complete = useCallback(async () => {
    setSaving(true);
    await fetch("/api/onboarding/complete", { method: "POST" });
    setSaving(false);
    router.replace("/console");
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--tp-bg)]">
        <div className="w-8 h-8 border-2 border-[rgb(var(--tp-accent-rgb))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--tp-bg)] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-[rgb(var(--tp-fg-rgb))] mb-2">
            初始化您的 TradePass Business
          </h1>
          <p className="text-[rgba(var(--tp-fg-rgb),0.6)]">
            完成以下配置，即可开始使用 TradePass 平台
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-12">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                  step > s.id
                    ? "bg-[rgb(var(--tp-accent-rgb))] text-white"
                    : step === s.id
                    ? "bg-[rgb(var(--tp-accent-rgb))] text-white ring-4 ring-[rgba(var(--tp-accent-rgb),0.2)]"
                    : "bg-[rgba(var(--tp-fg-rgb),0.1)] text-[rgba(var(--tp-fg-rgb),0.4)]"
                )}
              >
                {step > s.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <s.icon className="w-5 h-5" />
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 rounded transition-colors",
                    step > s.id
                      ? "bg-[rgb(var(--tp-accent-rgb))]"
                      : "bg-[rgba(var(--tp-fg-rgb),0.1)]"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-[var(--tp-surface)] rounded-2xl border border-[var(--tp-border)] p-8"
          >
            {step === 1 && (
              <Step1Brand
                data={data}
                onNext={(d) => saveStep(2, d)}
              />
            )}
            {step === 2 && (
              <Step2Auth
                data={data}
                onNext={(d) => saveStep(3, d)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <Step3Trading
                data={data}
                onNext={(d) => saveStep(4, d)}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <Step4Funds
                data={data}
                onNext={(d) => saveStep(5, d)}
                onBack={() => setStep(3)}
              />
            )}
            {step === 5 && (
              <Step5Channels
                data={data}
                onNext={(d) => saveStep(6, d)}
                onBack={() => setStep(4)}
              />
            )}
            {step === 6 && (
              <Step6Publish
                data={data}
                onComplete={complete}
                onBack={() => setStep(5)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Saving indicator */}
        {saving && (
          <p className="text-center text-sm text-[rgba(var(--tp-fg-rgb),0.5)] mt-4">
            保存中...
          </p>
        )}
      </div>
    </div>
  );
}

// ========== Step 1: Brand & Identity ==========
function Step1Brand({ data, onNext }: { data: any; onNext: (d: any) => void }) {
  const [brandName, setBrandName] = useState(data.brandName || "");
  const [slogan, setSlogan] = useState(data.slogan || "");
  const [subdomain, setSubdomain] = useState(data.subdomain || "");
  const [primaryColor, setPrimaryColor] = useState(data.primaryColor || "#1a73e8");
  const [logoPreview, setLogoPreview] = useState<string | null>(data.logoUrl || null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(data.faviconUrl || null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "favicon") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (type === "logo") setLogoPreview(result);
      else setFaviconPreview(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[rgb(var(--tp-fg-rgb))]">品牌与身份</h2>
        <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)] mt-1">
          配置您的品牌标识，这些将展示在 Portal 和 Backoffice 中
        </p>
      </div>

      {/* Brand Name */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))] mb-2">
          品牌名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="例如：MyBroker"
          className="w-full h-10 px-3 rounded-lg border border-[var(--tp-border)] bg-[var(--tp-bg)] text-[rgb(var(--tp-fg-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--tp-accent-rgb))]/20 focus:border-[rgb(var(--tp-accent-rgb))]"
        />
      </div>

      {/* Slogan */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))] mb-2">
          Slogan / 标语
        </label>
        <input
          type="text"
          value={slogan}
          onChange={(e) => setSlogan(e.target.value)}
          placeholder="例如：全球领先的金融服务平台"
          className="w-full h-10 px-3 rounded-lg border border-[var(--tp-border)] bg-[var(--tp-bg)] text-[rgb(var(--tp-fg-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--tp-accent-rgb))]/20 focus:border-[rgb(var(--tp-accent-rgb))]"
        />
      </div>

      {/* Logo & Favicon Upload */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))] mb-2">
            Logo
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoUpload(e, "logo")}
              className="hidden"
              id="logo-upload"
            />
            <label
              htmlFor="logo-upload"
              className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-[var(--tp-border)] bg-[var(--tp-bg)] cursor-pointer hover:border-[rgb(var(--tp-accent-rgb))] transition-colors overflow-hidden"
            >
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain p-2" />
              ) : (
                <>
                  <Building2 className="w-6 h-6 text-[rgba(var(--tp-fg-rgb),0.4)] mb-2" />
                  <span className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">点击上传 Logo</span>
                </>
              )}
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))] mb-2">
            Favicon
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoUpload(e, "favicon")}
              className="hidden"
              id="favicon-upload"
            />
            <label
              htmlFor="favicon-upload"
              className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-[var(--tp-border)] bg-[var(--tp-bg)] cursor-pointer hover:border-[rgb(var(--tp-accent-rgb))] transition-colors overflow-hidden"
            >
              {faviconPreview ? (
                <img src={faviconPreview} alt="Favicon preview" className="w-12 h-12 object-contain" />
              ) : (
                <>
                  <Globe className="w-6 h-6 text-[rgba(var(--tp-fg-rgb),0.4)] mb-2" />
                  <span className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">点击上传 Favicon</span>
                </>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Primary Color */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))] mb-2">
          品牌主色
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-10 h-10 rounded-lg border border-[var(--tp-border)] cursor-pointer"
          />
          <input
            type="text"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="flex-1 h-10 px-3 rounded-lg border border-[var(--tp-border)] bg-[var(--tp-bg)] text-[rgb(var(--tp-fg-rgb))] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[rgb(var(--tp-accent-rgb))]/20"
          />
          <div
            className="w-10 h-10 rounded-lg border border-[var(--tp-border)]"
            style={{ backgroundColor: primaryColor }}
          />
        </div>
      </div>

      {/* Subdomain */}
      <div>
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))] mb-2">
          子域名 <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center">
          <input
            type="text"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            placeholder="my-broker"
            className="flex-1 h-10 px-3 rounded-l-lg border border-r-0 border-[var(--tp-border)] bg-[var(--tp-bg)] text-[rgb(var(--tp-fg-rgb))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--tp-accent-rgb))]/20 focus:border-[rgb(var(--tp-accent-rgb))]"
          />
          <span className="h-10 px-3 flex items-center rounded-r-lg border border-[var(--tp-border)] bg-[rgba(var(--tp-fg-rgb),0.05)] text-[rgba(var(--tp-fg-rgb),0.5)] text-sm">
            .tradepass.io
          </span>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => onNext({ brandName, slogan, subdomain, primaryColor, logoUrl: logoPreview, faviconUrl: faviconPreview })}
          disabled={!brandName || !subdomain}
        >
          下一步 <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ========== Step 2: Auth Config ==========
function Step2Auth({ data, onNext, onBack }: { data: any; onNext: (d: any) => void; onBack: () => void }) {
  const [registerMethods, setRegisterMethods] = useState<string[]>(data.registerMethods || ["email"]);
  const [loginMethods, setLoginMethods] = useState<string[]>(data.loginMethods || ["password"]);
  const [kycRegions, setKycRegions] = useState<string[]>(data.kycRegions || []);

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[rgb(var(--tp-fg-rgb))]">认证配置</h2>

      <div>
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))] mb-2">注册方式</label>
        <div className="flex gap-3">
          {["email", "phone"].map((m) => (
            <button
              key={m}
              onClick={() => toggle(registerMethods, m, setRegisterMethods)}
              className={cn(
                "px-4 py-2 rounded-lg border text-sm transition-colors",
                registerMethods.includes(m)
                  ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.1)] text-[rgb(var(--tp-accent-rgb))]"
                  : "border-[var(--tp-border)] text-[rgba(var(--tp-fg-rgb),0.6)]"
              )}
            >
              {m === "email" ? "邮箱" : "手机号"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))] mb-2">登录方式</label>
        <div className="flex gap-3">
          {["password", "otp"].map((m) => (
            <button
              key={m}
              onClick={() => toggle(loginMethods, m, setLoginMethods)}
              className={cn(
                "px-4 py-2 rounded-lg border text-sm transition-colors",
                loginMethods.includes(m)
                  ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.1)] text-[rgb(var(--tp-accent-rgb))]"
                  : "border-[var(--tp-border)] text-[rgba(var(--tp-fg-rgb),0.6)]"
              )}
            >
              {m === "password" ? "密码" : "OTP"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))] mb-2">KYC 启用地区</label>
        <div className="grid grid-cols-3 gap-2">
          {KYC_REGIONS.map((r) => (
            <button
              key={r.code}
              onClick={() => toggle(kycRegions, r.code, setKycRegions)}
              className={cn(
                "px-3 py-2 rounded-lg border text-sm transition-colors text-left",
                kycRegions.includes(r.code)
                  ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.1)] text-[rgb(var(--tp-accent-rgb))]"
                  : "border-[var(--tp-border)] text-[rgba(var(--tp-fg-rgb),0.6)]"
              )}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" /> 上一步
        </Button>
        <Button
          onClick={() => onNext({ registerMethods, loginMethods, kycRegions })}
          disabled={registerMethods.length === 0 || loginMethods.length === 0}
        >
          下一步 <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ========== Step 3: Trading Config ==========
function Step3Trading({ data, onNext, onBack }: { data: any; onNext: (d: any) => void; onBack: () => void }) {
  const [groups, setGroups] = useState<string[]>(data.tradingGroups || []);
  const [leverage, setLeverage] = useState(data.leverage || "1:100");
  const [spreadMode, setSpreadMode] = useState(data.spreadMode || "floating");

  const toggle = (id: string) => {
    setGroups(groups.includes(id) ? groups.filter((g) => g !== id) : [...groups, id]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[rgb(var(--tp-fg-rgb))]">交易配置</h2>

      <div>
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))] mb-2">交易品种组</label>
        <div className="flex flex-wrap gap-2">
          {TRADING_GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => toggle(g.id)}
              className={cn(
                "px-4 py-2 rounded-lg border text-sm transition-colors",
                groups.includes(g.id)
                  ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.1)] text-[rgb(var(--tp-accent-rgb))]"
                  : "border-[var(--tp-border)] text-[rgba(var(--tp-fg-rgb),0.6)]"
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))] mb-2">杠杆档位</label>
        <div className="flex gap-2">
          {LEVERAGES.map((l) => (
            <button
              key={l}
              onClick={() => setLeverage(l)}
              className={cn(
                "px-4 py-2 rounded-lg border text-sm transition-colors",
                leverage === l
                  ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.1)] text-[rgb(var(--tp-accent-rgb))]"
                  : "border-[var(--tp-border)] text-[rgba(var(--tp-fg-rgb),0.6)]"
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))] mb-2">点差模式</label>
        <div className="space-y-2">
          {SPREAD_MODES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSpreadMode(s.id)}
              className={cn(
                "w-full px-4 py-3 rounded-lg border text-left text-sm transition-colors",
                spreadMode === s.id
                  ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.1)] text-[rgb(var(--tp-accent-rgb))]"
                  : "border-[var(--tp-border)] text-[rgba(var(--tp-fg-rgb),0.6)]"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" /> 上一步
        </Button>
        <Button
          onClick={() => onNext({ tradingGroups: groups, leverage, spreadMode })}
          disabled={groups.length === 0}
        >
          下一步 <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ========== Step 4: Funds Config ==========
function Step4Funds({ data, onNext, onBack }: { data: any; onNext: (d: any) => void; onBack: () => void }) {
  const [baseCurrency, setBaseCurrency] = useState(data.baseCurrency || "USD");
  const [depositChannels, setDepositChannels] = useState<string[]>(data.depositChannels || []);
  const [withdrawChannels, setWithdrawChannels] = useState<string[]>(data.withdrawChannels || []);

  const toggle = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-[rgb(var(--tp-fg-rgb))]">资金配置</h2>

      <div>
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))] mb-2">基础币种</label>
        <div className="flex gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c}
              onClick={() => setBaseCurrency(c)}
              className={cn(
                "px-4 py-2 rounded-lg border text-sm transition-colors",
                baseCurrency === c
                  ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.1)] text-[rgb(var(--tp-accent-rgb))]"
                  : "border-[var(--tp-border)] text-[rgba(var(--tp-fg-rgb),0.6)]"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))] mb-2">入金通道</label>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_CHANNELS.map((c) => (
            <button
              key={c.id}
              onClick={() => toggle(depositChannels, c.id, setDepositChannels)}
              className={cn(
                "px-3 py-3 rounded-lg border text-sm transition-colors flex items-center gap-2",
                depositChannels.includes(c.id)
                  ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.1)] text-[rgb(var(--tp-accent-rgb))]"
                  : "border-[var(--tp-border)] text-[rgba(var(--tp-fg-rgb),0.6)]"
              )}
            >
              <c.icon className="w-4 h-4" />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))] mb-2">出金通道</label>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_CHANNELS.map((c) => (
            <button
              key={c.id}
              onClick={() => toggle(withdrawChannels, c.id, setWithdrawChannels)}
              className={cn(
                "px-3 py-3 rounded-lg border text-sm transition-colors flex items-center gap-2",
                withdrawChannels.includes(c.id)
                  ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.1)] text-[rgb(var(--tp-accent-rgb))]"
                  : "border-[var(--tp-border)] text-[rgba(var(--tp-fg-rgb),0.6)]"
              )}
            >
              <c.icon className="w-4 h-4" />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" /> 上一步
        </Button>
        <Button
          onClick={() => onNext({ baseCurrency, depositChannels, withdrawChannels })}
          disabled={depositChannels.length === 0 || withdrawChannels.length === 0}
        >
          下一步 <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ========== Step 5: Third-Party Channels ==========
function Step5Channels({ data, onNext, onBack }: { data: any; onNext: (d: any) => void; onBack: () => void }) {
  const [emailProvider, setEmailProvider] = useState(data.emailProvider || "tradepass_default");
  const [smsProvider, setSmsProvider] = useState(data.smsProvider || "tradepass_default");
  const [ekycProvider, setEkycProvider] = useState(data.ekycProvider || "tradepass_default");

  const EMAIL_PROVIDERS = [
    { id: "tradepass_default", name: "TradePass 默认", desc: "免费使用，有发送限额", free: true },
    { id: "sendgrid", name: "SendGrid", desc: "专业邮件服务，高送达率", free: false },
    { id: "aws_ses", name: "AWS SES", desc: "企业级邮件发送", free: false },
  ];

  const SMS_PROVIDERS = [
    { id: "tradepass_default", name: "TradePass 默认", desc: "免费使用，有发送限额", free: true },
    { id: "twilio", name: "Twilio", desc: "全球短信覆盖", free: false },
    { id: "messagebird", name: "MessageBird", desc: "欧洲市场优选", free: false },
  ];

  const EKYC_PROVIDERS = [
    { id: "tradepass_default", name: "TradePass 默认", desc: "基础 OCR + 活体检测", free: true },
    { id: "jumio", name: "Jumio", desc: "企业级 KYC 验证", free: false },
    { id: "onfido", name: "Onfido", desc: "AI 驱动的身份验证", free: false },
  ];

  const ProviderCard = ({
    provider,
    selected,
    onSelect,
  }: {
    provider: any;
    selected: boolean;
    onSelect: () => void;
  }) => (
    <button
      onClick={onSelect}
      className={cn(
        "w-full p-4 rounded-xl border text-left transition-all",
        selected
          ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.05)]"
          : "border-[var(--tp-border)] hover:border-[rgba(var(--tp-fg-rgb),0.3)]"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium text-[rgb(var(--tp-fg-rgb))]">{provider.name}</span>
        {provider.free ? (
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            免费
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
            <Lock className="w-3 h-3" /> 增值
          </span>
        )}
      </div>
      <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)] mt-1">{provider.desc}</p>
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[rgb(var(--tp-fg-rgb))]">三方通道配置</h2>
        <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)] mt-1">
          选择 Email、SMS 和 eKYC 服务提供商。MVP 阶段可使用 TradePass 默认通道。
        </p>
      </div>

      {/* Email */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))]">
          Email 服务提供商
        </label>
        <div className="space-y-2">
          {EMAIL_PROVIDERS.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              selected={emailProvider === p.id}
              onSelect={() => setEmailProvider(p.id)}
            />
          ))}
        </div>
      </div>

      {/* SMS */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))]">
          SMS 服务提供商
        </label>
        <div className="space-y-2">
          {SMS_PROVIDERS.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              selected={smsProvider === p.id}
              onSelect={() => setSmsProvider(p.id)}
            />
          ))}
        </div>
      </div>

      {/* eKYC */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-[rgb(var(--tp-fg-rgb))]">
          eKYC 服务提供商
        </label>
        <div className="space-y-2">
          {EKYC_PROVIDERS.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              selected={ekycProvider === p.id}
              onSelect={() => setEkycProvider(p.id)}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" /> 上一步
        </Button>
        <Button onClick={() => onNext({ emailProvider, smsProvider, ekycProvider })}>
          下一步 <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ========== Step 6: Review & Launch ==========
function Step6Publish({ data, onComplete, onBack }: { data: any; onComplete: () => void; onBack: () => void }) {
  const [confirming, setConfirming] = useState(false);

  const handleComplete = async () => {
    setConfirming(true);
    await onComplete();
  };

  const sections = [
    { title: "品牌", items: [
      { label: "品牌名称", value: data.brandName },
      { label: "Slogan", value: data.slogan },
      { label: "子域名", value: data.subdomain ? `${data.subdomain}.tradepass.io` : "" },
      { label: "品牌色", value: data.primaryColor },
    ]},
    { title: "认证", items: [
      { label: "注册方式", value: data.registerMethods?.join(", ") },
      { label: "登录方式", value: data.loginMethods?.join(", ") },
      { label: "KYC 地区", value: data.kycRegions?.map((c: string) => KYC_REGIONS.find((r) => r.code === c)?.name).join(", ") },
    ]},
    { title: "交易", items: [
      { label: "品种组", value: data.tradingGroups?.map((g: string) => TRADING_GROUPS.find((t) => t.id === g)?.label).join(", ") },
      { label: "杠杆", value: data.leverage },
      { label: "点差模式", value: SPREAD_MODES.find((s) => s.id === data.spreadMode)?.label },
    ]},
    { title: "资金", items: [
      { label: "基础币种", value: data.baseCurrency },
      { label: "入金通道", value: data.depositChannels?.map((c: string) => PAYMENT_CHANNELS.find((p) => p.id === c)?.label).join(", ") },
      { label: "出金通道", value: data.withdrawChannels?.map((c: string) => PAYMENT_CHANNELS.find((p) => p.id === c)?.label).join(", ") },
    ]},
    { title: "三方通道", items: [
      { label: "Email", value: data.emailProvider },
      { label: "SMS", value: data.smsProvider },
      { label: "eKYC", value: data.ekycProvider },
    ]},
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-[rgb(var(--tp-fg-rgb))]">审核与发布</h2>
        <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)] mt-1">
          请确认以下配置，发布后即刻生效
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((sec) => (
          <div key={sec.title} className="p-4 rounded-xl bg-[var(--tp-bg)] border border-[var(--tp-border)]">
            <h3 className="text-sm font-medium text-[rgb(var(--tp-accent-rgb))] mb-2">{sec.title}</h3>
            <div className="space-y-1">
              {sec.items.map((item) => (
                <div key={item.label} className="flex justify-between text-sm">
                  <span className="text-[rgba(var(--tp-fg-rgb),0.5)]">{item.label}</span>
                  <span className="text-[rgb(var(--tp-fg-rgb))] font-medium">{item.value || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MVP Limit Warning */}
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-amber-800">MVP 试用模式</h4>
            <p className="text-xs text-amber-700 mt-1">
              当前处于 14 天 MVP 试用阶段，部分功能受限：
            </p>
            <ul className="text-xs text-amber-700 mt-1 space-y-0.5 list-disc list-inside">
              <li>最大 10 个用户、5 个交易账户</li>
              <li>存款单笔上限 $100，提款单笔上限 $50</li>
              <li>MT5 仅支持 Demo 账户</li>
              <li>部分三方通道为 TradePass 默认服务</li>
            </ul>
            <div className="mt-3">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  window.location.href = "/console/billing?upgrade=starter";
                }}
              >
                升级至 Starter 套餐
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" /> 上一步
        </Button>
        <Button
          onClick={handleComplete}
          disabled={confirming}
          className="bg-[rgb(var(--tp-accent-rgb))] text-white"
        >
          {confirming ? (
            "发布中..."
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-1" /> 确认发布
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
