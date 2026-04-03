"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeftRight, 
  Wallet,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const accounts = [
  { id: "wallet", name: "Main Wallet", type: "wallet", balance: 12500.50, currency: "USD" },
  { id: "acc-001", name: "Standard Account", type: "trading", balance: 10000.00, currency: "USD" },
  { id: "acc-002", name: "Pro Account", type: "trading", balance: 25000.00, currency: "USD" },
];

export default function TransferPage() {
  const [fromAccount, setFromAccount] = useState("");
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fromAcc = accounts.find(a => a.id === fromAccount);
  const toAcc = accounts.find(a => a.id === toAccount);

  const handleTransfer = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const handleReset = () => {
    setFromAccount("");
    setToAccount("");
    setAmount("");
    setIsSuccess(false);
  };

  if (isSuccess) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))] mb-2">
            Transfer Successful!
          </h2>
          <p className="text-[rgba(var(--tp-fg-rgb),0.6)] mb-6">
            ${amount} has been transferred from {fromAcc?.name} to {toAcc?.name}
          </p>
          <Button onClick={handleReset} className="bg-[rgb(var(--tp-accent-rgb))] hover:bg-[rgba(var(--tp-accent-rgb),0.9)] text-white">
            Make Another Transfer
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <ArrowLeftRight className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">Transfer Funds</h1>
            <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">Transfer between your wallets and trading accounts</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
              <CardDescription>Select accounts and enter amount</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From Account */}
              <div className="space-y-2">
                <Label>From</Label>
                <Select value={fromAccount} onValueChange={setFromAccount}>
                  <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center gap-2">
                          {account.type === "wallet" ? (
                            <Wallet className="w-4 h-4" />
                          ) : (
                            <TrendingUp className="w-4 h-4" />
                          )}
                          {account.name} - ${account.balance.toLocaleString()}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-[rgba(var(--tp-fg-rgb),0.1)] flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-[rgba(var(--tp-fg-rgb),0.5)]" />
                </div>
              </div>

              {/* To Account */}
              <div className="space-y-2">
                <Label>To</Label>
                <Select value={toAccount} onValueChange={setToAccount}>
                  <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter(a => a.id !== fromAccount)
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            {account.type === "wallet" ? (
                              <Wallet className="w-4 h-4" />
                            ) : (
                              <TrendingUp className="w-4 h-4" />
                            )}
                            {account.name} - ${account.balance.toLocaleString()}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Amount (USD)</Label>
                  {fromAcc && (
                    <button 
                      onClick={() => setAmount(fromAcc.balance.toString())}
                      className="text-xs text-[rgb(var(--tp-accent-rgb))] hover:underline"
                    >
                      Max: ${fromAcc.balance.toLocaleString()}
                    </button>
                  )}
                </div>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
              </div>

              {/* Summary */}
              {fromAcc && toAcc && amount && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] space-y-2"
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">From</span>
                    <span>{fromAcc.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">To</span>
                    <span>{toAcc.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">Amount</span>
                    <span className="font-semibold">${amount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">Fee</span>
                    <span className="text-green-500">Free</span>
                  </div>
                </motion.div>
              )}

              <Button
                onClick={handleTransfer}
                disabled={!fromAccount || !toAccount || !amount || isSubmitting}
                className="w-full h-12 bg-[rgb(var(--tp-accent-rgb))] hover:bg-[rgba(var(--tp-accent-rgb),0.9)] text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Transfer Now"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transfer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <p className="text-sm font-medium text-green-600 mb-1">Instant Transfers</p>
                <p className="text-xs text-green-600/80">
                  Transfers between your accounts are processed instantly
                </p>
              </div>
              <div className="p-3 rounded-lg bg-blue-500/10">
                <p className="text-sm font-medium text-blue-600 mb-1">No Fees</p>
                <p className="text-xs text-blue-600/80">
                  Internal transfers are completely free
                </p>
              </div>
              <div className="p-3 rounded-lg bg-purple-500/10">
                <p className="text-sm font-medium text-purple-600 mb-1">24/7 Available</p>
                <p className="text-xs text-purple-600/80">
                  Transfer funds anytime, day or night
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
