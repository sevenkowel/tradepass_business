"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpFromLine, AlertCircle, CheckCircle2,
  ChevronRight, Clock, ShieldCheck, TrendingUp,
  Upload, FileText,
} from "lucide-react";
import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { usePortalStore } from "@/store/portalStore";
import { useFundLimitsConfig } from "@/lib/config/hooks";
import type { FundMethod } from "@/lib/config/types";
import { cn } from "@/lib/utils";

// 所有提款方式定义
const ALL_METHODS: { id: FundMethod; name: string; color: string; min: number; max: number; fee: number; time: string; isEWallet: boolean }[] = [
  { id: "usdt_trc20", name: "USDT TRC20", color: "emerald", min: 50, max: 50000, fee: 1, time: "1-5 min", isEWallet: true },
  { id: "usdt_erc20", name: "USDT ERC20", color: "blue", min: 100, max: 100000, fee: 5, time: "5-15 min", isEWallet: true },
  { id: "btc", name: "Bitcoin", color: "orange", min: 0.001, max: 50000, fee: 0.0001, time: "10-30 min", isEWallet: true },
  { id: "eth", name: "Ethereum", color: "indigo", min: 0.01, max: 50000, fee: 0.005, time: "5-10 min", isEWallet: true },
  { id: "bank", name: "Bank Wire", color: "gray", min: 1000, max: 500000, fee: 25, time: "1-3 days", isEWallet: false },
  { id: "swift", name: "SWIFT", color: "slate", min: 5000, max: 500000, fee: 35, time: "2-5 days", isEWallet: false },
  { id: "sepa", name: "SEPA", color: "cyan", min: 500, max: 200000, fee: 5, time: "1-2 days", isEWallet: false },
];

// Mock 今日已用提款额度（实际应从 API 获取）
const MOCK_DAILY_USED = 1200;

export default function WithdrawPage() {
  const { user, wallet } = usePortalStore();
  const { fundLimits } = useFundLimitsConfig(user?.region ?? null);

  // 当前 KYC 等级的提款限额
  const withdrawalLimits = fundLimits?.[user?.kycLevel ?? "basic"]?.withdrawal;
  const eWalletRequiresAddressProof = withdrawalLimits?.eWalletRequiresAddressProof ?? false;

  // 支付方式过滤
  const { availableMethods, unavailableMethods } = useMemo(() => {
    const allowed = withdrawalLimits?.allowedMethods ?? ["bank"];
    const available = ALL_METHODS.filter((m) => allowed.includes(m.id));
    const unavailable = ALL_METHODS.filter((m) => !allowed.includes(m.id));
    return { availableMethods: available, unavailableMethods: unavailable };
  }, [withdrawalLimits]);

  const [selected, setSelected] = useState(availableMethods[0] ?? ALL_METHODS[0]);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [step, setStep] = useState<"form" | "confirm">("form");

  const balance = wallet?.available ?? 0;
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

  return (
    <div className="space-y-6">
      <PageHeader title="Withdraw Funds" description="Withdraw funds to your external wallet or bank account." />

      {/* KYC 升级引导 */}
      {user?.kycLevel === "basic" && (
        <div className="rounded-2xl bg-amber-50 border-2 border-amber-200 p-4 flex items-center gap-3">
          <TrendingUp size={20} className="text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">Upgrade to Standard for Higher Limits</p>
            <p className="text-xs text-amber-600">Unlock crypto withdrawals and increase your daily limit.</p>
          </div>
          <button className="text-xs font-semibold text-amber-700 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors">
            Verify Now
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
                Daily withdrawal remaining only <span className="font-semibold">${dailyRemaining.toLocaleString()}</span>.
                <button className="ml-1 underline font-medium">Apply for higher limit</button>
              </p>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border-2", step === "form" ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200")}>
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step === "form" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600")}>1</div>
              <span className={cn("text-sm font-semibold", step === "form" ? "text-blue-700" : "text-gray-600")}>Withdraw Details</span>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
            <div className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border-2", step === "confirm" ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200")}>
              <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", step === "confirm" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600")}>2</div>
              <span className={cn("text-sm font-semibold", step === "confirm" ? "text-blue-700" : "text-gray-600")}>Confirm</span>
            </div>
          </div>

          {step === "form" ? (
            <>
              {/* Available methods */}
              <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
                <label className="text-sm font-bold text-gray-800 block mb-3">Withdrawal Method</label>
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
                        <p className="text-xs text-gray-500">Fee: ${method.fee} · {method.time}</p>
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
                      title={`Upgrade to unlock ${method.name}`}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold border-2 border-gray-200 bg-gray-100 text-gray-400 shrink-0">
                        {method.id === "bank" ? "🏦" : method.id === "swift" ? "🌐" : method.id === "sepa" ? "💶" : method.id.startsWith("usdt") ? "₮" : method.id === "btc" ? "₿" : "Ξ"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-400 truncate">{method.name}</p>
                        <p className="text-xs text-gray-400">{user?.kycLevel === "basic" ? "Requires Standard" : "Requires Enhanced"}</p>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-2xl">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                          Upgrade to Unlock
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
                  <label className="text-sm font-bold text-gray-800">Amount (USD)</label>
                  <button
                    onClick={() => setAmount(Math.min(balance, dailyRemaining).toString())}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    Max: ${Math.min(balance, dailyRemaining).toLocaleString()}
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min $${perTransactionMin}`}
                    className={cn(
                      "w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-2 text-lg font-bold text-gray-900 focus:outline-none transition-colors",
                      hasError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-blue-400"
                    )}
                  />
                </div>

                {/* Limits info */}
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Single: ${perTransactionMin.toLocaleString()} - {perTransactionMax >= 999999999 ? "Unlimited" : `$${perTransactionMax.toLocaleString()}`}
                    {" · "}
                    Daily remaining: <span className={cn(isLowBalance ? "text-amber-600 font-semibold" : "text-gray-600")}>${dailyRemaining.toLocaleString()}</span>
                    {" · "}
                    Available: ${balance.toLocaleString()}
                  </p>
                </div>

                {/* Validation messages */}
                <div className="mt-2 space-y-1">
                  {isBelowMin && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Below minimum amount of ${perTransactionMin}
                    </p>
                  )}
                  {isAboveMax && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Exceeds single transaction limit of ${perTransactionMax >= 999999999 ? "Unlimited" : perTransactionMax.toLocaleString()}
                    </p>
                  )}
                  {isAboveDaily && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Exceeds daily remaining of ${dailyRemaining.toLocaleString()}
                      <button className="underline font-medium ml-1">Apply for higher limit</button>
                    </p>
                  )}
                  {isAboveBalance && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Exceeds available balance of ${balance.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Address / Bank Details */}
              <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
                <label className="text-sm font-bold text-gray-800 block mb-3">
                  {selected.id === "bank" || selected.id === "swift" || selected.id === "sepa" ? "Bank Account Details" : "Wallet Address"}
                </label>
                {selected.id === "bank" || selected.id === "swift" || selected.id === "sepa" ? (
                  <div className="space-y-3">
                    <input placeholder="Account Holder Name" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
                    <input placeholder="Bank Name" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
                    <input placeholder="Account Number / IBAN" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
                    <input placeholder="SWIFT/BIC Code" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                ) : (
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={`Enter ${selected.name} address`}
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
                      <p className="text-sm font-semibold text-red-800">Address Proof Required</p>
                      <p className="text-xs text-red-600 mt-1">
                        Withdrawals to {selected.name} require a verified address proof. Please upload your utility bill or bank statement to continue.
                      </p>
                      <button className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors">
                        <Upload size={12} />
                        Upload Address Proof
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="rounded-2xl bg-gray-50 border-2 border-gray-200 p-5">
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Withdraw Amount</span>
                  <span className="font-bold text-gray-900">${amount || "0"}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Network Fee</span>
                  <span className="font-bold text-gray-900">${selected.fee}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-bold text-gray-800">You Receive</span>
                  <span className="font-bold text-lg text-blue-700">${receiveAmount > 0 ? receiveAmount.toLocaleString() : "0"}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep("confirm")}
                disabled={!canContinue}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold shadow-sm transition-colors"
              >
                Continue
              </motion.button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Confirm Withdrawal</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-blue-200/50">
                    <span className="text-sm text-gray-600">Method</span>
                    <span className="font-bold text-gray-900">{selected.name}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-blue-200/50">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="font-bold text-gray-900">${amount}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-blue-200/50">
                    <span className="text-sm text-gray-600">Fee</span>
                    <span className="font-bold text-gray-900">${selected.fee}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-bold text-gray-800">Total Receive</span>
                    <span className="font-bold text-xl text-blue-700">${receiveAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <p>Please verify the address carefully. Withdrawals to incorrect addresses cannot be recovered.</p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep("form")}
                  className="flex-1 py-3.5 rounded-xl bg-white border-2 border-gray-200 text-gray-700 font-bold hover:border-gray-300 transition-colors"
                >
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-colors"
                >
                  Confirm Withdrawal
                </motion.button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="space-y-4">
          <div className="rounded-2xl bg-white border-2 border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <ShieldCheck size={16} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900">Security Check</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                2FA verification required
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Email confirmation
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                Daily limit: ${dailyLimit >= 999999999 ? "Unlimited" : dailyLimit.toLocaleString()}
              </li>
              {eWalletRequiresAddressProof && (
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className={user?.addressProof ? "text-emerald-500" : "text-amber-500"} />
                  {user?.addressProof ? "Address proof verified" : "Address proof required for e-wallets"}
                </li>
              )}
            </ul>
          </div>

          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Clock size={12} />
              <span>Recent Withdrawals</span>
            </div>
            <div className="space-y-2">
              {[
                { amount: "-$1,200", method: "USDT ERC20", time: "2d ago" },
                { amount: "-$800", method: "USDT TRC20", time: "5d ago" },
              ].map((w, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-bold text-red-500">{w.amount}</span>
                  <span className="text-gray-400">{w.method} · {w.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
