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
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const depositMethods = [
  {
    id: "crypto",
    name: "Cryptocurrency",
    icon: Bitcoin,
    description: "Deposit BTC, ETH, USDT, and more",
    processingTime: "10-30 minutes",
    fee: "Network fee only",
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    icon: CreditCard,
    description: "Visa, Mastercard, JCB",
    processingTime: "Instant",
    fee: "2.5%",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    icon: Landmark,
    description: "SWIFT, SEPA, Local Transfer",
    processingTime: "1-3 business days",
    fee: "Free",
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    icon: Wallet,
    description: "PayPal, Skrill, Neteller",
    processingTime: "Instant",
    fee: "1.5%",
  },
];

const cryptoCurrencies = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", network: "Bitcoin" },
  { id: "eth", name: "Ethereum", symbol: "ETH", network: "ERC20" },
  { id: "usdt", name: "Tether", symbol: "USDT", network: "TRC20" },
  { id: "usdc", name: "USD Coin", symbol: "USDC", network: "ERC20" },
];

const tradingAccounts = [
  { id: "wallet", name: "Main Wallet", balance: 12500.50 },
  { id: "acc-001", name: "Standard Account", balance: 10000.00 },
  { id: "acc-002", name: "Pro Account", balance: 25000.00 },
];

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-green-500/10">
            <ArrowDownLeft className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">Deposit Funds</h1>
            <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">Add funds to your account</p>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {["Select Method", "Enter Details", "Confirm"].map((s, i) => (
          <div key={s} className="flex items-center">
            <div className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              (step === "method" && i === 0) || 
              (step === "details" && i <= 1) || 
              (step === "confirm" && i <= 2)
                ? "bg-[rgb(var(--tp-accent-rgb))] text-white"
                : "bg-[rgba(var(--tp-fg-rgb),0.1)] text-[rgba(var(--tp-fg-rgb),0.5)]"
            )}>
              {i + 1}. {s}
            </div>
            {i < 2 && <ChevronRight className="w-4 h-4 mx-2 text-[rgba(var(--tp-fg-rgb),0.3)]" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Method */}
      <AnimatePresence mode="wait">
        {step === "method" && (
          <motion.div
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {depositMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      className={cn(
                        "p-4 rounded-xl border-2 cursor-pointer transition-all",
                        selectedMethod === method.id
                          ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.05)]"
                          : "border-[rgba(var(--tp-fg-rgb),0.1)] hover:border-[rgba(var(--tp-fg-rgb),0.3)]"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[rgba(var(--tp-accent-rgb),0.1)] flex items-center justify-center flex-shrink-0">
                          <method.icon className="w-6 h-6 text-[rgb(var(--tp-accent-rgb))]" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-[rgb(var(--tp-fg-rgb))]">{method.name}</h3>
                          <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">{method.description}</p>
                          <div className="flex gap-4 mt-2 text-xs">
                            <span className="text-[rgba(var(--tp-fg-rgb),0.5)]">
                              Processing: {method.processingTime}
                            </span>
                            <span className="text-green-500">
                              Fee: {method.fee}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleContinue}
                  disabled={!selectedMethod}
                  className="w-full mt-6 h-12 bg-[rgb(var(--tp-accent-rgb))] hover:bg-[rgba(var(--tp-accent-rgb),0.9)] text-white"
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Enter Deposit Details</CardTitle>
                <CardDescription>Provide the required information for your deposit</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Target Account */}
                <div className="space-y-2">
                  <Label>Deposit To</Label>
                  <Select value={targetAccount} onValueChange={setTargetAccount}>
                    <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {tradingAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name} - ${account.balance.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Crypto Deposit */}
                {selectedMethod === "crypto" && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Select Cryptocurrency</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {cryptoCurrencies.map((crypto) => (
                          <button
                            key={crypto.id}
                            onClick={() => setSelectedCrypto(crypto.id)}
                            className={cn(
                              "p-3 rounded-xl border-2 text-left transition-all",
                              selectedCrypto === crypto.id
                                ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.05)]"
                                : "border-[rgba(var(--tp-fg-rgb),0.1)] hover:border-[rgba(var(--tp-fg-rgb),0.3)]"
                            )}
                          >
                            <p className="font-semibold text-[rgb(var(--tp-fg-rgb))]">{crypto.symbol}</p>
                            <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">{crypto.network}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Deposit Address */}
                    <div className="p-6 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] text-center">
                      <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)] mb-4">
                        Send {cryptoCurrencies.find(c => c.id === selectedCrypto)?.symbol} to this address
                      </p>
                      <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-xl flex items-center justify-center">
                        <QrCode className="w-24 h-24 text-[rgb(var(--tp-fg-rgb))]" />
                      </div>
                      <div className="flex items-center gap-2 max-w-md mx-auto">
                        <code className="flex-1 p-3 rounded-lg bg-[rgb(var(--tp-surface-rgb))] text-sm break-all">
                          0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
                        </code>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")}
                        >
                          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-yellow-500/10 text-yellow-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        Only send {cryptoCurrencies.find(c => c.id === selectedCrypto)?.symbol} on the {cryptoCurrencies.find(c => c.id === selectedCrypto)?.network} network
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Deposit */}
                {selectedMethod === "card" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Amount (USD)</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-[rgb(var(--tp-surface-rgb))]"
                      />
                      <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">
                        Min: $10 | Max: $10,000 per transaction
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)]">
                      <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">
                        You will be redirected to our secure payment processor to complete the transaction.
                      </p>
                    </div>
                  </div>
                )}

                {/* Bank Transfer */}
                {selectedMethod === "bank" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Amount (USD)</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-[rgb(var(--tp-surface-rgb))]"
                      />
                    </div>
                    <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] space-y-3">
                      <h4 className="font-medium text-[rgb(var(--tp-fg-rgb))]">Bank Transfer Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-[rgba(var(--tp-fg-rgb),0.5)]">Bank Name</p>
                          <p className="font-medium">TradePass Bank</p>
                        </div>
                        <div>
                          <p className="text-[rgba(var(--tp-fg-rgb),0.5)]">Account Number</p>
                          <p className="font-medium">1234567890</p>
                        </div>
                        <div>
                          <p className="text-[rgba(var(--tp-fg-rgb),0.5)]">SWIFT Code</p>
                          <p className="font-medium">TRADEPASSXX</p>
                        </div>
                        <div>
                          <p className="text-[rgba(var(--tp-fg-rgb),0.5)]">Reference</p>
                          <p className="font-medium">TP-USER-001</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* E-Wallet */}
                {selectedMethod === "ewallet" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select E-Wallet</Label>
                      <Select>
                        <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
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
                      <Label>Amount (USD)</Label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-[rgb(var(--tp-surface-rgb))]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1 h-12">
                    Back
                  </Button>
                  <Button 
                    onClick={handleContinue}
                    disabled={selectedMethod !== "crypto" && !amount}
                    className="flex-1 h-12 bg-[rgb(var(--tp-accent-rgb))] hover:bg-[rgba(var(--tp-accent-rgb),0.9)] text-white"
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
                <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">Method</span>
                    <span className="font-medium">
                      {depositMethods.find(m => m.id === selectedMethod)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">Amount</span>
                    <span className="font-medium">${amount || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">Fee</span>
                    <span className="font-medium text-green-500">
                      {depositMethods.find(m => m.id === selectedMethod)?.fee}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">Deposit To</span>
                    <span className="font-medium">
                      {tradingAccounts.find(a => a.id === targetAccount)?.name}
                    </span>
                  </div>
                  <div className="border-t border-[rgba(var(--tp-fg-rgb),0.1)] pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-lg">${amount || "0.00"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1 h-12">
                    Back
                  </Button>
                  <Button 
                    className="flex-1 h-12 bg-[rgb(var(--tp-accent-rgb))] hover:bg-[rgba(var(--tp-accent-rgb),0.9)] text-white"
                  >
                    Confirm Deposit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
