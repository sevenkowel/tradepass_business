"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownToLine, Copy, CheckCircle2, AlertCircle,
  QrCode, ChevronRight, ChevronDown, Wallet, TrendingUp,
  ShieldCheck, Clock, HelpCircle, CircleDollarSign,
  Zap, Info, HeadphonesIcon,
} from "lucide-react";
import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { usePortalStore } from "@/store/portalStore";
import { useFundLimitsConfig } from "@/lib/config/hooks";
import type { FundMethod } from "@/lib/config/types";
import type { TradingAccount } from "@/lib/types";
import { cn } from "@/lib/utils";

// ============================================================
// 常量配置
// ============================================================

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  JPY: "¥",
  USC: "$",
};

const QUICK_AMOUNTS: Record<string, number[]> = {
  USD: [100, 500, 1000, 5000],
  EUR: [100, 500, 1000, 5000],
  JPY: [10000, 50000, 100000, 500000],
  USC: [10000, 50000, 100000, 500000],
};

const ALL_METHODS: { id: FundMethod; name: string; icon: string; color: string; min: number; fee: number; time: string }[] = [
  { id: "usdt_trc20", name: "USDT TRC20", icon: "₮", color: "emerald", min: 50, fee: 0, time: "1-5 min" },
  { id: "usdt_erc20", name: "USDT ERC20", icon: "₮", color: "blue", min: 100, fee: 5, time: "5-15 min" },
  { id: "btc", name: "Bitcoin", icon: "₿", color: "orange", min: 0.001, fee: 0.0001, time: "10-30 min" },
  { id: "eth", name: "Ethereum", icon: "Ξ", color: "indigo", min: 0.01, fee: 0.005, time: "5-10 min" },
  { id: "bank", name: "Bank Wire", icon: "🏦", color: "gray", min: 1000, fee: 25, time: "1-3 days" },
  { id: "swift", name: "SWIFT", icon: "🌐", color: "slate", min: 5000, fee: 35, time: "2-5 days" },
  { id: "sepa", name: "SEPA", icon: "💶", color: "cyan", min: 500, fee: 5, time: "1-2 days" },
];

const MOCK_DAILY_USED = 2500;

const FAQ_ITEMS = [
  { q: "如何进行充值？", a: "选择交易账户和金额，选择支付方式，按提示完成转账即可。加密货币通常 1-30 分钟到账，银行转账 1-5 个工作日。" },
  { q: "充值需要多久到账？", a: "USDT TRC20: 1-5 分钟；USDT ERC20: 5-15 分钟；BTC: 10-30 分钟；Bank Wire: 1-3 个工作日；SWIFT: 2-5 个工作日。" },
  { q: "充值限额是多少？", a: "限额取决于您的 KYC 认证等级和交易账户币种。基础认证每日限额较低，标准认证和高级认证享有更高额度。" },
  { q: "充值失败怎么办？", a: "请确认转账地址/账户信息正确，并保留转账凭证。如 24 小时内未到账，请联系客服提供交易哈希或银行回单。" },
];

// ============================================================
// 辅助函数
// ============================================================

function getAccountTypeLabel(account: TradingAccount): string {
  if (account.server.includes("Pro")) return "Pro";
  if (account.server.includes("ECN")) return "ECN";
  if (account.server.includes("Standard")) return "Standard";
  return "Standard";
}

function formatAmount(value: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] || "$";
  if (value >= 999999999) return `${symbol}Unlimited`;
  return `${symbol}${value.toLocaleString()}`;
}

// ============================================================
// 主组件
// ============================================================

export default function DepositPage() {
  const { user, wallet, tradingAccounts } = usePortalStore();

  // 只显示 Real 且 active 的账户
  const realAccounts = useMemo(
    () => tradingAccounts.filter((a) => a.type === "Real" && a.isActive),
    [tradingAccounts]
  );

  const [selectedAccount, setSelectedAccount] = useState<TradingAccount | null>(
    realAccounts[0] ?? null
  );
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<(typeof ALL_METHODS)[0] | null>(null);
  const [step, setStep] = useState<"account" | "method" | "confirm">("account");
  const [copied, setCopied] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // 根据选中账户的币种查询限额
  const { fundLimits } = useFundLimitsConfig(
    user?.region ?? null,
    selectedAccount?.currency
  );

  const depositLimits = fundLimits?.[user?.kycLevel ?? "basic"]?.deposit;

  // 是否首次存款
  const isFirstDeposit = selectedAccount
    ? selectedAccount.balance === 0 && selectedAccount.equity === 0
    : false;

  // 实际使用的限额
  const perTransactionMin =
    isFirstDeposit && depositLimits?.firstDeposit
      ? depositLimits.firstDeposit.min
      : depositLimits?.perTransactionMin ?? 10;
  const perTransactionMax =
    isFirstDeposit && depositLimits?.firstDeposit
      ? depositLimits.firstDeposit.max
      : depositLimits?.perTransactionMax ?? 999999999;
  const dailyLimit = depositLimits?.dailyLimit ?? 999999999;
  const dailyThreshold = depositLimits?.dailyThreshold ?? 1000;
  const dailyRemaining = Math.max(0, dailyLimit - MOCK_DAILY_USED);

  const currencySymbol = CURRENCY_SYMBOLS[selectedAccount?.currency ?? "USD"];
  const quickAmounts = QUICK_AMOUNTS[selectedAccount?.currency ?? "USD"] ?? QUICK_AMOUNTS.USD;

  // 金额校验
  const amountNum = Number(amount);
  const isBelowMin = amountNum > 0 && amountNum < perTransactionMin;
  const isAboveMax = amountNum > 0 && amountNum > perTransactionMax;
  const isAboveDaily = amountNum > 0 && amountNum > dailyRemaining;
  const hasError = isBelowMin || isAboveMax || isAboveDaily;
  const canContinueStep1 = amountNum > 0 && !hasError;

  // 限额紧张
  const isLowBalance = dailyRemaining < dailyThreshold;

  // Step 2: 根据金额过滤支付方式
  const { availableMethods, unavailableMethods } = useMemo(() => {
    const allowed = depositLimits?.allowedMethods ?? ["bank"];
    const allAvailable = ALL_METHODS.filter((m) => allowed.includes(m.id));
    const available = allAvailable.filter((m) => m.min <= amountNum);
    const unavailable = ALL_METHODS.filter(
      (m) => !available.find((a) => a.id === m.id)
    );
    return { availableMethods: available, unavailableMethods: unavailable };
  }, [depositLimits, amountNum]);

  // Step 2 能否继续
  const canContinueStep2 = selectedMethod !== null;

  // Mock 地址
  const mockAddress =
    selectedMethod?.id === "usdt_trc20"
      ? "TNXoiG6h...7Yq9z"
      : selectedMethod?.id === "usdt_erc20"
        ? "0x742d35Cc...4f2e"
        : selectedMethod?.id === "btc"
          ? "bc1qxy2kg...9v4t"
          : selectedMethod?.id === "eth"
            ? "0x71C7656E...7f81"
            : "SWIFT: TRADEPASSXXX";

  const handleCopy = () => {
    navigator.clipboard.writeText(mockAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 账户选择后重置
  const handleSelectAccount = (account: TradingAccount) => {
    setSelectedAccount(account);
    setAccountDropdownOpen(false);
    setAmount("");
    setSelectedMethod(null);
    if (step !== "account") setStep("account");
  };

  // 步骤导航
  const steps = [
    { key: "account" as const, label: "账户与金额", num: 1 },
    { key: "method" as const, label: "支付方式", num: 2 },
    { key: "confirm" as const, label: "确认订单", num: 3 },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="充值" description="快速安全的充值服务" />

      {/* KYC 升级引导 */}
      {user?.kycLevel === "basic" && (
        <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 flex items-center gap-3">
          <TrendingUp size={20} className="text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">升级至标准认证，解锁更高额度</p>
            <p className="text-xs text-amber-600">解锁 USDT 支付并将每日限额提升至 $200,000。</p>
          </div>
          <button className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">
            立即认证
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Deposit flow */}
        <div className="lg:col-span-2 space-y-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-colors",
                    step === s.key
                      ? "bg-blue-50 border-blue-200"
                      : steps.findIndex((x) => x.key === step) > i
                        ? "bg-emerald-50 border-emerald-200"
                        : "bg-white border-gray-200"
                  )}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      step === s.key
                        ? "bg-blue-600 text-white"
                        : steps.findIndex((x) => x.key === step) > i
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200 text-gray-600"
                    )}
                  >
                    {steps.findIndex((x) => x.key === step) > i ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      s.num
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      step === s.key
                        ? "text-blue-700"
                        : steps.findIndex((x) => x.key === step) > i
                          ? "text-emerald-700"
                          : "text-gray-600"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && <ChevronRight size={16} className="text-gray-300" />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* ==================== Step 1: 账户与金额 ==================== */}
            {step === "account" && (
              <motion.div
                key="account"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* 选择存入账户 */}
                <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
                  <label className="text-sm font-bold text-gray-800 block mb-3">选择存入账户</label>
                  <div className="relative">
                    <button
                      onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-colors",
                        accountDropdownOpen
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      )}
                    >
                      {selectedAccount ? (
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                            <CircleDollarSign size={18} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {selectedAccount.accountNumber} · {getAccountTypeLabel(selectedAccount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {currencySymbol}
                              {selectedAccount.equity.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">请选择交易账户</span>
                      )}
                      <ChevronDown
                        size={18}
                        className={cn("text-gray-400 transition-transform", accountDropdownOpen && "rotate-180")}
                      />
                    </button>

                    {accountDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {realAccounts.map((account) => (
                          <button
                            key={account.id}
                            onClick={() => handleSelectAccount(account)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors",
                              selectedAccount?.id === account.id && "bg-blue-50"
                            )}
                          >
                            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                              <CircleDollarSign size={18} className="text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 truncate">
                                {account.accountNumber} · {getAccountTypeLabel(account)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {CURRENCY_SYMBOLS[account.currency] || "$"}
                                {account.equity.toLocaleString()}
                              </p>
                            </div>
                            {selectedAccount?.id === account.id && (
                              <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 输入存款金额 */}
                <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
                  <label className="text-sm font-bold text-gray-800 block mb-3">输入存款金额</label>

                  {/* 快捷金额 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {quickAmounts.map((val) => (
                      <motion.button
                        key={val}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setAmount(val.toString())}
                        className={cn(
                          "px-4 py-2 rounded-full text-sm font-semibold border-2 transition-colors",
                          amount === val.toString()
                            ? "bg-blue-50 border-blue-300 text-blue-700"
                            : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                        )}
                      >
                        {currencySymbol}
                        {val.toLocaleString()}
                      </motion.button>
                    ))}
                  </div>

                  {/* 金额输入框 */}
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`最低 ${currencySymbol}${perTransactionMin.toLocaleString()}`}
                      className={cn(
                        "w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 border-2 text-xl font-bold text-gray-900 focus:outline-none transition-colors",
                        hasError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-blue-400"
                      )}
                    />
                  </div>

                  {/* 今日额度卡片（紧邻输入框） */}
                  <div className="mt-4 rounded-2xl bg-white border-2 border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-blue-600" />
                        <span className="text-sm font-bold text-gray-800">今日额度</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          单笔 {formatAmount(perTransactionMin, selectedAccount?.currency ?? "USD")} - {formatAmount(perTransactionMax, selectedAccount?.currency ?? "USD")}
                        </span>
                        {user?.kycLevel !== "enhanced" && (
                          <button className="text-xs text-blue-600 font-semibold hover:underline">提升</button>
                        )}
                      </div>
                    </div>

                    {/* 进度条 */}
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          MOCK_DAILY_USED / dailyLimit > 0.8 ? "bg-red-400" : "bg-blue-500"
                        )}
                        style={{ width: `${Math.min(100, (MOCK_DAILY_USED / dailyLimit) * 100)}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">已用</p>
                        <p className="font-bold text-gray-700">{formatAmount(MOCK_DAILY_USED, selectedAccount?.currency ?? "USD")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-0.5">限额</p>
                        <p className="font-bold text-gray-700">{formatAmount(dailyLimit, selectedAccount?.currency ?? "USD")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-0.5">剩余</p>
                        <p className={cn("font-bold", isLowBalance ? "text-amber-600" : "text-emerald-600")}>
                          {formatAmount(dailyRemaining, selectedAccount?.currency ?? "USD")}
                        </p>
                      </div>
                    </div>

                    {/* 首次存款提示 */}
                    {isFirstDeposit && depositLimits?.firstDeposit && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-emerald-600">
                        <CheckCircle2 size={12} />
                        首次存款限额: {formatAmount(depositLimits.firstDeposit.min, selectedAccount?.currency ?? "USD")} -{" "}
                        {formatAmount(depositLimits.firstDeposit.max, selectedAccount?.currency ?? "USD")}
                      </div>
                    )}

                    {/* 限额紧张提示 */}
                    {isLowBalance && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                        <AlertCircle size={14} className="text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-700">
                          剩余额度紧张，{user?.kycLevel !== "enhanced" && <button className="underline font-medium">升级认证可提升额度</button>}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* 校验错误 */}
                  <div className="mt-2 space-y-1">
                    {isBelowMin && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} />
                        低于最低金额 {formatAmount(perTransactionMin, selectedAccount?.currency ?? "USD")}
                      </p>
                    )}
                    {isAboveMax && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} />
                        超出单笔限额 {formatAmount(perTransactionMax, selectedAccount?.currency ?? "USD")}
                      </p>
                    )}
                    {isAboveDaily && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} />
                        超出每日剩余额度 {formatAmount(dailyRemaining, selectedAccount?.currency ?? "USD")}
                      </p>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("method")}
                  disabled={!canContinueStep1}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  下一步 <ChevronRight size={16} />
                </motion.button>
              </motion.div>
            )}

            {/* ==================== Step 2: 支付方式 ==================== */}
            {step === "method" && (
              <motion.div
                key="method"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* 金额摘要 */}
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600">存款金额</p>
                    <p className="text-lg font-bold text-blue-800">
                      {currencySymbol}
                      {Number(amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-blue-600">存入账户</p>
                    <p className="text-sm font-bold text-blue-800">{selectedAccount?.accountNumber}</p>
                  </div>
                </div>

                {/* 可用方式 */}
                <div>
                  <p className="text-sm font-bold text-gray-800 mb-3">选择支付方式</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableMethods.map((method) => (
                      <motion.button
                        key={method.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedMethod(method)}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all",
                          selectedMethod?.id === method.id
                            ? "bg-blue-50 border-blue-300 shadow-sm"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border-2",
                            method.color === "emerald" && "bg-emerald-50 text-emerald-600 border-emerald-200",
                            method.color === "blue" && "bg-blue-50 text-blue-600 border-blue-200",
                            method.color === "orange" && "bg-orange-50 text-orange-600 border-orange-200",
                            method.color === "indigo" && "bg-indigo-50 text-indigo-600 border-indigo-200",
                            method.color === "gray" && "bg-gray-100 text-gray-600 border-gray-200",
                            method.color === "slate" && "bg-slate-100 text-slate-600 border-slate-200",
                            method.color === "cyan" && "bg-cyan-50 text-cyan-600 border-cyan-200"
                          )}
                        >
                          {method.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{method.name}</p>
                          <p className="text-xs text-gray-500">
                            最低: {currencySymbol}
                            {method.min.toLocaleString()} · 手续费:{" "}
                            {method.fee === 0 ? "免费" : `${currencySymbol}${method.fee}`} · {method.time}
                          </p>
                        </div>
                        {selectedMethod?.id === method.id && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={12} className="text-white" />
                          </div>
                        )}
                      </motion.button>
                    ))}

                    {/* 不可用方式 */}
                    {unavailableMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center gap-3 p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed relative group"
                        title="当前金额不满足该方式最低要求或需要升级认证"
                      >
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold border-2 border-gray-200 bg-gray-100 text-gray-400">
                          {method.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-400 truncate">{method.name}</p>
                          <p className="text-xs text-gray-400">
                            {method.min > amountNum
                              ? `最低要求 ${currencySymbol}${method.min.toLocaleString()}`
                              : user?.kycLevel === "basic"
                                ? "需要标准认证"
                                : "需要高级认证"}
                          </p>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-2xl">
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                            {method.min > amountNum ? "金额不足" : "升级解锁"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 无可用方式提示 */}
                {availableMethods.length === 0 && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-700">
                      当前金额不满足任何支付方式的最低要求，请调整金额或升级认证。
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep("account")}
                    className="flex-1 py-3.5 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-bold hover:border-gray-300 transition-colors"
                  >
                    上一步
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep("confirm")}
                    disabled={!canContinueStep2}
                    className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold shadow-sm transition-colors"
                  >
                    下一步
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ==================== Step 3: 确认订单 ==================== */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* 存款地址卡片 */}
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white border-2 border-blue-200 flex items-center justify-center">
                      <QrCode size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">存款地址</p>
                      <p className="text-xs text-gray-500">请仅向此地址发送 {selectedMethod?.name}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border-2 border-blue-200 p-4 flex items-center gap-3">
                    <code className="flex-1 text-sm font-mono text-gray-700 truncate">{mockAddress}</code>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopy}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
                        copied
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                      )}
                    >
                      {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                      {copied ? "已复制" : "复制"}
                    </motion.button>
                  </div>

                  <div className="mt-4 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <p>请仅向此地址发送 {selectedMethod?.name}。发送其他资产可能导致永久丢失。</p>
                  </div>
                </div>

                {/* 订单摘要 */}
                <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
                  <p className="text-sm font-bold text-gray-800 mb-3">订单摘要</p>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">存入账户</span>
                    <span className="font-bold text-gray-900">
                      {selectedAccount?.accountNumber} · {getAccountTypeLabel(selectedAccount!)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">存款金额</span>
                    <span className="font-bold text-gray-900">
                      {currencySymbol}
                      {Number(amount).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">支付方式</span>
                    <span className="font-bold text-gray-900">{selectedMethod?.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-500">手续费</span>
                    <span className="font-bold text-gray-900">
                      {selectedMethod?.fee === 0 ? "免费" : `${currencySymbol}${selectedMethod?.fee}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-bold text-gray-800">实际到账</span>
                    <span className="font-bold text-blue-700">
                      {currencySymbol}
                      {(Number(amount) - (selectedMethod?.fee ?? 0)).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep("method")}
                    className="flex-1 py-3.5 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-bold hover:border-gray-300 transition-colors"
                  >
                    上一步
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-colors"
                  >
                    确认存款
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: 步骤动态辅助信息 */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {/* Step 1 右侧：安全提示 + 到账时间概览 */}
            {step === "account" && (
              <motion.div
                key="right-account"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* 安全提示 */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 border-2 border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldCheck size={18} className="text-emerald-600" />
                    <h3 className="font-bold text-gray-800 text-sm">安全提醒</h3>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      请确保转账地址与所选支付方式一致
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      加密货币转账不可逆，请仔细核对地址
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      大额转账建议先进行小额测试
                    </li>
                  </ul>
                </div>

                {/* 到账时间概览 */}
                <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={16} className="text-amber-500" />
                    <h3 className="font-bold text-gray-800 text-sm">预计到账时间</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: "USDT TRC20", time: "1-5 分钟", fast: true },
                      { name: "USDT ERC20", time: "5-15 分钟", fast: true },
                      { name: "Bitcoin", time: "10-30 分钟", fast: false },
                      { name: "Bank Wire", time: "1-3 工作日", fast: false },
                      { name: "SWIFT", time: "2-5 工作日", fast: false },
                    ].map((m) => (
                      <div key={m.name} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">{m.name}</span>
                        <span className={cn("font-semibold", m.fast ? "text-emerald-600" : "text-gray-500")}>
                          {m.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2 右侧：支付方式详情 */}
            {step === "method" && (
              <motion.div
                key="right-method"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {selectedMethod ? (
                  <div className="rounded-2xl bg-blue-50 border-2 border-blue-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border-2",
                        selectedMethod.color === "emerald" && "bg-emerald-50 text-emerald-600 border-emerald-200",
                        selectedMethod.color === "blue" && "bg-blue-50 text-blue-600 border-blue-200",
                        selectedMethod.color === "orange" && "bg-orange-50 text-orange-600 border-orange-200",
                        selectedMethod.color === "indigo" && "bg-indigo-50 text-indigo-600 border-indigo-200",
                        selectedMethod.color === "gray" && "bg-gray-100 text-gray-600 border-gray-200",
                        selectedMethod.color === "slate" && "bg-slate-100 text-slate-600 border-slate-200",
                        selectedMethod.color === "cyan" && "bg-cyan-50 text-cyan-600 border-cyan-200"
                      )}>
                        {selectedMethod.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{selectedMethod.name}</h3>
                        <p className="text-xs text-blue-600">已选择</p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">处理时间</span>
                        <span className="font-semibold text-gray-800">{selectedMethod.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">手续费</span>
                        <span className="font-semibold text-gray-800">
                          {selectedMethod.fee === 0 ? "免费" : `${currencySymbol}${selectedMethod.fee}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">最低金额</span>
                        <span className="font-semibold text-gray-800">{currencySymbol}{selectedMethod.min.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-blue-200">
                      <div className="flex items-start gap-2">
                        <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700">
                          {selectedMethod.id === "bank" && "请使用与实名认证一致的银行账户进行转账。"}
                          {selectedMethod.id === "swift" && "SWIFT 转账可能产生中间行费用，请以实际到账金额为准。"}
                          {selectedMethod.id === "usdt_trc20" && "请确保使用 TRC20 网络，其他网络可能导致资产丢失。"}
                          {selectedMethod.id === "usdt_erc20" && "ERC20 网络 Gas 费波动较大，请预留足够手续费。"}
                          {selectedMethod.id === "btc" && "Bitcoin 网络确认时间较长，请耐心等待。"}
                          {selectedMethod.id === "eth" && "Ethereum 网络 Gas 费波动较大，请预留足够手续费。"}
                          {selectedMethod.id === "sepa" && "SEPA 转账仅限欧元区银行账户。"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-gray-50 border-2 border-gray-200 p-5 text-center">
                    <Info size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">请选择一种支付方式查看详情</p>
                  </div>
                )}

                {/* 方式对比提示 */}
                <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
                  <h3 className="font-bold text-gray-800 text-sm mb-3">为什么推荐 {availableMethods[0]?.name || "USDT TRC20"}？</h3>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-start gap-2">
                      <Zap size={12} className="text-amber-500 shrink-0 mt-0.5" />
                      到账最快（通常 1-5 分钟）
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                      手续费最低（多数情况免费）
                    </li>
                    <li className="flex items-start gap-2">
                      <ShieldCheck size={12} className="text-blue-500 shrink-0 mt-0.5" />
                      7×24 小时全天候处理
                    </li>
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Step 3 右侧：核对清单 + 客服 */}
            {step === "confirm" && (
              <motion.div
                key="right-confirm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* 核对清单 */}
                <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <h3 className="font-bold text-gray-800 text-sm">核对清单</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "存入账户", value: `${selectedAccount?.accountNumber} · ${getAccountTypeLabel(selectedAccount!)}`, ok: true },
                      { label: "存款金额", value: `${currencySymbol}${Number(amount).toLocaleString()}`, ok: true },
                      { label: "支付方式", value: selectedMethod?.name ?? "", ok: true },
                      { label: "手续费", value: selectedMethod?.fee === 0 ? "免费" : `${currencySymbol}${selectedMethod?.fee}`, ok: true },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          <span className="text-gray-500">{item.label}</span>
                        </div>
                        <span className="font-semibold text-gray-800">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 客服入口 */}
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <HeadphonesIcon size={16} className="text-blue-600" />
                    <h3 className="font-bold text-gray-800 text-sm">遇到问题？</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    存款未到账或地址有疑问？我们的客服团队 24/7 在线为您服务。
                  </p>
                  <button className="w-full text-xs font-semibold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                    <HeadphonesIcon size={12} />
                    联系客服
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 常见问题 FAQ（所有步骤共享） */}
          <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <HelpCircle size={16} className="text-gray-500" />
              <h3 className="font-bold text-gray-900">常见问题</h3>
            </div>
            <div className="space-y-2">
              {FAQ_ITEMS.map((item, i) => (
                <div key={i} className="border-b border-gray-100 last:border-0">
                  <button
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                    className="w-full flex items-center justify-between py-2 text-left"
                  >
                    <span className="text-sm text-gray-700">{item.q}</span>
                    <ChevronDown
                      size={14}
                      className={cn("text-gray-400 transition-transform", openFaqIndex === i && "rotate-180")}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaqIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-gray-500 pb-2">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
