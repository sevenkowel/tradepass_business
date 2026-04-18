"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownLeft, Wallet, CreditCard, Landmark, HelpCircle, ArrowUpRight,
  Clock, ChevronDown, ChevronUp, MessageCircle, Lock, AlertTriangle,
  Star, ChevronRight, CheckCircle2, Loader2, ArrowLeft, Copy,
} from "lucide-react";
import QRCode from "qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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
  { id: "usdt-erc20", name: "USDT-ERC20", category: "crypto", feeType: "percentage", feeValue: 0, calculationMode: "deposit_first", paymentCurrency: "USDT", supportedCurrencies: ["USD","EUR","JPY"], exchangeRate: 1.0, kycRequired: 0, estimatedTime: "即时到账" },
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
  { id: "crypto", name: "加密货币", icon: "💎" },
  { id: "card", name: "银行卡", icon: "💳" },
  { id: "bank", name: "银行转账", icon: "🏦" },
  { id: "ewallet", name: "电子钱包", icon: "📱" },
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

const steps = [
  { id: 1, name: "账户与金额" },
  { id: 2, name: "支付方式" },
  { id: 3, name: "确认订单" },
];

// ===================== Main Page =====================
export default function DepositPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [targetAccount, setTargetAccount] = useState<string>(recommendedAccount.id);
  const [amount, setAmount] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("crypto");
  const [submitted, setSubmitted] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [orderDetails, setOrderDetails] = useState<CalculationResult | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCryptoConfirm, setShowCryptoConfirm] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

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
    const cat = paymentMethods.find(m => m.id === id)?.category;
    if (cat) setExpandedCategory(cat);
  }

  async function handleConfirmMethod() {
    if (!selectedMethod || !selectedAccount || !isAmountValid) return;
    setIsCalculating(true);
    // mock API calculation delay
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

  function getNetworkLabel(methodId: string) {
    if (methodId.includes("trc20")) return "TRC20";
    if (methodId.includes("erc20")) return "ERC20";
    if (methodId === "btc") return "BTC";
    if (methodId === "eth") return "ETH";
    return methodId.toUpperCase();
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
    setExpandedCategory("crypto");
    setOrderDetails(null);
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <SubmittedSuccess onReset={resetFlow} />
    );
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left content */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {/* ===== Step 1: Account + Amount ===== */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <Card>
                  <CardContent className="p-6 space-y-5">
                    <h2 className="text-lg font-semibold text-slate-900">选择存入账户</h2>
                    <Select value={targetAccount} onValueChange={(v) => { setTargetAccount(v); }}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="选择账户" /></SelectTrigger>
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
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 space-y-5">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-slate-600" />
                      输入存款金额
                    </h2>

                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map(preset => (
                        <button key={preset} onClick={() => setAmount(preset)}
                          className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors">
                          {accountSymbolStr}{parseInt(preset).toLocaleString()}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-3xl font-bold text-slate-500">
                        {accountSymbolStr}
                      </span>
                      <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)}
                        className="pl-14 h-16 text-3xl font-bold font-variant-numeric tabular-nums" />
                    </div>

                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <span>单笔限额: {accountSymbolStr}{limits.min.toLocaleString()} - {accountSymbolStr}{limits.max.toLocaleString()}</span>
                      <span>每日剩余: {accountSymbolStr}{(limits.daily - todayUsed).toLocaleString()}</span>
                    </div>

                    {isSuspicious && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">小额充值频繁</p>
                          <p className="text-xs text-amber-600 mt-0.5">检测到连续小额充值，请确认是否本人操作</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!selectedAccount || !isAmountValid}
                    className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl"
                  >
                    下一步 <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ===== Step 2: Payment Method ===== */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-slate-600" />选择支付方式
                    </h2>

                    <div className="space-y-2">
                      {paymentCategories.map(cat => {
                        const catMethods = paymentMethods.filter(m => m.category === cat.id);
                        const isExpanded = expandedCategory === cat.id;
                        const hasLocked = catMethods.some(m => m.kycRequired > userKyc);
                        const recommended = catMethods.find(m => m.kycRequired <= userKyc && m.feeValue === 0);
                        return (
                          <div key={cat.id} className="border border-slate-200 rounded-xl overflow-hidden">
                            <button onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                              className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{cat.icon}</span>
                                <span className="font-medium text-slate-900">{cat.name}</span>
                                {recommended && <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">推荐</span>}
                              </div>
                              <div className="flex items-center gap-2">
                                {hasLocked && <Lock className="w-4 h-4 text-slate-400" />}
                                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                              </div>
                            </button>
                            {isExpanded && (
                              <div className="divide-y divide-slate-100">
                                {catMethods.map(item => {
                                  const isLocked = item.kycRequired > userKyc;
                                  const isSelected = selectedMethodId === item.id;
                                  const unsupported = selectedAccount ? !item.supportedCurrencies.includes(selectedAccount.currency) : false;
                                  const disabled = isLocked || unsupported;
                                  return (
                                    <button key={item.id} disabled={disabled} onClick={() => !disabled && selectMethod(item.id)}
                                      className={cn("w-full px-4 py-3 flex items-center justify-between transition-colors text-left",
                                        isSelected ? "bg-slate-900 text-white" : disabled ? "bg-slate-50 cursor-not-allowed" : "hover:bg-slate-50")}>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={isSelected ? "text-white" : disabled ? "text-slate-400" : "text-slate-700"}>{item.name}</span>
                                        {item.desc && <span className={cn("text-xs px-1.5 py-0.5 rounded", isSelected ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-700")}>{item.desc}</span>}
                                        {isLocked && <span className="text-xs px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded">需 L{item.kycRequired}</span>}
                                        {unsupported && <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">不支持 {selectedAccount?.currency}</span>}
                                      </div>
                                      <span className={cn("text-sm shrink-0", isSelected ? "text-white/70" : disabled ? "text-slate-400" : "text-slate-500")}>
                                        {item.feeValue === 0 ? "免费" : `${item.feeType === "percentage" ? `${item.feeValue}%` : `$${item.feeValue}`}`}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {selectedMethod && (
                      <div className="p-4 bg-slate-50 rounded-xl text-sm text-slate-600 space-y-1">
                        <div className="flex justify-between"><span className="text-slate-500">费率</span><span className="font-medium text-slate-900">{selectedMethod.feeValue === 0 ? "免费" : `${selectedMethod.feeType === "percentage" ? `${selectedMethod.feeValue}%` : `$${selectedMethod.feeValue} 固定`}`}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">预计到账时间</span><span className="font-medium text-slate-900">{selectedMethod.estimatedTime}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">支持币种</span><span className="font-medium text-slate-900">{selectedMethod.supportedCurrencies.join(", ")}</span></div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => setStep(1)} className="h-12 px-6 rounded-xl">
                    <ArrowLeft className="w-4 h-4 mr-2" /> 上一步
                  </Button>
                  <Button
                    onClick={handleConfirmMethod}
                    disabled={!selectedMethod || isCalculating}
                    className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl"
                  >
                    {isCalculating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 计算中...</> : <><CheckCircle2 className="w-4 h-4 mr-2" /> 确认选择</>}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ===== Step 3: Confirm Order ===== */}
            {step === 3 && selectedAccount && selectedMethod && orderDetails && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <Card className="border-slate-900/10 shadow-sm">
                  <CardContent className="p-6 space-y-5">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-slate-600" />确认存款订单
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-slate-500">存入账户</p>
                          <button onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline">修改</button>
                        </div>
                        <p className="text-sm font-medium text-slate-900">{formatAccountLabel(selectedAccount)}</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs text-slate-500">支付方式</p>
                          <button onClick={() => setStep(2)} className="text-xs text-blue-600 hover:underline">修改</button>
                        </div>
                        <p className="text-sm font-medium text-slate-900">{selectedMethod.name} ({selectedMethod.paymentCurrency})</p>
                        <p className="text-xs text-slate-400 mt-0.5">{selectedMethod.estimatedTime}</p>
                      </div>
                    </div>

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
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">手续费</span>
                        <span className="font-medium text-emerald-600">
                          {orderDetails.fee === 0 ? "免费" : `${currencySymbol(selectedMethod.paymentCurrency)}${orderDetails.fee.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
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
                                : "0xA1B2C3D4E5F6"}
                            </p>
                            <button
                              onClick={() =>
                                copyText(
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
                              <button onClick={() => copyText("8823-1100-4455-9921")} className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
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
                              <button onClick={() => copyText("SCBLUS33")} className="p-1.5 hover:bg-slate-100 rounded text-slate-500">
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
                              onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
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

                    <div className="flex items-center justify-between pt-2">
                      <Button variant="outline" onClick={() => setStep(2)} className="h-12 px-6 rounded-xl">
                        <ArrowLeft className="w-4 h-4 mr-2" /> 上一步
                      </Button>
                      <Button
                        onClick={() => {
                          if (selectedMethod.category === "crypto") {
                            setShowCryptoConfirm(true);
                          } else {
                            handleSubmit();
                          }
                        }}
                        disabled={selectedMethod.category === "bank" && !receiptFile}
                        className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl disabled:bg-slate-300 disabled:text-slate-500"
                      >
                        {selectedMethod.category === "card" || selectedMethod.category === "ewallet"
                          ? <>前往支付 <ArrowUpRight className="w-4 h-4 ml-2" /></>
                          : <>确认存款 <ChevronRight className="w-4 h-4 ml-2" /></>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><Wallet className="w-5 h-5" /><h3 className="font-bold text-white/90 text-sm">钱包余额</h3></div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/70"><HelpCircle className="w-4 h-4" /></button>
                    <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/70"><ArrowUpRight className="w-4 h-4" /></button>
                  </div>
                </div>
                <p className="text-3xl font-bold">$12,500.00</p>
                <p className="text-xs text-white/60 mt-1">可用余额</p>
                <button className="mt-3 text-xs text-white/80 hover:text-white flex items-center gap-1">
                  转账至交易账户 <ChevronRight className="w-3 h-3" />
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-blue-600" /><h3 className="font-bold text-slate-900 text-sm">今日额度</h3></div>
                  <div className="flex items-center gap-1">
                    <button className="text-xs text-blue-600 hover:underline">提升</button>
                    <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><HelpCircle className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(todayUsed / limits.daily) * 100}%` }} />
                </div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">已用</span><span className="font-medium">${todayUsed.toLocaleString()}</span></div>
                <div className="flex justify-between text-xs text-slate-400"><span>限额 ${limits.daily.toLocaleString()}</span><span>剩余 ${limits.daily - todayUsed}</span></div>
                <p className="text-xs text-slate-500">💡 提升 KYC 等级可获得更高额度</p>
                <Button variant="outline" size="sm" className="w-full h-8 text-xs">申请提升 →</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3"><MessageCircle className="w-5 h-5 text-slate-600" /><h3 className="font-bold text-slate-900 text-sm">常见问题</h3></div>
                <div className="space-y-0">
                  {faqItems.map((item, i) => (
                    <div key={i} className="border-b border-slate-100 last:border-0">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                        className="w-full flex items-center justify-between py-3 text-sm text-slate-700 hover:text-slate-900 text-left"
                      >
                        {item.q}
                        <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 transition-transform", expandedFaq === i && "rotate-180")} />
                      </button>
                      {expandedFaq === i && (
                        <div className="pb-3 text-sm text-slate-500 leading-relaxed">
                          {item.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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
