"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  History,
  CreditCard,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const quickActions = [
  { 
    icon: ArrowDownLeft, 
    label: "Deposit", 
    description: "Add funds to your account",
    href: "/portal/fund/deposit",
    color: "text-green-500",
    bgColor: "bg-green-500/10"
  },
  { 
    icon: ArrowUpRight, 
    label: "Withdraw", 
    description: "Withdraw funds to your bank",
    href: "/portal/fund/withdraw",
    color: "text-red-500",
    bgColor: "bg-red-500/10"
  },
  { 
    icon: ArrowLeftRight, 
    label: "Transfer", 
    description: "Transfer between accounts",
    href: "/portal/fund/transfer",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10"
  },
  { 
    icon: History, 
    label: "History", 
    description: "View transaction history",
    href: "/portal/fund/history",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10"
  },
];

const wallets = [
  { currency: "USD", balance: 12500.50, available: 12000.00, locked: 500.50 },
  { currency: "EUR", balance: 8500.00, available: 8200.00, locked: 300.00 },
  { currency: "USDT", balance: 5000.00, available: 5000.00, locked: 0 },
  { currency: "BTC", balance: 0.25, available: 0.25, locked: 0 },
];

const tradingAccounts = [
  { id: "ACC-001", name: "Standard Account", balance: 10000.00, equity: 10250.00, margin: 500.00 },
  { id: "ACC-002", name: "Pro Account", balance: 25000.00, equity: 24800.00, margin: 2000.00 },
];

export default function FundPage() {
  const router = useRouter();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">Fund Management</h1>
        <p className="text-[rgba(var(--tp-fg-rgb),0.6)]">Manage your funds, deposits, withdrawals, and transfers</p>
      </motion.div>

      {/* Total Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-[rgb(var(--tp-accent-rgb))] to-[rgba(var(--tp-accent-rgb),0.8)] text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm mb-1">Total Balance (USD)</p>
                <p className="text-3xl font-bold">$21,000.50</p>
                <p className="text-white/60 text-sm mt-1">Available: $20,200.00</p>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <Wallet className="w-8 h-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {quickActions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + index * 0.05 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push(action.href)}
            >
              <CardContent className="p-4">
                <div className={`w-10 h-10 rounded-lg ${action.bgColor} ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-[rgb(var(--tp-fg-rgb))]">{action.label}</p>
                <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.6)]">{action.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Wallet Balances */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Wallet Balances</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push("/portal/fund/wallet")}>
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {wallets.map((wallet) => (
                <div 
                  key={wallet.currency}
                  className="p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)] hover:bg-[rgba(var(--tp-fg-rgb),0.08)] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-[rgb(var(--tp-fg-rgb))]">{wallet.currency}</span>
                    <Wallet className="w-4 h-4 text-[rgba(var(--tp-fg-rgb),0.4)]" />
                  </div>
                  <p className="text-xl font-bold text-[rgb(var(--tp-fg-rgb))]">
                    {wallet.balance.toLocaleString()}
                  </p>
                  <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">
                    Available: {wallet.available.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Trading Accounts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trading Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tradingAccounts.map((account) => (
                <div 
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.05)]"
                >
                  <div>
                    <p className="font-medium text-[rgb(var(--tp-fg-rgb))]">{account.name}</p>
                    <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">{account.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[rgb(var(--tp-fg-rgb))]">
                      ${account.equity.toLocaleString()}
                    </p>
                    <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">
                      Balance: ${account.balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Payment Accounts Quick Access */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Payment Accounts</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push("/portal/fund/accounts")}>
              Manage
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[rgba(var(--tp-accent-rgb),0.1)] flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[rgb(var(--tp-accent-rgb))]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[rgb(var(--tp-fg-rgb))]">3 Payment Methods</p>
                <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.5)]">
                  2 Bank Accounts • 1 Crypto Wallet
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push("/portal/fund/accounts")}>
                Add New
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
