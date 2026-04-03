"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowUpRight, 
  Bitcoin, 
  CreditCard, 
  Landmark, 
  Wallet,
  ChevronRight,
  AlertCircle,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const withdrawMethods = [
  {
    id: "crypto",
    name: "Cryptocurrency",
    icon: Bitcoin,
    description: "Withdraw BTC, ETH, USDT, and more",
    processingTime: "10-30 minutes",
    fee: "Network fee only",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    icon: Landmark,
    description: "SWIFT, SEPA, Local Transfer",
    processingTime: "1-3 business days",
    fee: "$25 / €15",
  },
  {
    id: "ewallet",
    name: "E-Wallet",
    icon: Wallet,
    description: "PayPal, Skrill, Neteller",
    processingTime: "24 hours",
    fee: "1.5%",
  },
];

const tradingAccounts = [
  { id: "wallet", name: "Main Wallet", balance: 12500.50 },
  { id: "acc-001", name: "Standard Account", balance: 10000.00 },
  { id: "acc-002", name: "Pro Account", balance: 25000.00 },
];

const savedAccounts = [
  { id: "bank-1", type: "bank", name: "Chase Bank ****4521", currency: "USD" },
  { id: "crypto-1", type: "crypto", name: "BTC Wallet", address: "bc1q...xyz" },
];

export default function WithdrawPage() {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [sourceAccount, setSourceAccount] = useState("wallet");
  const [amount, setAmount] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [step, setStep] = useState<"method" | "details" | "confirm">("method");
  const [show2FA, setShow2FA] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleContinue = () => {
    if (step === "method") setStep("details");
    else if (step === "details") setStep("confirm");
  };

  const handleBack = () => {
    if (step === "details") setStep("method");
    else if (step === "confirm") setStep("details");
  };

  const handleWithdraw = () => {
    setShow2FA(true);
  };

  const handleVerify2FA = () => {
    // Process withdrawal
    setShow2FA(false);
  };

  const selectedSource = tradingAccounts.find(a => a.id === sourceAccount);
  const maxWithdraw = selectedSource?.balance || 0;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-red-500/10">
            <ArrowUpRight className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">Withdraw Funds</h1>
            <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">Withdraw funds to your bank or wallet</p>
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

      <AnimatePresence mode="wait">
        {step === "method" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Select Withdrawal Method</CardTitle>
                <CardDescription>Choose how you want to receive your funds</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {withdrawMethods.map((method) => (
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
                      <div className="w-12 h-12 rounded-xl bg-[rgba(var(--tp-accent-rgb),0.1)] flex items-center justify-center mb-3">
                        <method.icon className="w-6 h-6 text-[rgb(var(--tp-accent-rgb))]" />
                      </div>
                      <h3 className="font-semibold text-[rgb(var(--tp-fg-rgb))]">{method.name}</h3>
                      <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">{method.description}</p>
                      <div className="mt-2 text-xs">
                        <span className="text-[rgba(var(--tp-fg-rgb),0.5)]">{method.processingTime}</span>
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

        {step === "details" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Details</CardTitle>
                <CardDescription>Enter the amount and select destination</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Source Account */}
                <div className="space-y-2">
                  <Label>Withdraw From</Label>
                  <Select value={sourceAccount} onValueChange={setSourceAccount}>
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

                {/* Amount */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Amount (USD)</Label>
                    <button 
                      onClick={() => setAmount(maxWithdraw.toString())}
                      className="text-xs text-[rgb(var(--tp-accent-rgb))] hover:underline"
                    >
                      Max: ${maxWithdraw.toLocaleString()}
                    </button>
                  </div>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-[rgb(var(--tp-surface-rgb))]"
                  />
                  <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">
                    Min: $10 | Processing fee applies
                  </p>
                </div>

                {/* Destination Account */}
                <div className="space-y-2">
                  <Label>Destination Account</Label>
                  <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                    <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
                      <SelectValue placeholder="Select saved account" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                      <SelectItem value="new">+ Add New Account</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedAccount === "new" && (
                  <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] space-y-4">
                    <h4 className="font-medium">New Account Details</h4>
                    {selectedMethod === "crypto" && (
                      <div className="space-y-2">
                        <Label>Wallet Address</Label>
                        <Input 
                          placeholder="Enter wallet address"
                          className="bg-[rgb(var(--tp-surface-rgb))]"
                        />
                        <Select>
                          <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="btc">Bitcoin</SelectItem>
                            <SelectItem value="erc20">ERC20</SelectItem>
                            <SelectItem value="trc20">TRC20</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {selectedMethod === "bank" && (
                      <div className="space-y-2">
                        <Label>Account Holder Name</Label>
                        <Input className="bg-[rgb(var(--tp-surface-rgb))]" />
                        <Label>Bank Name</Label>
                        <Input className="bg-[rgb(var(--tp-surface-rgb))]" />
                        <Label>Account Number</Label>
                        <Input className="bg-[rgb(var(--tp-surface-rgb))]" />
                        <Label>SWIFT/BIC Code</Label>
                        <Input className="bg-[rgb(var(--tp-surface-rgb))]" />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 text-yellow-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Withdrawals are processed after security review. Large withdrawals may require additional verification.
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1 h-12">
                    Back
                  </Button>
                  <Button 
                    onClick={handleContinue}
                    disabled={!amount || !selectedAccount}
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

        {step === "confirm" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Confirm Withdrawal</CardTitle>
                <CardDescription>Review your withdrawal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">Method</span>
                    <span className="font-medium">
                      {withdrawMethods.find(m => m.id === selectedMethod)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">From</span>
                    <span className="font-medium">{selectedSource?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">Amount</span>
                    <span className="font-medium">${amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">Fee</span>
                    <span className="font-medium text-red-500">
                      {withdrawMethods.find(m => m.id === selectedMethod)?.fee}
                    </span>
                  </div>
                  <div className="border-t border-[rgba(var(--tp-fg-rgb),0.1)] pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-medium">You Receive</span>
                      <span className="font-bold text-lg">${amount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1 h-12">
                    Back
                  </Button>
                  <Button 
                    onClick={handleWithdraw}
                    className="flex-1 h-12 bg-[rgb(var(--tp-accent-rgb))] hover:bg-[rgba(var(--tp-accent-rgb),0.9)] text-white"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Confirm Withdrawal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2FA Modal */}
      {show2FA && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[rgb(var(--tp-bg-rgb))] p-6 rounded-2xl max-w-md w-full mx-4"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-[rgba(var(--tp-accent-rgb),0.1)] flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-[rgb(var(--tp-accent-rgb))]" />
              </div>
              <h3 className="text-xl font-bold text-[rgb(var(--tp-fg-rgb))]">Security Verification</h3>
              <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="text-center text-2xl tracking-widest bg-[rgb(var(--tp-surface-rgb))]"
              />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShow2FA(false)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleVerify2FA}
                  disabled={otpCode.length !== 6}
                  className="flex-1 bg-[rgb(var(--tp-accent-rgb))] hover:bg-[rgba(var(--tp-accent-rgb),0.9)] text-white"
                >
                  Verify
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
