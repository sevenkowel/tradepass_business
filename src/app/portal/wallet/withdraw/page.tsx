"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpFromLine, AlertCircle, CheckCircle2,
  ChevronRight, ChevronDown, Clock, TrendingUp,
  Upload, FileText, HelpCircle, CircleDollarSign,
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

const ALL_METHODS: { id: FundMethod; name: string; color: string; min: number; max: number; fee: number; time: string; isEWallet: boolean }[] = [
  { id: "usdt_trc20", name: "USDT TRC20", color: "emerald", min: 50, max: 50000, fee: 1, time: "1-5 min", isEWallet: true },
  { id: "usdt_erc20", name: "USDT ERC20", color: "blue", min: 100, max: 100000, fee: 5, time: "5-15 min", isEWallet: true },
  { id: "btc", name: "Bitcoin", color: "orange", min: 0.001, max: 50000, fee: 0.0001, time: "10-30 min", isEWallet: true },
  { id: "eth", name: "Ethereum", color: "indigo", min: 0.01, max: 50000, fee: 0.005, time: "5-10 min", isEWallet: true },
  { id: "bank", name: "Bank Wire", color: "gray", min: 1000, max: 500000, fee: 25, time: "1-3 days", isEWallet: false },
  { id: "swift", name: "SWIFT", color: "slate", min: 5000, max: 500000, fee: 35, time: "2-5 days", isEWallet: false },
  { id: "sepa", name: "SEPA", color: "cyan", min: 500, max: 200000, fee: 5, time: "1-2 days", isEWallet: false },
];

const MOCK_DAILY_USED = 1200;

const FAQ_ITEMS = [
  { q: "如何进行提款？", a: "选择交易账户和提款金额，选择提款方式，填写收款信息并确认即可。处理时间取决于所选方式。" },
  { q: "提款需要多久到账？", a: "USDT TRC20: 1-5 分钟；USDT ERC20: 5-15 分钟；BTC: 10-30 分钟；Bank Wire: 1-3 个工作日；SWIFT: 2-5 个工作日。" },
  { q: "提款限额是多少？", a: "限额取决于您的 KYC 认证等级和交易账户币种。基础认证每日限额较低。" },
  { q: "提款失败怎么办？", a: "请确认收款地址/账户信息正确。如提款失败，资金将退回您的交易账户。如有疑问请联系客服。" },
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

export default function WithdrawPage() {
  const { user, tradingAccounts } = usePortalStore();

  // 只显示 Real 且 active 的账户
  const realAccounts = useMemo(
    () => tradingAccounts.filter((a) => a.type === "Real" && a.isActive),
    [tradingAccounts]
  );

  const [selectedAccount, setSelectedAccount] = useState<TradingAccount | null>(
    realAccounts[0] ?? null
  );
  const [selected, setSelected] = useState(ALL_METHODS[0]);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // 根据选中账户的币种查询限额
  const { fundLimits } = useFundLimitsConfig(
    user?.region ?? null,
    selectedAccount?.currency
  );

  const withdrawalLimits = fundLimits?.[user?.kycLevel ?? "basic"]?.withdrawal;
  const eWalletRequiresAddressProof = withdrawalLimits?.eWalletRequiresAddressProof ?? false;

  // 支付方式过滤
  const { availableMethods, unavailableMethods } = useMemo(() => {
    const allowed = withdrawalLimits?.allowedMethods ?? ["bank"];
    const available = ALL_METHODS.filter((m) => allowed.includes(m.id));
    const unavailable = ALL_METHODS.filter((m) => !allowed.includes(m.id));
    return { availableMethods: available, unavailableMethods: unavailable };
  }, [withdrawalLimits]);

  const balance = selectedAccount?.balance ?? 0;
  const currencySymbol = CURRENCY_SYMBOLS[selectedAccount?.currency ?? "USD"];
  const receiveAmount = Math.max(0, Number(amount) - selected.fee);

  // 金额校验
  const amountNum = Number(amount);
  const perTransactionMin = withdrawalLimits?.perTransactionMin ?? selected.min;
  const perTransactionMax = withdrawalLimits?.perTransactionMax ?? selected.max;
  const dailyLimit = withdrawalLimits?.dailyLimit ?? 999999999;
  const dailyThreshold = withdrawalLimits?.dailyThreshold ?? 1000;
  const dailyRemaining = Math.max(0, dailyLimit - MOCK_DAILY_USED);

  const isBelowMin = amountNum > 0 && amountNum < perTransactionMin;
  const isAboveMax = amountNum > 0 && amountNum > perTransactionMax;
  const isAboveDaily = amountNum > 0 && amountNum > dailyRemaining;
  const isAboveBalance = amountNum > 0 && amountNum > balance;
  const hasError = isBelowMin || isAboveMax || isAboveDaily || isAboveBalance;

  // 地址证明检查
  const needsAddressProof = eWalletRequiresAddressProof && selected.isEWallet && !user?.addressProof;

  const canContinue = amountNum > 0 && !hasError && !needsAddressProof;

  // 限额紧张
  const isLowBalance = dailyRemaining < dailyThreshold;

  // 如果可用支付方式变化，确保选中项在可用列表中
  useMemo(() => {
    if (availableMethods.length > 0 && !availableMethods.find((m) => m.id === selected.id)) {
      setSelected(availableMethods[0]);
    }
  }, [availableMethods, selected]);

  const handleSelectAccount = (account: TradingAccount) => {
    setSelectedAccount(account);
    setAccountDropdownOpen(false);
    setAmount("");
    if (step !== "form") setStep("form");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="提款" description="从交易账户提款至外部钱包或银行账户" />

      {/* KYC 升级引导 */}
      {user?.kycLevel === "basic" && (
        <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 flex items-center gap-3">
          <TrendingUp size={20} className="text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">升级至标准认证，解锁加密提款</p>
            <p className="text-xs text-amber-600">解锁 USDT/BTC/ETH 提款并提升每日限额。</p>
          </div>
          <button className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">
            立即认证
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* 日限额紧张提示 */}
          {isLowBalance && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <p className="text-sm text-amber-700">
                每日提款剩余额度仅剩 <span className="font-semibold">{formatAmount(dailyRemaining, selectedAccount?.currency ?? "USD")}</span>
                <button className="ml-1 underline font-medium">申请提升额度</button>
              </p>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border-2", step === "form" ? "bg-blue-50 border-blue-200" : "bg-emerald-50 border-emerald-200")}>
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step === "form" ? "bg-blue-600 text-white" : "bg-emerald-500 text-white")}>
                {step === "form" ? 1 : <CheckCircle2 size={14} />}
              </div>
              <span className={cn("text-sm font-semibold", step === "form" ? "text-blue-700" : "text-emerald-700")}>提款详情</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border-2", step === "confirm" ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200")}>
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step === "confirm" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600")}>2</div>
              <span className={cn("text-sm font-semibold", step === "confirm" ? "text-blue-700" : "text-gray-600")}>确认</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === "form" ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* 选择提款账户 */}
                <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
                  <label className="text-sm font-bold text-gray-800 block mb-3">选择提款账户</label>
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
                              余额: {currencySymbol}{selectedAccount.balance.toLocaleString()}
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
                                余额: {CURRENCY_SYMBOLS[account.currency] || "$"}{account.balance.toLocaleString()}
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

                {/* Available methods */}
                <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
                  <label className="text-sm font-bold text-gray-800 block mb-3">提款方式</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableMethods.map((method) => (
                      <motion.button
                        key={method.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelected(method)}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all",
                          selected.id === method.id
                            ? "bg-blue-50 border-blue-300 shadow-sm"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border-2 shrink-0",
                          method.color === "emerald" && "bg-emerald-50 text-emerald-600 border-emerald-200",
                          method.color === "blue" && "bg-blue-50 text-blue-600 border-blue-200",
                          method.color === "orange" && "bg-orange-50 text-orange-600 border-orange-200",
                          method.color === "indigo" && "bg-indigo-50 text-indigo-600 border-indigo-200",
                          method.color === "gray" && "bg-gray-100 text-gray-600 border-gray-200",
                          method.color === "slate" && "bg-slate-100 text-slate-600 border-slate-200",
                          method.color === "cyan" && "bg-cyan-50 text-cyan-600 border-cyan-200",
                        )}>
                          {method.id === "bank" ? "🏦" : method.id === "swift" ? "🌐" : method.id === "sepa" ? "💶" : method.id.startsWith("usdt") ? "₮" : method.id === "btc" ? "₿" : "Ξ"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{method.name}</p>
                          <p className="text-xs text-gray-500">
                            手续费: {currencySymbol}{method.fee} · {method.time}
                          </p>
                        </div>
                        {selected.id === method.id && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={12} className="text-white" />
                          </div>
                        )}
                      </motion.button>
                    ))}

                    {/* Unavailable methods (disabled) */}
                    {unavailableMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center gap-3 p-4 rounded-2xl border-2 border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed relative group"
                        title={`升级以解锁 ${method.name}`}
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border-2 border-gray-200 bg-gray-100 text-gray-400 shrink-0">
                          {method.id === "bank" ? "🏦" : method.id === "swift" ? "🌐" : method.id === "sepa" ? "💶" : method.id.startsWith("usdt") ? "₮" : method.id === "btc" ? "₿" : "Ξ"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-400 truncate">{method.name}</p>
                          <p className="text-xs text-gray-400">{user?.kycLevel === "basic" ? "需要标准认证" : "需要高级认证"}</p>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-2xl">
                          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                            升级解锁
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div className={cn(
                  "rounded-2xl bg-white border-2 p-5 transition-colors",
                  hasError ? "border-red-300" : "border-gray-200"
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-bold text-gray-800">提款金额</label>
                    <button
                      onClick={() => setAmount(Math.min(balance, dailyRemaining).toString())}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      全部: {formatAmount(Math.min(balance, dailyRemaining), selectedAccount?.currency ?? "USD")}
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">{currencySymbol}</span>
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

                  {/* Limits info */}
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-500">
                      单笔: {formatAmount(perTransactionMin, selectedAccount?.currency ?? "USD")} - {formatAmount(perTransactionMax, selectedAccount?.currency ?? "USD")}
                      {" · "}
                      每日剩余: <span className={cn(isLowBalance ? "text-amber-600 font-semibold" : "text-gray-600")}>{formatAmount(dailyRemaining, selectedAccount?.currency ?? "USD")}</span>
                      {" · "}
                      账户余额: {formatAmount(balance, selectedAccount?.currency ?? "USD")}
                    </p>
                  </div>

                  {/* Validation messages */}
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
                        <button className="underline font-medium ml-1">申请提升额度</button>
                      </p>
                    )}
                    {isAboveBalance && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle size={12} />
                        超出账户余额 {formatAmount(balance, selectedAccount?.currency ?? "USD")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address / Bank Details */}
                <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
                  <label className="text-sm font-bold text-gray-800 block mb-3">
                    {selected.id === "bank" || selected.id === "swift" || selected.id === "sepa" ? "银行账户信息" : "钱包地址"}
                  </label>
                  {selected.id === "bank" || selected.id === "swift" || selected.id === "sepa" ? (
                    <div className="space-y-3">
                      <input placeholder="账户持有人姓名" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
                      <input placeholder="银行名称" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
                      <input placeholder="账号 / IBAN" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
                      <input placeholder="SWIFT/BIC 代码" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
                    </div>
                  ) : (
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={`输入 ${selected.name} 地址`}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-gray-200 text-sm font-mono focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  )}
                </div>

                {/* 地址证明缺失提示 */}
                {needsAddressProof && (
                  <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-800">需要地址证明</p>
                        <p className="text-xs text-red-600 mt-1">
                          提款至 {selected.name} 需要提供地址证明。请上传水电账单或银行对账单。
                        </p>
                        <button className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors">
                          <Upload size={12} />
                          上传地址证明
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className="rounded-2xl bg-gray-50 border-2 border-gray-200 p-5">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">提款金额</span>
                    <span className="font-bold text-gray-900">{currencySymbol}{amount || "0"}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-sm text-gray-600">手续费</span>
                    <span className="font-bold text-gray-900">{currencySymbol}{selected.fee}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-bold text-gray-800">实际到账</span>
                    <span className="font-bold text-lg text-blue-700">{currencySymbol}{receiveAmount > 0 ? receiveAmount.toLocaleString() : "0"}</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("confirm")}
                  disabled={!canContinue}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold shadow-sm transition-colors"
                >
                  继续
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">确认提款</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-blue-200/50">
                      <span className="text-sm text-gray-600">提款账户</span>
                      <span className="font-bold text-gray-900">{selectedAccount?.accountNumber} · {getAccountTypeLabel(selectedAccount!)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-blue-200/50">
                      <span className="text-sm text-gray-600">方式</span>
                      <span className="font-bold text-gray-900">{selected.name}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-blue-200/50">
                      <span className="text-sm text-gray-600">金额</span>
                      <span className="font-bold text-gray-900">{currencySymbol}{amount}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-blue-200/50">
                      <span className="text-sm text-gray-600">手续费</span>
                      <span className="font-bold text-gray-900">{currencySymbol}{selected.fee}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-bold text-gray-800">实际到账</span>
                      <span className="font-bold text-xl text-blue-700">{currencySymbol}{receiveAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <p>请仔细核对收款地址。提款至错误地址将无法找回。</p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep("form")}
                    className="flex-1 py-3.5 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-bold hover:border-gray-300 transition-colors"
                  >
                    返回
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-colors"
                  >
                    确认提款
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Info */}
        <div className="space-y-4">
          {/* 今日额度卡片 */}
          <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                <span className="text-sm font-bold text-gray-800">今日额度</span>
              </div>
              <button className="text-xs text-blue-600 font-semibold hover:underline">提升</button>
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

            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-500">已用</span>
              <span className="font-bold text-gray-900">
                {formatAmount(MOCK_DAILY_USED, selectedAccount?.currency ?? "USD")}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-500">限额</span>
              <span className="font-bold text-gray-900">
                {formatAmount(dailyLimit, selectedAccount?.currency ?? "USD")}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-500">剩余</span>
              <span className={cn("font-bold", isLowBalance ? "text-amber-600" : "text-emerald-600")}>
                {formatAmount(dailyRemaining, selectedAccount?.currency ?? "USD")}
              </span>
            </div>

            {user?.kycLevel !== "enhanced" && (
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 mb-3">
                <p className="text-xs text-amber-700 flex items-center gap-1">
                  <TrendingUp size={12} />
                  提升 KYC 等级可获得更高额度
                </p>
              </div>
            )}

            <button className="w-full text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
              申请提升 <ChevronRight size={12} />
            </button>
          </div>

          {/* 常见问题 FAQ */}
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
