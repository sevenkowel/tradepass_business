"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Bitcoin,
  Euro,
  JapaneseYen,
  PoundSterling,
  ChevronRight,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const wallets = [
  { 
    currency: "USD", 
    name: "US Dollar",
    balance: 12500.50, 
    available: 12000.00, 
    locked: 500.50,
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  { 
    currency: "EUR", 
    name: "Euro",
    balance: 8500.00, 
    available: 8200.00, 
    locked: 300.00,
    icon: Euro,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  { 
    currency: "GBP", 
    name: "British Pound",
    balance: 3200.00, 
    available: 3000.00, 
    locked: 200.00,
    icon: PoundSterling,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
  { 
    currency: "JPY", 
    name: "Japanese Yen",
    balance: 150000, 
    available: 145000, 
    locked: 5000,
    icon: JapaneseYen,
    color: "text-red-500",
    bgColor: "bg-red-500/10"
  },
  { 
    currency: "USDT", 
    name: "Tether",
    balance: 5000.00, 
    available: 5000.00, 
    locked: 0,
    icon: DollarSign,
    color: "text-teal-500",
    bgColor: "bg-teal-500/10"
  },
  { 
    currency: "BTC", 
    name: "Bitcoin",
    balance: 0.25, 
    available: 0.20, 
    locked: 0.05,
    icon: Bitcoin,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    isCrypto: true
  },
  { 
    currency: "ETH", 
    name: "Ethereum",
    balance: 2.5, 
    available: 2.0, 
    locked: 0.5,
    icon: Bitcoin,
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    isCrypto: true
  },
];

const recentTransactions = [
  { id: "TXN-001", type: "deposit", amount: 5000, currency: "USD", date: "2024-01-15", status: "completed" },
  { id: "TXN-002", type: "withdraw", amount: 1000, currency: "USD", date: "2024-01-14", status: "completed" },
  { id: "TXN-003", type: "transfer", amount: 2500, currency: "USD", date: "2024-01-13", status: "completed" },
  { id: "TXN-004", type: "deposit", amount: 0.1, currency: "BTC", date: "2024-01-12", status: "completed" },
];

export default function WalletPage() {
  const router = useRouter();
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

  const totalBalanceUSD = 35680.50;
  const totalAvailableUSD = 34200.00;

  const selectedWallet = wallets.find(w => w.currency === selectedCurrency);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[rgba(var(--tp-accent-rgb),0.1)]">
              <Wallet className="w-6 h-6 text-[rgb(var(--tp-accent-rgb))]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">My Wallets</h1>
              <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">Manage your multi-currency wallets</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setHideBalance(!hideBalance)}>
            {hideBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </Button>
        </div>
      </motion.div>

      {/* Total Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card className="bg-gradient-to-r from-[rgb(var(--tp-accent-rgb))] to-[rgba(var(--tp-accent-rgb),0.8)] text-white">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Balance (USD)</p>
                <p className="text-4xl font-bold">
                  {hideBalance ? "****" : `$${totalBalanceUSD.toLocaleString()}`}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  Available: {hideBalance ? "****" : `$${totalAvailableUSD.toLocaleString()}`}
                </p>
              </div>
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <Wallet className="w-10 h-10" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Wallet Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wallets.map((wallet, index) => (
                  <motion.div
                    key={wallet.currency}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    onClick={() => setSelectedCurrency(wallet.currency)}
                    className={cn(
                      "p-4 rounded-xl border-2 cursor-pointer transition-all",
                      selectedCurrency === wallet.currency
                        ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.05)]"
                        : "border-[rgba(var(--tp-fg-rgb),0.1)] hover:border-[rgba(var(--tp-fg-rgb),0.3)]"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", wallet.bgColor)}>
                          <wallet.icon className={cn("w-5 h-5", wallet.color)} />
                        </div>
                        <div>
                          <p className="font-semibold text-[rgb(var(--tp-fg-rgb))]">{wallet.currency}</p>
                          <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">{wallet.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[rgb(var(--tp-fg-rgb))]">
                          {hideBalance ? "****" : wallet.balance.toLocaleString()}
                        </p>
                        <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">
                          ${wallet.isCrypto ? (wallet.balance * 40000).toLocaleString() : wallet.balance.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-[rgba(var(--tp-fg-rgb),0.1)] flex justify-between text-xs">
                      <span className="text-[rgba(var(--tp-fg-rgb),0.5)]">
                        Available: {hideBalance ? "****" : wallet.available.toLocaleString()}
                      </span>
                      {wallet.locked > 0 && (
                        <span className="text-yellow-500">
                          Locked: {hideBalance ? "****" : wallet.locked.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Wallet Details & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => router.push("/portal/fund/deposit")}
                className="w-full h-12 justify-between bg-green-500 hover:bg-green-600 text-white"
              >
                <span className="flex items-center">
                  <ArrowDownLeft className="w-5 h-5 mr-2" />
                  Deposit
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => router.push("/portal/fund/withdraw")}
                className="w-full h-12 justify-between bg-red-500 hover:bg-red-600 text-white"
              >
                <span className="flex items-center">
                  <ArrowUpRight className="w-5 h-5 mr-2" />
                  Withdraw
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => router.push("/portal/fund/transfer")}
                variant="outline"
                className="w-full h-12 justify-between"
              >
                <span className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Transfer
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Selected Wallet Info */}
          {selectedWallet && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedWallet.currency} Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">Total Balance</span>
                      <span className="font-semibold">
                        {hideBalance ? "****" : selectedWallet.balance.toLocaleString()} {selectedWallet.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">Available</span>
                      <span className="font-semibold text-green-500">
                        {hideBalance ? "****" : selectedWallet.available.toLocaleString()} {selectedWallet.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">Locked</span>
                      <span className="font-semibold text-yellow-500">
                        {hideBalance ? "****" : selectedWallet.locked.toLocaleString()} {selectedWallet.currency}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push("/portal/fund/history")}
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((txn) => (
                  <div 
                    key={txn.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[rgba(var(--tp-fg-rgb),0.03)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        txn.type === "deposit" ? "bg-green-500/10" : 
                        txn.type === "withdraw" ? "bg-red-500/10" : "bg-blue-500/10"
                      )}>
                        {txn.type === "deposit" ? (
                          <ArrowDownLeft className="w-4 h-4 text-green-500" />
                        ) : txn.type === "withdraw" ? (
                          <ArrowUpRight className="w-4 h-4 text-red-500" />
                        ) : (
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm capitalize">{txn.type}</p>
                        <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">{txn.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-semibold text-sm",
                        txn.type === "deposit" ? "text-green-500" : 
                        txn.type === "withdraw" ? "text-red-500" : "text-blue-500"
                      )}>
                        {txn.type === "deposit" ? "+" : txn.type === "withdraw" ? "-" : ""}
                        {txn.amount} {txn.currency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
