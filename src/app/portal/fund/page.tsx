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
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const quickActions = [
  { 
    icon: ArrowDownLeft, 
    label: "Deposit", 
    description: "Add funds",
    href: "/portal/fund/deposit",
    gradient: "from-emerald-500 to-teal-600",
    shadow: "shadow-emerald-500/20"
  },
  { 
    icon: ArrowUpRight, 
    label: "Withdraw", 
    description: "Withdraw funds",
    href: "/portal/fund/withdraw",
    gradient: "from-rose-500 to-pink-600",
    shadow: "shadow-rose-500/20"
  },
  { 
    icon: ArrowLeftRight, 
    label: "Transfer", 
    description: "Between accounts",
    href: "/portal/fund/transfer",
    gradient: "from-blue-500 to-indigo-600",
    shadow: "shadow-blue-500/20"
  },
  { 
    icon: History, 
    label: "History", 
    description: "Transactions",
    href: "/portal/fund/history",
    gradient: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-500/20"
  },
];

const wallets = [
  { currency: "USD", balance: 12500.50, available: 12000.00, locked: 500.50, change: 2.5 },
  { currency: "EUR", balance: 8500.00, available: 8200.00, locked: 300.00, change: -1.2 },
  { currency: "USDT", balance: 5000.00, available: 5000.00, locked: 0, change: 0 },
  { currency: "BTC", balance: 0.25, available: 0.25, locked: 0, change: 5.8 },
];

const tradingAccounts = [
  { id: "ACC-001", name: "Standard Account", balance: 10000.00, equity: 10250.00, margin: 500.00, pnl: 250 },
  { id: "ACC-002", name: "Pro Account", balance: 25000.00, equity: 24800.00, margin: 2000.00, pnl: -200 },
];

export default function FundPage() {
  const router = useRouter();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-[var(--tp-fg)]">Fund Management</h1>
          <p className="text-[var(--tp-muted)] mt-1">Manage your funds, deposits, withdrawals, and transfers</p>
        </div>
        <Button 
          onClick={() => router.push("/portal/fund/deposit")}
          className="bg-gradient-to-r from-[var(--tp-accent)] to-[var(--tp-accent)]/80 hover:opacity-90 shadow-lg shadow-[var(--tp-accent)]/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Deposit
        </Button>
      </motion.div>

      {/* Total Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--tp-accent)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--tp-accent)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm font-medium mb-2">Total Balance (USD)</p>
            <p className="text-5xl font-bold tracking-tight">$21,000.50</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-sm text-white/80">Available: $20,200.00</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-sm text-white/80">Locked: $800.50</span>
              </div>
            </div>
          </div>
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--tp-accent)]/20 to-[var(--tp-accent)]/5 flex items-center justify-center border border-white/10">
            <Wallet className="w-10 h-10 text-white/80" />
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-semibold text-[var(--tp-fg)] mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card 
                className="cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                onClick={() => router.push(action.href)}
              >
                <CardContent className="p-5 relative overflow-hidden">
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                  
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} ${action.shadow} shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="font-semibold text-[var(--tp-fg)] text-lg">{action.label}</p>
                  <p className="text-sm text-[var(--tp-muted)]">{action.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wallet Balances */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold text-[var(--tp-fg)]">Wallet Balances</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => router.push("/portal/fund/wallet")} className="text-[var(--tp-accent)]">
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {wallets.map((wallet) => (
                <motion.div 
                  key={wallet.currency}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 rounded-xl bg-[var(--tp-bg)] border border-[var(--tp-border)] hover:border-[var(--tp-accent)]/30 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--tp-accent)]/10 to-[var(--tp-accent)]/5 flex items-center justify-center">
                        <span className="font-bold text-[var(--tp-accent)] text-sm">{wallet.currency}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-[var(--tp-fg)]">{wallet.balance.toLocaleString()}</p>
                        <p className="text-xs text-[var(--tp-muted)]">Available: {wallet.available.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${wallet.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {wallet.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {Math.abs(wallet.change)}%
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Trading Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-[var(--tp-fg)]">Trading Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tradingAccounts.map((account) => (
                <motion.div 
                  key={account.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 rounded-xl bg-[var(--tp-bg)] border border-[var(--tp-border)] hover:border-[var(--tp-accent)]/30 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[var(--tp-fg)]">{account.name}</p>
                      <p className="text-xs text-[var(--tp-muted)]">{account.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[var(--tp-fg)]">${account.equity.toLocaleString()}</p>
                      <p className={`text-xs font-medium ${account.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {account.pnl >= 0 ? '+' : ''}{account.pnl.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Accounts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--tp-accent)]/10 to-[var(--tp-accent)]/5 flex items-center justify-center border border-[var(--tp-accent)]/20">
                  <CreditCard className="w-7 h-7 text-[var(--tp-accent)]" />
                </div>
                <div>
                  <p className="font-semibold text-[var(--tp-fg)] text-lg">Payment Methods</p>
                  <p className="text-sm text-[var(--tp-muted)]">
                    2 Bank Accounts • 1 Crypto Wallet
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => router.push("/portal/fund/accounts")}>
                  Manage
                </Button>
                <Button 
                  onClick={() => router.push("/portal/fund/accounts")}
                  className="bg-[var(--tp-accent)] hover:bg-[var(--tp-accent)]/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
