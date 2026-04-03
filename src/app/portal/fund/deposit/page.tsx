"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownLeft,
  Bitcoin,
  CreditCard,
  Landmark,
  Wallet,
  QrCode,
  Copy,
  Check,
  ChevronRight,
  AlertCircle,
  ShieldCheck,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const depositMethods = [
  {
    id: "crypto",
    name: "Cryptocurrency",
    icon: Bitcoin,
    description: "Deposit BTC, ETH, USDT, and more",
    processingTime: "10-30 minutes",
    fee: "Network fee only",
    color: "orange",
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    description: "Visa, Mastercard, JCB",
    processingTime: "Instant",
    fee: "2.5%",
    color: "blue",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    icon: Landmark,
    description: "SWIFT, SEPA, Local Transfer",
    processingTime: "1-3 business days",
    fee: "Free",
    color: "emerald",
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    icon: Wallet,
    description: "PayPal, Skrill, Neteller",
    processingTime: "Instant",
    fee: "1.5%",
    color: "purple",
  },
];

const cryptoCurrencies = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", network: "Bitcoin", address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh" },
  { id: "eth", name: "Ethereum", symbol: "ETH", network: "ERC20", address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" },
  { id: "usdt", name: "Tether", symbol: "USDT", network: "TRC20", address: "TNXoiG6hKZjN6TWnUcXxvPPgBBDu4RqDv7" },
  { id: "usdc", name: "USD Coin", symbol: "USDC", network: "ERC20", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" },
];

const tradingAccounts = [
  { id: "wallet", name: "Main Wallet", balance: 12500.50 },
  { id: "acc-001", name: "Standard Account", balance: 10000.00 },
  { id: "acc-002", name: "Pro Account", balance: 25000.00 },
];

const recentDeposits = [
  { amount: "+$5,000", method: "USDT TRC20", time: "2h ago", status: "confirmed" },
  { amount: "+$3,000", method: "Bank Wire", time: "1d ago", status: "pending" },
  { amount: "+$1,500", method: "Credit Card", time: "3d ago", status: "confirmed" },
];

const colorMap: Record<string, { bg: string; text: string; border: string; iconBg: string }> = {
  orange: { bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200", iconBg: "bg-orange-100" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", iconBg: "bg-blue-100" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", iconBg: "bg-emerald-100" },
  purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200", iconBg: "bg-purple-100" },
};

export default function DepositPage() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedCrypto, setSelectedCrypto] = useState("btc");
  const [amount, setAmount] = useState("");
  const [targetAccount, setTargetAccount] = useState("wallet");
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<"method" | "details" | "confirm">("method");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    if (step === "method") setStep("details");
    else if (step === "details") setStep("confirm");
  };

  const handleBack = () => {
    if (step === "details") setStep("method");
    else if (step === "confirm") setStep("details");
  };

  const currentCrypto = cryptoCurrencies.find((c) => c.id === selectedCrypto)!;
  const currentMethod = depositMethods.find((m) => m.id === selectedMethod);
  const currentAccount = tradingAccounts.find((a) => a.id === targetAccount)!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 rounded-xl bg-tp-accent-subtle">
            <ArrowDownLeft className="w-6 h-6 text-[rgb(var(--tp-accent-rgb))]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">Deposit Funds</h1>
            <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.5)]">Add funds to your trading account</p>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-2"
      >
        {["Select Method", "Enter Details", "Confirm"].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-colors",
                (step === "method" && i === 0) ||
                  (step === "details" && i <= 1) ||
                  (step === "confirm" && i <= 2)
                  ? "bg-tp-accent-subtle border-tp-accent text-[rgb(var(--tp-accent-rgb))]"
                  : "bg-[var(--tp-surface)] border-[rgba(var(--tp-fg-rgb),0.08)] text-[rgba(var(--tp-fg-rgb),0.4)]"
              )}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  (step === "method" && i === 0) ||
                    (step === "details" && i <= 1) ||
                    (step === "confirm" && i <= 2)
                    ? "bg-tp-accent text-white"
                    : "bg-[rgba(var(--tp-fg-rgb),0.1)] text-[rgba(var(--tp-fg-rgb),0.4)]"
                )}
              >
                {i + 1}
              </div>
              <span className="hidden sm:inline">{s}</span>
            </div>
            {i < 2 && <ChevronRight className="w-4 h-4 mx-1 text-[rgba(var(--tp-fg-rgb),0.2)]" />}
          </div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left: Form Area (3/4) */}
        <div className="xl:col-span-3">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Method */}
            {step === "method" && (
              <motion.div
                key="method"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Select Deposit Method</CardTitle>
                    <CardDescription>Choose how you want to deposit funds</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {depositMethods.map((method) => {
                        const colors = colorMap[method.color];
                        return (
                          <motion.div
                            key={method.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedMethod(method.id)}
                            className={cn(
                              "relative p-5 rounded-2xl border-2 cursor-pointer transition-all",
                              selectedMethod === method.id
                                ? cn(colors.bg, colors.border, "shadow-sm")
                                : "border-[rgba(var(--tp-fg-rgb),0.08)] hover:border-[rgba(var(--tp-fg-rgb),0.15)] hover:bg-[rgba(var(--tp-fg-rgb),0.02)]"
                            )}
                          >
                            {selectedMethod === method.id && (
                              <div className="absolute top-3 right-3">
                                <div className="w-5 h-5 rounded-full bg-tp-accent flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              </div>
                            )}
                            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-3", colors.iconBg)}>
                              <method.icon className={cn("w-6 h-6", colors.text)} />
                            </div>
                            <h3 className="font-bold text-[rgb(var(--tp-fg-rgb))] text-sm">{method.name}</h3>
                            <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)] mt-1">{method.description}</p>
                            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[rgba(var(--tp-fg-rgb),0.06)]">
                              <span className="text-[10px] text-[rgba(var(--tp-fg-rgb),0.4)] flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {method.processingTime}
                              </span>
                              <span className="text-[10px] font-semibold text-emerald-600">
                                {method.fee}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    <Button
                      onClick={handleContinue}
                      disabled={!selectedMethod}
                      className="w-full mt-6 h-12 bg-tp-accent hover:bg-tp-accent-hover text-white font-medium rounded-xl"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Enter Details */}
            {step === "details" && selectedMethod && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {currentMethod?.name === "Cryptocurrency" ? "Crypto Deposit" : `Deposit via ${currentMethod?.name}`}
                    </CardTitle>
                    <CardDescription>
                      {currentMethod?.id === "crypto"
                        ? `Send ${currentCrypto.symbol} to the address below`
                        : "Provide the required information for your deposit"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Target Account */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Deposit To</Label>
                      <Select value={targetAccount} onValueChange={setTargetAccount}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          {tradingAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              <span className="font-medium">{account.name}</span>
                              <span className="ml-2 text-[rgba(var(--tp-fg-rgb),0.4)]">
                                ${account.balance.toLocaleString()}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Crypto Deposit */}
                    {selectedMethod === "crypto" && (
                      <div className="space-y-5">
                        {/* Crypto Selection */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Select Cryptocurrency</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {cryptoCurrencies.map((crypto) => {
                              const selected = selectedCrypto === crypto.id;
                              return (
                                <motion.button
                                  key={crypto.id}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => setSelectedCrypto(crypto.id)}
                                  className={cn(
                                    "p-3 rounded-xl border-2 text-left transition-all",
                                    selected
                                      ? "bg-tp-accent-subtle border-tp-accent"
                                      : "border-[rgba(var(--tp-fg-rgb),0.08)] hover:border-[rgba(var(--tp-fg-rgb),0.15)]"
                                  )}
                                >
                                  <p className="font-bold text-[rgb(var(--tp-fg-rgb))]">{crypto.symbol}</p>
                                  <p className="text-[10px] text-[rgba(var(--tp-fg-rgb),0.4)]">{crypto.network}</p>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>

                        {/* QR Code + Address */}
                        <div className="rounded-2xl border-2 border-dashed border-[rgba(var(--tp-fg-rgb),0.12)] p-6 text-center bg-[rgba(var(--tp-fg-rgb),0.02)]">
                          <div className="w-36 h-36 mx-auto mb-4 bg-[var(--tp-surface)] rounded-2xl flex items-center justify-center border border-[rgba(var(--tp-fg-rgb),0.08)]">
                            <QrCode className="w-24 h-24 text-[rgba(var(--tp-fg-rgb),0.3)]" />
                          </div>
                          <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.4)] mb-3">
                            Send only <span className="font-semibold text-[rgb(var(--tp-fg-rgb))]">{currentCrypto.symbol}</span> on the{" "}
                            <span className="font-semibold text-[rgb(var(--tp-fg-rgb))]">{currentCrypto.network}</span> network
                          </p>
                          <div className="flex items-center gap-2 max-w-lg mx-auto">
                            <code className="flex-1 p-3 rounded-xl bg-[var(--tp-surface)] text-xs break-all text-[rgba(var(--tp-fg-rgb),0.7)] border border-[rgba(var(--tp-fg-rgb),0.08)]">
                              {currentCrypto.address}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(currentCrypto.address)}
                              className="shrink-0 h-10 px-3"
                            >
                              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                              <span className="ml-1.5 text-xs">{copied ? "Copied" : "Copy"}</span>
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            Sending other assets to this address may result in permanent loss.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Card Deposit */}
                    {selectedMethod === "card" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Amount (USD)</Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(var(--tp-fg-rgb),0.4)] font-semibold text-lg">$</span>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="pl-10 h-12 text-lg font-semibold"
                            />
                          </div>
                          <div className="flex gap-2">
                            {["$100", "$500", "$1,000", "$5,000"].map((preset) => (
                              <button
                                key={preset}
                                onClick={() => setAmount(preset.replace("$", "").replace(",", ""))}
                                className="px-3 py-1.5 rounded-lg border border-[rgba(var(--tp-fg-rgb),0.1)] text-xs font-medium text-[rgba(var(--tp-fg-rgb),0.6)] hover:border-tp-accent hover:text-[rgb(var(--tp-accent-rgb))] transition-colors"
                              >
                                {preset}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.4)]">Min: $10 | Max: $10,000 per transaction</p>
                        </div>
                        <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.03)] border border-[rgba(var(--tp-fg-rgb),0.06)]">
                          <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.5)]">
                            You will be redirected to our secure payment processor to complete the transaction.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Bank Transfer */}
                    {selectedMethod === "bank" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Amount (USD)</Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(var(--tp-fg-rgb),0.4)] font-semibold text-lg">$</span>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="pl-10 h-12 text-lg font-semibold"
                            />
                          </div>
                        </div>
                        <div className="p-5 rounded-2xl bg-[rgba(var(--tp-fg-rgb),0.03)] border border-[rgba(var(--tp-fg-rgb),0.06)] space-y-4">
                          <h4 className="font-semibold text-[rgb(var(--tp-fg-rgb))] text-sm">Bank Transfer Details</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {[
                              { label: "Bank Name", value: "TradePass Bank" },
                              { label: "Account Number", value: "1234567890" },
                              { label: "SWIFT Code", value: "TRADEPASSXX" },
                              { label: "Reference", value: "TP-USER-001" },
                            ].map((item) => (
                              <div key={item.label} className="p-3 rounded-xl bg-[var(--tp-surface)] border border-[rgba(var(--tp-fg-rgb),0.06)]">
                                <p className="text-[10px] text-[rgba(var(--tp-fg-rgb),0.4)] uppercase font-medium">{item.label}</p>
                                <p className="text-sm font-semibold text-[rgb(var(--tp-fg-rgb))] mt-0.5">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* E-Wallet */}
                    {selectedMethod === "ewallet" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Select E-Wallet</Label>
                          <Select>
                            <SelectTrigger className="h-11">
                              <SelectValue placeholder="Select e-wallet" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paypal">PayPal</SelectItem>
                              <SelectItem value="skrill">Skrill</SelectItem>
                              <SelectItem value="neteller">Neteller</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Amount (USD)</Label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(var(--tp-fg-rgb),0.4)] font-semibold text-lg">$</span>
                            <Input
                              type="number"
                              placeholder="Enter amount"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="pl-10 h-12 text-lg font-semibold"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl">
                        Back
                      </Button>
                      <Button
                        onClick={handleContinue}
                        disabled={selectedMethod !== "crypto" && !amount}
                        className="flex-1 h-12 bg-tp-accent hover:bg-tp-accent-hover text-white font-medium rounded-xl"
                      >
                        Continue
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Confirm Deposit</CardTitle>
                    <CardDescription>Review your deposit details before confirming</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-5 rounded-2xl bg-[rgba(var(--tp-fg-rgb),0.03)] border border-[rgba(var(--tp-fg-rgb),0.06)] space-y-4">
                      {[
                        { label: "Method", value: currentMethod?.name },
                        { label: "Amount", value: `$${amount || "0.00"}` },
                        { label: "Fee", value: currentMethod?.fee, highlight: true },
                        { label: "Deposit To", value: currentAccount?.name },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between items-center">
                          <span className="text-sm text-[rgba(var(--tp-fg-rgb),0.5)]">{item.label}</span>
                          <span className={cn("font-semibold", item.highlight && "text-emerald-600")}>{item.value}</span>
                        </div>
                      ))}
                      <div className="border-t border-[rgba(var(--tp-fg-rgb),0.08)] pt-4">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-[rgb(var(--tp-fg-rgb))]">Total</span>
                          <span className="font-bold text-xl text-[rgb(var(--tp-fg-rgb))]">${amount || "0.00"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl">
                        Back
                      </Button>
                      <Button className="flex-1 h-12 bg-tp-accent hover:bg-tp-accent-hover text-white font-medium rounded-xl">
                        Confirm Deposit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Info Panel (1/4) */}
        <div className="space-y-5">
          {/* Balance Card */}
          <Card className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-tp-accent-subtle flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-[rgb(var(--tp-accent-rgb))]" />
                </div>
                <h3 className="font-bold text-[rgb(var(--tp-fg-rgb))] text-sm">Wallet Balance</h3>
              </div>
              <p className="text-3xl font-bold text-[rgb(var(--tp-fg-rgb))]">$12,450.00</p>
              <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.4)] mt-1">Available for trading</p>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-bold text-[rgb(var(--tp-fg-rgb))] text-sm">Security</h3>
              </div>
              <ul className="space-y-2.5">
                {["Cold wallet storage", "Multi-signature required", "24/7 monitoring", "SSL encryption"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recent Deposits */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-[rgb(var(--tp-fg-rgb))] text-sm">Recent Deposits</h3>
              </div>
              <div className="space-y-3">
                {recentDeposits.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className={cn("text-sm font-bold", d.status === "confirmed" ? "text-emerald-600" : "text-amber-600")}>{d.amount}</p>
                      <p className="text-[10px] text-[rgba(var(--tp-fg-rgb),0.4)]">{d.method}</p>
                    </div>
                    <span className="text-[10px] text-[rgba(var(--tp-fg-rgb),0.3)]">{d.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
