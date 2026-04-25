"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownLeft, CreditCard, Landmark, HelpCircle, ArrowUpRight,
  ChevronDown, ChevronUp, MessageCircle, Lock, AlertTriangle,
  Star, ChevronRight, CheckCircle2, Loader2, ArrowLeft, Copy,
  ShieldCheck, Clock, Diamond, Wallet, CircleDot, Circle,
  Banknote,
} from "lucide-react";
import QRCode from "qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// ===================== Types =====================
type CalculationMode = "deposit_first" | "payment_first";

interface DepositAccount {
  id: string;
  platform: string;
  accountType: string;
  currency: string;
  equity: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  category: "crypto" | "card" | "bank" | "ewallet";
  desc?: string;
  feeType: "percentage" | "fixed";
  feeValue: number;
  calculationMode: CalculationMode;
  paymentCurrency: string;
  supportedCurrencies: string[];
  exchangeRate: number;
  kycRequired: number;
  estimatedTime?: string;
}

interface CalculationResult {
  depositAmount: number;
  paymentAmount: number;
  exchangeAmount: number;
  fee: number;
  rate: number;
  rateDisplay: string;
}

// ===================== Data =====================
const allAccounts: DepositAccount[] = [
  { id: "wallet-usd", platform: "", accountType: "Wallet", currency: "USD", equity: 12500 },
  { id: "7845321", platform: "MT4", accountType: "Standard", currency: "USD", equity: 8200 },
  { id: "7845322", platform: "MT4", accountType: "Raw", currency: "JPY", equity: 920000 },
  { id: "7845323", platform: "MT4", accountType: "ECN", currency: "EUR", equity: 5200 },
  { id: "7845324", platform: "MT4", accountType: "Pro", currency: "USD", equity: 3500 },
  { id: "7845325", platform: "MT4", accountType: "ECN", currency: "EUR", equity: 2800 },
  { id: "8999999", platform: "MT5", accountType: "Standard", currency: "USD", equity: 1000 },
  { id: "8999998", platform: "MT5", accountType: "Pro", currency: "JPY", equity: 1500000 },
  { id: "8999997", platform: "MT5", accountType: "ECN", currency: "EUR", equity: 8500 },
  { id: "8999996", platform: "MT5", accountType: "Pro", currency: "USD", equity: 5200 },
  { id: "8999995", platform: "MT5", accountType: "ECN", currency: "JPY", equity: 850000 },
  { id: "2000001", platform: "TP", accountType: "Classic", currency: "USD", equity: 15800 },
  { id: "2000002", platform: "TP", accountType: "VIP", currency: "JPY", equity: 2200000 },
  { id: "2000003", platform: "TP", accountType: "Pro", currency: "EUR", equity: 4200 },
  { id: "2000004", platform: "TP", accountType: "Classic", currency: "USD", equity: 9500 },
  { id: "2000005", platform: "TP", accountType: "ECN", currency: "EUR", equity: 3100 },
];

const walletAccounts = allAccounts.filter(a => a.platform === "");
const mt4Accounts = allAccounts.filter(a => a.platform === "MT4");
const mt5Accounts = allAccounts.filter(a => a.platform === "MT5");
const tpAccounts = allAccounts.filter(a => a.platform === "TP");
const recommendedAccount = mt5Accounts.find(a => a.currency === "JPY") || mt5Accounts[0];

const paymentMethods: PaymentMethod[] = [
  { id: "usdt-trc20", name: "USDT-TRC20", category: "crypto", desc: "推荐", feeType: "percentage", feeValue: 0, calculationMode: "deposit_first", paymentCurrency: "USDT", supportedCurrencies: ["USD","EUR","JPY"], exchangeRate: 1.0, kycRequired: 0, estimatedTime: "即时到账" },
  { id: "usdt-erc20", name: "USDT-ERC20", category: "crypto", desc: "推荐", feeType: "percentage", feeValue: 0, calculationMode: "deposit_first", paymentCurrency: "USDT", supportedCurrencies: ["USD","EUR","JPY"], exchangeRate: 1.0, kycRequired: 0, estimatedTime: "即时到账" },
  { id: "btc", name: "BTC", category: "crypto", feeType: "percentage", feeValue: 0.5, calculationMode: "deposit_first", paymentCurrency: "BTC", supportedCurrencies: ["USD","EUR","JPY"], exchangeRate: 8333333, kycRequired: 1, estimatedTime: "约10分钟" },
  { id: "eth", name: "ETH", category: "crypto", feeType: "percentage", feeValue: 0.5, calculationMode: "deposit_first", paymentCurrency: "ETH", supportedCurrencies: ["USD","EUR","JPY"], exchangeRate: 285714, kycRequired: 1, estimatedTime: "约5分钟" },
  { id: "visa", name: "Visa", category: "card", feeType: "percentage", feeValue: 2.5, calculationMode: "deposit_first", paymentCurrency: "USD", supportedCurrencies: ["USD","EUR"], exchangeRate: 1.0, kycRequired: 0, estimatedTime: "即时到账" },
  { id: "mastercard", name: "Mastercard", category: "card", feeType: "percentage", feeValue: 2.5, calculationMode: "deposit_first", paymentCurrency: "USD", supportedCurrencies: ["USD","EUR"], exchangeRate: 1.0, kycRequired: 0, estimatedTime: "即时到账" },
  { id: "swift", name: "SWIFT", category: "bank", desc: "大额", feeType: "fixed", feeValue: 25, calculationMode: "payment_first", paymentCurrency: "USD", supportedCurrencies: ["USD","EUR","JPY"], exchangeRate: 1.0, kycRequired: 1, estimatedTime: "1-3个工作日" },
  { id: "sepa", name: "SEPA", category: "bank", feeType: "fixed", feeValue: 15, calculationMode: "payment_first", paymentCurrency: "EUR", supportedCurrencies: ["EUR"], exchangeRate: 1.0, kycRequired: 1, estimatedTime: "1-2个工作日" },
  { id: "paypal", name: "PayPal", category: "ewallet", desc: "推荐", feeType: "percentage", feeValue: 1.5, calculationMode: "deposit_first", paymentCurrency: "USD", supportedCurrencies: ["USD","EUR","JPY"], exchangeRate: 1.0, kycRequired: 0, estimatedTime: "即时到账" },
  { id: "skrill", name: "Skrill", category: "ewallet", feeType: "percentage", feeValue: 1.5, calculationMode: "deposit_first", paymentCurrency: "USD", supportedCurrencies: ["USD","EUR","JPY"], exchangeRate: 1.0, kycRequired: 1, estimatedTime: "即时到账" },
];

const paymentCategories = [
  { id: "crypto" as const, name: "加密货币", icon: Diamond },
  { id: "card" as const, name: "银行卡", icon: CreditCard },
  { id: "bank" as const, name: "银行转账", icon: Landmark },
  { id: "ewallet" as const, name: "电子钱包", icon: Wallet },
];

const faqItems = [
  { q: "如何进行充值？", a: "选择充值方式 → 输入金额 → 完成支付 → 自动到账" },
  { q: "充值需要多久到账？", a: "加密货币即时到账，银行转账 1-3 个工作日" },
  { q: "充值限额是多少？", a: "L0: 单笔$1,000/L1: 单笔$10,000/L2: 单笔$50,000" },
  { q: "充值失败怎么办？", a: "联系客服或提交工单，提供转账凭证" },
];

const KYC_LIMITS: Record<number, { min: number; max: number; daily: number; monthly: number }> = {
  0: { min: 10, max: 1000, daily: 5000, monthly: 20000 },
  1: { min: 10, max: 10000, daily: 50000, monthly: 200000 },
  2: { min: 10, max: 50000, daily: 200000, monthly: 1000000 },
  3: { min: 10, max: 100000, daily: 500000, monthly: 5000000 },
};

// ===================== Helpers =====================
function currencySymbol(currency: string) {
  if (currency === "JPY") return "¥";
  if (currency === "EUR") return "€";
  if (currency === "BTC") return "₿";
  if (currency === "ETH") return "Ξ";
  if (currency === "USDT") return "₮";
  return "$";
}

function fmtEquity(acc: DepositAccount): string {
  const sym = currencySymbol(acc.currency);
  return `${sym}${acc.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatAccountLabel(a: DepositAccount): string {
  if (a.platform) return `${a.platform}-${a.id}-${a.accountType}-${fmtEquity(a)}`;
  return `${a.accountType}-Wallet-${a.currency}-${fmtEquity(a)}`;
}

function accountLabel(id: string): string {
  const a = allAccounts.find(x => x.id === id);
  if (!a) return "选择账户";
  return formatAccountLabel(a);
}

function calculateOrder(
  mode: CalculationMode,
  inputAmount: number,
  method: PaymentMethod,
  accountCurrency: string
): CalculationResult | null {
  if (isNaN(inputAmount) || inputAmount <= 0) return null;

  const rate = method.exchangeRate || 1;
  const rateDisplay = rate < 0.0001
    ? `1 ${method.paymentCurrency} = ${rate.toPrecision(6)} ${accountCurrency}`
    : `1 ${method.paymentCurrency} = ${rate.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${accountCurrency}`;

  if (mode === "deposit_first") {
    const exchangeAmount = inputAmount / rate;
    let fee = 0;
    if (method.feeType === "percentage") {
      fee = exchangeAmount * (method.feeValue / 100);
    } else {
      fee = method.feeValue;
    }
    const paymentAmount = exchangeAmount + fee;
    return {
      depositAmount: inputAmount,
      paymentAmount,
      exchangeAmount,
      fee,
      rate,
      rateDisplay,
    };
  } else {
    let fee = 0;
    if (method.feeType === "percentage") {
      fee = inputAmount * (method.feeValue / 100) * rate;
    } else {
      fee = method.feeValue;
    }
    const exchangeAmount = inputAmount * rate;
    const depositAmount = exchangeAmount - fee;
    return {
      depositAmount: Math.max(0, depositAmount),
      paymentAmount: inputAmount,
      exchangeAmount,
      fee,
      rate,
      rateDisplay,
    };
  }
}

function formatMoney(amount: number | null | undefined, currency: string = "USD"): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "--";
  const sym = currencySymbol(currency);
  return `${sym}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const steps = [
  { id: 1, name: "账户与金额" },
  { id: 2, name: "支付方式" },
  { id: 3, name: "确认订单" },
];

// ===================== Order Summary Card =====================
function OrderSummary({
  step,
  selectedAccount,
  amount,
  selectedMethod,
  orderDetails,
  agreed,
  onAgreedChange,
  onNext,
  onBack,
  isCalculating,
  canProceed,
  buttonText,
}: {
  step: number;
  selectedAccount: DepositAccount | null;
  amount: string;
  selectedMethod: PaymentMethod | null;
  orderDetails: CalculationResult | null;
  agreed: boolean;
  onAgreedChange: (v: boolean) => void;
  onNext: () => void;
  onBack: () => void;
  isCalculating: boolean;
  canProceed: boolean;
  buttonText: string;
}) {
  const numAmount = parseFloat(amount);
  const displayAmount = !isNaN(numAmount) && numAmount > 0 ? numAmount : null;

  const estimatedArrival = useMemo(() => {
    if (!displayAmount) return null;
    if (!selectedMethod || !orderDetails) return displayAmount;
    return selectedMethod.calculationMode === "deposit_first"
      ? orderDetails.depositAmount
      : orderDetails.depositAmount;
  }, [displayAmount, selectedMethod, orderDetails]);

  return (
    <div className="w-[380px] shrink-0">
      <Card className="sticky top-6 border-slate-200 shadow-sm">
        <CardContent className="p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-900">存款摘要</h3>

          <div className="space-y-3">
            {/* 交易账户 */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">交易账户</span>
              <span className="font-medium text-slate-900 truncate max-w-[180px]">
                {selectedAccount ? formatAccountLabel(selectedAccount) : "--"}
              </span>
            </div>

            {/* 存款金额 */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">存款金额</span>
              <span className="font-medium text-slate-900">
                {displayAmount
                  ? formatMoney(displayAmount, selectedAccount?.currency || "USD")
                  : "--"}
              </span>
            </div>

            {/* 支付方式 - step >= 2 显示 */}
            {step >= 2 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">支付方式</span>
                <span className="font-medium text-slate-900">
                  {selectedMethod?.name ?? "--"}
                </span>
              </div>
            )}

            {/* 预计到账时间 - step >= 2 显示 */}
            {step >= 2 && selectedMethod && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">预计到账</span>
                <span className="font-medium text-slate-900">{selectedMethod.estimatedTime}</span>
              </div>
            )}

            <div className="h-px bg-slate-200" />

            {/* 预计到账金额 - highlight */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900">预计到账</span>
              <span className="text-xl font-bold text-slate-900">
                {estimatedArrival !== null
                  ? formatMoney(estimatedArrival, selectedAccount?.currency || "USD")
                  : "--"}
              </span>
            </div>
          </div>

          {/* 协议勾选 - 仅在 Step 3 */}
          <AnimatePresence>
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-2.5 pt-1">
                  <Checkbox
                    id="agreement"
                    checked={agreed}
                    onCheckedChange={(v) => onAgreedChange(v as boolean)}
                  />
                  <label htmlFor="agreement" className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none -mt-0.5">
                    我已阅读并同意
                    <Link href="#" className="text-blue-600 hover:underline">入金条款</Link>
                    与
                    <Link href="#" className="text-blue-600 hover:underline">风险提示</Link>
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 按钮 */}
          <div className="space-y-2">
            <Button
              onClick={onNext}
              disabled={!canProceed}
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl disabled:bg-slate-300 disabled:text-slate-500 transition-all"
            >
              {isCalculating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 计算中...</>
              ) : (
                <>{buttonText} <ChevronRight className="w-4 h-4 ml-1.5" /></>
              )}
            </Button>

            {step > 1 && (
              <button
                onClick={onBack}
                className="w-full h-10 text-sm text-slate-500 hover:text-slate-700 transition-colors flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> 返回上一步
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ===================== Step 1: Account & Amount =====================
function Step1AccountAmount({
  targetAccount,
  onTargetAccountChange,
  amount,
  onAmountChange,
  accountSymbolStr,
  quickAmounts,
  limits,
  todayUsed,
  isSuspicious,
}: {
  targetAccount: string;
  onTargetAccountChange: (v: string) => void;
  amount: string;
  onAmountChange: (v: string) => void;
  accountSymbolStr: string;
  quickAmounts: string[];
  limits: { min: number; max: number; daily: number; monthly: number };
  todayUsed: number;
  isSuspicious: boolean;
}) {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden border-slate-200">
        <CardContent className="p-0">
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-900">存款</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* ① 选择存入账户 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs flex items-center justify-center">1</span>
                选择存入账户
              </div>
              <Select value={targetAccount} onValueChange={onTargetAccountChange}>
                <SelectTrigger className="h-12 border-slate-200"><SelectValue placeholder="选择账户" /></SelectTrigger>
                <SelectContent className="max-h-[320px] w-[520px]">
                  {recommendedAccount && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-amber-600 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> 推荐账户
                      </div>
                      <SelectItem value={recommendedAccount.id}>
                        <span className="font-mono text-sm text-slate-900">{formatAccountLabel(recommendedAccount)}</span>
                      </SelectItem>
                      <div className="h-px bg-slate-100 mx-2 my-1" />
                      <div className="px-2 py-1.5 text-xs font-medium text-slate-500">其他账户</div>
                    </>
                  )}
                  {walletAccounts.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-medium text-slate-500">钱包</div>
                      {walletAccounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          <span className="font-mono text-sm text-slate-700">{formatAccountLabel(acc)}</span>
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {mt4Accounts.filter(a => a.id !== recommendedAccount?.id).length > 0 && (
                    <>
                      <div className="h-px bg-slate-100 mx-2 my-1" />
                      <div className="px-2 py-1.5 text-xs font-medium text-slate-500 flex justify-between">
                        MT4 <span className="font-normal text-slate-400">({mt4Accounts.filter(a => a.id !== recommendedAccount?.id).length})</span>
                      </div>
                      {mt4Accounts.filter(a => a.id !== recommendedAccount?.id).map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          <span className="font-mono text-sm text-slate-700">{formatAccountLabel(acc)}</span>
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {mt5Accounts.filter(a => a.id !== recommendedAccount?.id).length > 0 && (
                    <>
                      <div className="h-px bg-slate-100 mx-2 my-1" />
                      <div className="px-2 py-1.5 text-xs font-medium text-slate-500 flex justify-between">
                        MT5 <span className="font-normal text-slate-400">({mt5Accounts.filter(a => a.id !== recommendedAccount?.id).length})</span>
                      </div>
                      {mt5Accounts.filter(a => a.id !== recommendedAccount?.id).map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          <span className="font-mono text-sm text-slate-700">{formatAccountLabel(acc)}</span>
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {tpAccounts.length > 0 && (
                    <>
                      <div className="h-px bg-slate-100 mx-2 my-1" />
                      <div className="px-2 py-1.5 text-xs font-medium text-slate-500 flex justify-between">
                        TP <span className="font-normal text-slate-400">({tpAccounts.length})</span>
                      </div>
                      {tpAccounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          <span className="font-mono text-sm text-slate-700">{formatAccountLabel(acc)}</span>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="h-px bg-slate-100" />

            {/* ② 输入存款金额 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-xs flex items-center justify-center">2</span>
                输入存款金额
              </div>

              <div className="flex flex-wrap gap-2">
                {quickAmounts.map(preset => (
                  <button key={preset} onClick={() => onAmountChange(preset)}
                    className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors">
                    {accountSymbolStr}{parseInt(preset).toLocaleString()}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-3xl font-bold text-slate-500">
                  {accountSymbolStr}
                </span>
                <Input type="number" placeholder="0.00" value={amount} onChange={e => onAmountChange(e.target.value)}
                  className="pl-14 h-16 text-3xl font-bold font-variant-numeric tabular-nums border-slate-200" />
              </div>

              {/* 限额提示 */}
              {(() => {
                const usageRatio = todayUsed / limits.daily;
                const remaining = limits.daily - todayUsed;
                if (usageRatio >= 0.85) {
                  return (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">今日额度紧张</p>
                        <p className="text-xs text-red-600 mt-0.5">
                          已用 {accountSymbolStr}{todayUsed.toLocaleString()} / 限额 {accountSymbolStr}{limits.daily.toLocaleString()}，剩余 {accountSymbolStr}{remaining.toLocaleString()}
                        </p>
                        <button className="mt-2 text-xs font-medium text-red-700 hover:underline">申请提升额度 →</button>
                      </div>
                    </div>
                  );
                }
                if (usageRatio >= 0.6) {
                  return (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-800">今日额度已用 {Math.round(usageRatio * 100)}%</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          剩余 {accountSymbolStr}{remaining.toLocaleString()}，单笔限额 {accountSymbolStr}{limits.min.toLocaleString()} - {accountSymbolStr}{limits.max.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>单笔 {accountSymbolStr}{limits.min.toLocaleString()} - {accountSymbolStr}{limits.max.toLocaleString()}</span>
                    <span>今日剩余 {accountSymbolStr}{remaining.toLocaleString()}</span>
                  </div>
                );
              })()}

              {isSuspicious && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">小额充值频繁</p>
                    <p className="text-xs text-amber-600 mt-0.5">检测到连续小额充值，请确认是否本人操作</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===================== Step 2: Payment Method =====================
function Step2PaymentMethod({
  selectedMethodId,
  onSelectMethod,
  selectedAccount,
  userKyc,
}: {
  selectedMethodId: string | null;
  onSelectMethod: (id: string) => void;
  selectedAccount: DepositAccount | null;
  userKyc: number;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("crypto");

  const filteredMethods = useMemo(() =>
    paymentMethods.filter(m => m.category === activeCategory),
    [activeCategory]
  );

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <Card className="overflow-hidden border-slate-200">
        <CardContent className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-slate-600" />选择支付方式
          </h2>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {paymentCategories.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Payment Method Cards */}
          <div className="space-y-2.5">
            {filteredMethods.map(item => {
              const isLocked = item.kycRequired > userKyc;
              const isSelected = selectedMethodId === item.id;
              const unsupported = selectedAccount ? !item.supportedCurrencies.includes(selectedAccount.currency) : false;
              const disabled = isLocked || unsupported;

              return (
                <button
                  key={item.id}
                  disabled={disabled}
                  onClick={() => !disabled && onSelectMethod(item.id)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                    isSelected
                      ? "border-slate-900 bg-slate-50 shadow-sm"
                      : disabled
                        ? "border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-60"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  )}
                >
                  {/* Radio circle */}
                  <div className="shrink-0">
                    {isSelected ? (
                      <CircleDot className="w-5 h-5 text-slate-900" />
                    ) : (
                      <Circle className={cn("w-5 h-5", disabled ? "text-slate-300" : "text-slate-300")} />
                    )}
                  </div>

                  {/* Method info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("font-medium", isSelected ? "text-slate-900" : disabled ? "text-slate-400" : "text-slate-700")}>
                        {item.name}
                      </span>
                      {item.desc && !disabled && (
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                          isSelected ? "bg-slate-200 text-slate-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {item.desc}
                        </span>
                      )}
                      {isLocked && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded-full">需 L{item.kycRequired}</span>
                      )}
                      {unsupported && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-full">不支持 {selectedAccount?.currency}</span>
                      )}
                    </div>
                    <p className={cn("text-xs mt-0.5", isSelected ? "text-slate-500" : "text-slate-400")}>
                      {item.estimatedTime} · {item.feeValue === 0 ? "免费" : `${item.feeType === "percentage" ? `${item.feeValue}%` : `$${item.feeValue}`}`}
                    </p>
                  </div>

                  {/* Category icon */}
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                    {item.category === "crypto" && <Diamond className="w-4 h-4 text-slate-500" />}
                    {item.category === "card" && <CreditCard className="w-4 h-4 text-slate-500" />}
                    {item.category === "bank" && <Landmark className="w-4 h-4 text-slate-500" />}
                    {item.category === "ewallet" && <Wallet className="w-4 h-4 text-slate-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===================== Step 3: Confirm Order =====================
function Step3Confirm({
  selectedAccount,
  selectedMethod,
  orderDetails,
  amount,
  copied,
  onCopy,
  qrDataUrl,
  receiptFile,
  onReceiptChange,
  showCryptoConfirm,
  onShowCryptoConfirm,
}: {
  selectedAccount: DepositAccount;
  selectedMethod: PaymentMethod;
  orderDetails: CalculationResult;
  amount: string;
  copied: boolean;
  onCopy: (text: string) => void;
  qrDataUrl: string | null;
  receiptFile: File | null;
  onReceiptChange: (file: File | null) => void;
  showCryptoConfirm: boolean;
  onShowCryptoConfirm: (v: boolean) => void;
}) {
  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-6 space-y-5">
          <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-slate-600" />确认存款订单
          </h2>

          {/* 订单概览 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">存入账户</p>
              <p className="text-sm font-medium text-slate-900">{formatAccountLabel(selectedAccount)}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">支付方式</p>
              <p className="text-sm font-medium text-slate-900">{selectedMethod.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{selectedMethod.estimatedTime}</p>
            </div>
          </div>

          {/* 金额明细 */}
          <div className="border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{selectedMethod.calculationMode === "deposit_first" ? "存款金额" : "付款金额"}</span>
              <span className="font-medium text-slate-900">
                {currencySymbol(selectedMethod.calculationMode === "deposit_first" ? selectedAccount.currency : selectedMethod.paymentCurrency)}
                {(selectedMethod.calculationMode === "deposit_first" ? orderDetails.depositAmount : orderDetails.paymentAmount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">参考汇率</span>
              <span className="font-medium text-slate-900">{orderDetails.rateDisplay}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">换汇金额</span>
              <span className="font-medium text-slate-900">
                {currencySymbol(selectedMethod.paymentCurrency)}{orderDetails.exchangeAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
              </span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
              <span className="font-semibold text-slate-900">
                {selectedMethod.calculationMode === "deposit_first" ? "预计付款金额" : "预计到账金额"}
              </span>
              <span className="text-2xl font-bold text-slate-900">
                {currencySymbol(selectedMethod.calculationMode === "deposit_first" ? selectedMethod.paymentCurrency : selectedAccount.currency)}
                {(selectedMethod.calculationMode === "deposit_first" ? orderDetails.paymentAmount : orderDetails.depositAmount).toLocaleString(undefined, { maximumFractionDigits: selectedMethod.calculationMode === "deposit_first" ? 4 : 2 })}
              </span>
            </div>
          </div>

          {/* Crypto receiving info */}
          {selectedMethod.category === "crypto" && (
            <div className="p-5 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 space-y-5">
              <div className="flex items-start gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                <div>
                  <p className="text-base font-semibold text-slate-900">存款地址</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    复制 {selectedMethod.name} 钱包地址并将其粘贴到您的个人加密货币钱包中作为收件人地址。
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="w-36 h-36 bg-white rounded-xl border border-slate-200 p-2 flex items-center justify-center overflow-hidden">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Code" className="w-full h-full object-contain rounded-lg" />
                  ) : (
                    <div className="w-full h-full bg-slate-100 rounded-lg animate-pulse" />
                  )}
                </div>

                <div className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-slate-100 rounded-xl">
                  <p className="font-medium text-slate-900 font-mono tracking-wide break-all text-sm leading-relaxed">
                    {selectedMethod.id.includes("btc")
                      ? "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                      : selectedMethod.id.includes("eth")
                        ? "0xA1B2C3D4E5F6789012345678901234567890ABCD"
                        : "0xA1B2C3D4E5F6"
                    }
                  </p>
                  <button
                    onClick={() =>
                      onCopy(
                        selectedMethod.id.includes("btc")
                          ? "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                          : selectedMethod.id.includes("eth")
                            ? "0xA1B2C3D4E5F6789012345678901234567890ABCD"
                            : "0xA1B2C3D4E5F6"
                      )
                    }
                    className="shrink-0 p-2 hover:bg-white rounded-lg text-slate-500 transition-colors"
                    title="复制地址"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />重要
                </p>
                <ol className="text-xs text-amber-700 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>请确保支付金额超过 5 USDT。低于此阈值的金额将不会被记入。</li>
                  <li>USDT-BEP20 转账分为交易和内部交易。使用内部交易进行转账可能会导致交易丢失。请避免使用这种方法。</li>
                  <li>请注意，我们无法通过 BUSDT 存款或取款，请确保地址和加密货币与我们接受的链和货币匹配，否则您可能会丢失资金。</li>
                  <li>请注意支付区块链转账手续费，以免导致入金到账金额不同。</li>
                </ol>
              </div>
            </div>
          )}

          {/* Bank receiving info */}
          {selectedMethod.category === "bank" && (
            <div className="p-5 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 space-y-4">
              <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <Landmark className="w-4 h-4 text-slate-500" />收款账户信息
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500">账户名称</p>
                  <p className="font-medium text-slate-900 mt-1">TradePass Global Ltd</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500">银行账号</p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="font-medium text-slate-900 truncate">8823-1100-4455-9921</p>
                    <button onClick={() => onCopy("8823-1100-4455-9921")} className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500">开户银行</p>
                  <p className="font-medium text-slate-900 mt-1">Standard Chartered Bank</p>
                </div>
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500">SWIFT</p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="font-medium text-slate-900 truncate">SCBLUS33</p>
                    <button onClick={() => onCopy("SCBLUS33")} className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                <p className="text-sm font-medium text-slate-900">转账截图 <span className="text-red-500">*</span></p>
                <p className="text-xs text-slate-500">请上传转账成功截图，完成后才可提交存款订单</p>
                <label className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onReceiptChange(e.target.files?.[0] || null)}
                  />
                  选择文件
                </label>
                {receiptFile ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="truncate max-w-[240px]">{receiptFile.name}</span>
                  </div>
                ) : (
                  <p className="text-xs text-red-500">必须上传转账截图</p>
                )}
              </div>
            </div>
          )}

          {/* Third-party redirect info */}
          {(selectedMethod.category === "card" || selectedMethod.category === "ewallet") && (
            <div className="p-5 border border-dashed border-slate-300 rounded-xl bg-slate-50/50 space-y-2">
              <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-slate-500" />第三方支付
              </p>
              <p className="text-sm text-slate-600">确认订单后，我们将跳转至 {selectedMethod.name} 的安全支付页面完成付款。</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ===================== Main Page =====================
export default function DepositPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [targetAccount, setTargetAccount] = useState<string>(recommendedAccount.id);
  const [amount, setAmount] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [orderDetails, setOrderDetails] = useState<CalculationResult | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCryptoConfirm, setShowCryptoConfirm] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [agreed, setAgreed] = useState(false);

  const userKyc = 1;
  const limits = KYC_LIMITS[userKyc] || KYC_LIMITS[0];
  const todayUsed = 2500;

  const selectedAccount = useMemo(() => allAccounts.find(a => a.id === targetAccount) || null, [targetAccount]);
  const accountSymbolStr = currencySymbol(selectedAccount?.currency || "USD");

  const selectedMethod = useMemo(() => paymentMethods.find(m => m.id === selectedMethodId) || null, [selectedMethodId]);

  const isAmountValid = !!amount && parseFloat(amount) > 0 && parseFloat(amount) >= limits.min;
  const isSuspicious = !!amount && parseFloat(amount) > 0 && parseFloat(amount) < 10;

  const quickAmounts = useMemo(() => {
    return accountSymbolStr === "¥" ? ["10000", "50000", "100000", "500000"] : ["100", "500", "1000", "5000"];
  }, [accountSymbolStr]);

  function selectMethod(id: string) {
    setSelectedMethodId(id);
  }

  async function handleConfirmMethod() {
    if (!selectedMethod || !selectedAccount || !isAmountValid) return;
    setIsCalculating(true);
    await new Promise(r => setTimeout(r, 600));
    const num = parseFloat(amount);
    const result = calculateOrder(selectedMethod.calculationMode, num, selectedMethod, selectedAccount.currency);
    setOrderDetails(result);
    setIsCalculating(false);
    setStep(3);
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  useEffect(() => {
    if (selectedMethod?.category === "crypto") {
      const address = selectedMethod.id.includes("btc")
        ? "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
        : selectedMethod.id.includes("eth")
          ? "0xA1B2C3D4E5F6789012345678901234567890ABCD"
          : "0xA1B2C3D4E5F6";
      QRCode.toDataURL(address, { width: 160, margin: 1, color: { dark: "#0f172a", light: "#ffffff" } })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(null));
    } else {
      setQrDataUrl(null);
    }
  }, [selectedMethod]);

  function resetFlow() {
    setStep(1);
    setTargetAccount(recommendedAccount.id);
    setAmount("");
    setSelectedMethodId(null);
    setOrderDetails(null);
    setSubmitted(false);
    setAgreed(false);
    setReceiptFile(null);
  }

  // Button config based on step
  const buttonConfig = useMemo(() => {
    switch (step) {
      case 1:
        return {
          text: "下一步",
          disabled: !selectedAccount || !isAmountValid,
          onClick: () => setStep(2),
        };
      case 2:
        return {
          text: "下一步",
          disabled: !selectedMethod || isCalculating,
          onClick: handleConfirmMethod,
        };
      case 3:
        return {
          text: selectedMethod?.category === "card" || selectedMethod?.category === "ewallet"
            ? "前往支付"
            : "确认存款",
          disabled: !agreed || (selectedMethod?.category === "bank" && !receiptFile),
          onClick: () => {
            if (selectedMethod?.category === "crypto") {
              setShowCryptoConfirm(true);
            } else {
              handleSubmit();
            }
          },
        };
    }
  }, [step, selectedAccount, isAmountValid, selectedMethod, isCalculating, agreed, receiptFile]);

  if (submitted) {
    return <SubmittedSuccess onReset={resetFlow} />;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 rounded-xl bg-emerald-500/10">
            <ArrowDownLeft className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">充值</h1>
            <p className="text-sm text-slate-500">快速安全的充值服务</p>
          </div>
        </div>
      </motion.div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, idx) => {
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                isActive ? "bg-slate-900 text-white" : isDone ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
              )}>
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs",
                  isActive ? "bg-white text-slate-900" : isDone ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                )}>
                  {isDone ? <CheckCircle2 className="w-3 h-3" /> : s.id}
                </span>
                {s.name}
              </div>
              {idx < steps.length - 1 && (
                <ChevronRight className={cn("w-4 h-4", isDone ? "text-emerald-500" : "text-slate-300")} />
              )}
            </div>
          );
        })}
      </div>

      {/* Main content: left form + right order summary */}
      <div className="flex gap-8 items-start">
        {/* Left: main form */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <Step1AccountAmount
                targetAccount={targetAccount}
                onTargetAccountChange={setTargetAccount}
                amount={amount}
                onAmountChange={setAmount}
                accountSymbolStr={accountSymbolStr}
                quickAmounts={quickAmounts}
                limits={limits}
                todayUsed={todayUsed}
                isSuspicious={isSuspicious}
              />
            )}

            {step === 2 && (
              <Step2PaymentMethod
                selectedMethodId={selectedMethodId}
                onSelectMethod={selectMethod}
                selectedAccount={selectedAccount}
                userKyc={userKyc}
              />
            )}

            {step === 3 && selectedAccount && selectedMethod && orderDetails && (
              <Step3Confirm
                selectedAccount={selectedAccount}
                selectedMethod={selectedMethod}
                orderDetails={orderDetails}
                amount={amount}
                copied={copied}
                onCopy={copyText}
                qrDataUrl={qrDataUrl}
                receiptFile={receiptFile}
                onReceiptChange={setReceiptFile}
                showCryptoConfirm={showCryptoConfirm}
                onShowCryptoConfirm={setShowCryptoConfirm}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Right: Order Summary */}
        <OrderSummary
          step={step}
          selectedAccount={selectedAccount}
          amount={amount}
          selectedMethod={selectedMethod}
          orderDetails={orderDetails}
          agreed={agreed}
          onAgreedChange={setAgreed}
          onNext={buttonConfig.onClick}
          onBack={() => setStep((step - 1) as 1 | 2)}
          isCalculating={isCalculating}
          canProceed={!buttonConfig.disabled}
          buttonText={buttonConfig.text}
        />
      </div>

      {/* FAQ - collapsed at bottom */}
      <div className="max-w-6xl mx-auto pt-8 border-t border-slate-200">
        <div className="space-y-0">
          <button
            onClick={() => setExpandedFaq(expandedFaq === -1 ? null : -1)}
            className="w-full flex items-center justify-between py-3 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            <span className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-slate-500" />常见问题</span>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 transition-transform", expandedFaq === -1 && "rotate-180")} />
          </button>
          <AnimatePresence>
            {expandedFaq === -1 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="space-y-0 pb-4">
                  {faqItems.map((item, i) => (
                    <div key={i} className="border-b border-slate-100 last:border-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedFaq(expandedFaq === i ? null : i); }}
                        className="w-full flex items-center justify-between py-3 text-sm text-slate-600 hover:text-slate-900 text-left"
                      >
                        {item.q}
                        <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 transition-transform", expandedFaq === i && "rotate-180")} />
                      </button>
                      {expandedFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pb-3 text-sm text-slate-500 leading-relaxed"
                        >
                          {item.a}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Crypto confirm dialog */}
      {showCryptoConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-slate-900">确认已完成转账？</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              加密货币转账需要您在钱包中手动完成链上支付。请确认您已向上述地址完成转账后再提交。
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowCryptoConfirm(false)} className="h-11 px-5 rounded-xl">
                还未转账，稍后再说
              </Button>
              <Button
                onClick={() => { setShowCryptoConfirm(false); handleSubmit(); }}
                className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              >
                已完成转账，确认提交
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ===================== Submitted Success =====================
function SubmittedSuccess({ onReset }: { onReset: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/portal/fund/history";
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6 min-h-[60vh] flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">提交成功</h2>
        <p className="text-slate-500 mb-2">您的存款订单已提交，系统将尽快处理。</p>
        <p className="text-xs text-slate-400 mb-6">3 秒后自动跳转到交易记录...</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onReset}>再存一笔</Button>
          <Link href="/portal/fund/history">
            <Button className="bg-slate-900 hover:bg-slate-800 text-white">查看记录</Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
