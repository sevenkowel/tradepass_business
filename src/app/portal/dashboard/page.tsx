"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Plus,
  Zap,
  Copy,
  Users,
  Bell,
  CheckSquare,
  ChevronRight,
  Star,
  Shield,
  BarChart2,
} from "lucide-react";
import { StatCard } from "@/components/portal/widgets/StatCard";
import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { usePortalStore } from "@/store/portalStore";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import Link from "next/link";

// ─── Mock Data ─────────────────────────────────────────────
const mockAccounts = [
  { id: "MT5-8843201", type: "Real", balance: 28400.5, equity: 29100.2, server: "TradePass-Live", leverage: "1:100", currency: "USD", profit: 2.46 },
  { id: "MT5-8843202", type: "Real", balance: 15200.0, equity: 15080.5, server: "TradePass-Live", leverage: "1:200", currency: "USD", profit: -0.79 },
  { id: "MT5-0099013", type: "Demo", balance: 100000, equity: 102450, server: "TradePass-Demo", leverage: "1:500", currency: "USD", profit: 2.45 },
];

const mockSignals = [
  { id: 1, symbol: "XAUUSD", direction: "BUY", entry: 2334.5, sl: 2318.0, tp: 2360.0, confidence: 87, timeframe: "H4", time: "2h ago" },
  { id: 2, symbol: "EURUSD", direction: "SELL", entry: 1.0882, sl: 1.0910, tp: 1.0835, confidence: 74, timeframe: "H1", time: "4h ago" },
  { id: 3, symbol: "BTCUSDT", direction: "BUY", entry: 68200, sl: 66500, tp: 71000, confidence: 91, timeframe: "D1", time: "6h ago" },
];

const mockTraders = [
  { id: 1, name: "AlphaEdge Pro", roi: 142.8, drawdown: 8.2, followers: 1240, avatar: "AE", copiers: 892 },
  { id: 2, name: "FX Sentinel", roi: 98.4, drawdown: 12.1, followers: 680, avatar: "FS", copiers: 421 },
  { id: 3, name: "Quantum Scalper", roi: 76.5, drawdown: 6.8, followers: 2100, avatar: "QS", copiers: 1580 },
];

const mockTasks = [
  { id: 1, title: "Complete KYC Verification", reward: "$50 bonus", progress: 60, icon: Shield, href: "/portal/settings/verification" },
  { id: 2, title: "Make First Deposit", reward: "5% deposit bonus", progress: 0, icon: ArrowDownToLine, href: "/portal/wallet/deposit" },
  { id: 3, title: "Complete 10 Trades", reward: "Trading rebate", progress: 30, icon: BarChart2, href: "/portal/trading/accounts" },
];

const mockAnnouncements = [
  { id: 1, type: "update", title: "New AI Signal Models Released", desc: "3 new deep learning models for Forex signals are now live.", time: "1h ago" },
  { id: 2, type: "promo", title: "Summer Trading Bonus — Up to 30%", desc: "Deposit and trade to earn bonus rewards this summer season.", time: "2d ago" },
];
// ────────────────────────────────────────────────────────────

function QuickAction({
  icon: Icon,
  label,
  href,
  color = "var(--color-primary)",
}: {
  icon: React.ElementType;
  label: string;
  href: string;
  color?: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        className="flex flex-col items-center gap-2 p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--color-primary)]/20 cursor-pointer transition-colors group"
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: `${color}15` }}
        >
          <Icon size={17} style={{ color }} />
        </div>
        <span className="text-[12px] font-medium text-[var(--foreground)]/70 group-hover:text-[var(--foreground)] transition-colors">
          {label}
        </span>
      </motion.div>
    </Link>
  );
}

function AccountCard({ account }: { account: (typeof mockAccounts)[0] }) {
  const isProfit = account.profit >= 0;
  return (
    <motion.div
      whileHover={{ y: -1 }}
      className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--color-primary)]/20 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-[10px] font-semibold px-1.5 py-0.5 rounded-md",
                account.type === "Real"
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  : "bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
              )}
            >
              {account.type}
            </span>
            <span className="text-[11px] text-[var(--foreground)]/40">{account.leverage}</span>
          </div>
          <p className="text-sm font-mono font-medium text-[var(--foreground)] mt-1">
            {account.id}
          </p>
        </div>
        <div className={cn("text-sm font-semibold", isProfit ? "text-[var(--color-success)]" : "text-[var(--color-error)]")}>
          {formatPercent(account.profit)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <p className="text-[11px] text-[var(--foreground)]/40">Balance</p>
          <p className="text-sm font-semibold">{formatCurrency(account.balance)}</p>
        </div>
        <div>
          <p className="text-[11px] text-[var(--foreground)]/40">Equity</p>
          <p className="text-sm font-semibold">{formatCurrency(account.equity)}</p>
        </div>
      </div>
      <p className="text-[11px] text-[var(--foreground)]/30">{account.server}</p>
    </motion.div>
  );
}

function SignalCard({ signal }: { signal: (typeof mockSignals)[0] }) {
  const isBuy = signal.direction === "BUY";
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer">
      <div className={cn(
        "text-[11px] font-semibold px-1.5 py-0.5 rounded-md shrink-0",
        isBuy ? "bg-[var(--color-success)]/10 text-[var(--color-success)]" : "bg-[var(--color-error)]/10 text-[var(--color-error)]"
      )}>
        {signal.direction}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{signal.symbol}</span>
          <span className="text-[11px] text-[var(--foreground)]/40 bg-[var(--surface-elevated)] px-1.5 py-0.5 rounded-md">{signal.timeframe}</span>
        </div>
        <p className="text-xs text-[var(--foreground)]/50 mt-0.5">Entry: {signal.entry}</p>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-bold text-[var(--color-primary)]">{signal.confidence}%</div>
        <div className="text-[11px] text-[var(--foreground)]/40">{signal.time}</div>
      </div>
    </div>
  );
}

function TraderCard({ trader }: { trader: (typeof mockTraders)[0] }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer group">
      <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)] flex items-center justify-center text-white text-xs font-semibold shrink-0">
        {trader.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{trader.name}</p>
        <p className="text-xs text-[var(--foreground)]/50">{trader.followers.toLocaleString()} followers</p>
      </div>
      <div className="text-right shrink-0">
        <div className="text-sm font-bold text-[var(--color-success)]">+{trader.roi}%</div>
        <div className="text-[11px] text-[var(--foreground)]/40">DD {trader.drawdown}%</div>
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ───────────────────────────────────
export default function DashboardPage() {
  const { wallet, user } = usePortalStore();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={`${greeting}, ${user?.name?.split(" ")[0]} 👋`}
        description="Here's your portfolio overview for today."
      />

      {/* Wallet Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(wallet.total)}
          change={3.24}
          changeLabel="today"
          icon={Wallet}
          delay={0}
          size="md"
        />
        <StatCard
          title="Equity"
          value={formatCurrency(wallet.equity)}
          change={4.81}
          changeLabel="today"
          icon={TrendingUp}
          iconColor="text-[var(--color-secondary)]"
          iconBg="bg-[var(--color-secondary)]/10"
          delay={0.05}
        />
        <StatCard
          title="Available"
          value={formatCurrency(wallet.available)}
          icon={ArrowDownToLine}
          iconColor="text-[var(--color-success)]"
          iconBg="bg-[var(--color-success)]/10"
          delay={0.1}
        />
        <StatCard
          title="Frozen"
          value={formatCurrency(wallet.frozen)}
          icon={ArrowLeftRight}
          iconColor="text-[var(--color-warning)]"
          iconBg="bg-[var(--color-warning)]/10"
          delay={0.15}
        />
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4"
      >
        <h2 className="text-xs font-semibold text-[var(--foreground)]/50 mb-3 uppercase tracking-wide">
          Quick Actions
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction icon={ArrowDownToLine} label="Deposit" href="/portal/wallet/deposit" />
          <QuickAction icon={ArrowUpFromLine} label="Withdraw" href="/portal/wallet/withdraw" color="var(--color-secondary)" />
          <QuickAction icon={Plus} label="Open Account" href="/portal/trading/open-account" color="var(--color-warning)" />
          <QuickAction icon={ArrowLeftRight} label="Transfer" href="/portal/wallet/transfer" color="var(--color-success)" />
        </div>
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left: Accounts + Tasks */}
        <div className="xl:col-span-2 space-y-5">
          {/* Trading Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[var(--foreground)]">My Accounts</h2>
              <Link href="/portal/trading/accounts" className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-0.5">
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {mockAccounts.map((acc) => (
                <AccountCard key={acc.id} account={acc} />
              ))}
            </div>
          </motion.div>

          {/* Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                <CheckSquare size={15} className="text-[var(--color-primary)]" />
                Tasks & Rewards
              </h2>
              <Link href="/portal/activity/tasks" className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-0.5">
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {mockTasks.map((task) => {
                const TaskIcon = task.icon;
                return (
                  <Link key={task.id} href={task.href}>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--surface-elevated)] transition-colors group cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/5 flex items-center justify-center shrink-0">
                        <TaskIcon size={15} className="text-[var(--color-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-medium">{task.title}</p>
                          <span className="text-xs text-[var(--color-accent)] font-semibold shrink-0">{task.reward}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[var(--border)]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-secondary)] transition-all duration-700"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-[var(--foreground)]/40 mt-1">{task.progress}% complete</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Right: Signals + Copy Trading + Announcements */}
        <div className="space-y-6">
          {/* AI Signals */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Zap size={15} className="text-[var(--color-accent)]" />
                AI Signals
              </h2>
              <Link href="/portal/ai-signals/feed" className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] flex items-center gap-0.5">
                More <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-1">
              {mockSignals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          </motion.div>

          {/* Copy Trading */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Copy size={15} className="text-[var(--color-secondary)]" />
                Top Traders
              </h2>
              <Link href="/portal/copy-trading/discover" className="text-xs text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] flex items-center gap-0.5">
                More <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-1">
              {mockTraders.map((trader) => (
                <TraderCard key={trader.id} trader={trader} />
              ))}
            </div>
          </motion.div>

          {/* Announcements */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-[var(--surface)] border border-[var(--border)] p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-[var(--foreground)] flex items-center gap-2">
                <Bell size={15} className="text-[var(--color-warning)]" />
                Announcements
              </h2>
            </div>
            <div className="space-y-3">
              {mockAnnouncements.map((ann) => (
                <div
                  key={ann.id}
                  className={cn(
                    "p-3 rounded-xl border",
                    ann.type === "promo"
                      ? "bg-[var(--color-accent)]/5 border-[var(--color-accent)]/20"
                      : "bg-[var(--surface-elevated)] border-[var(--border)]"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                      ann.type === "promo" ? "bg-[var(--color-accent)]" : "bg-[var(--color-secondary)]"
                    )} />
                    <div>
                      <p className="text-sm font-semibold">{ann.title}</p>
                      <p className="text-xs text-[var(--foreground)]/50 mt-0.5">{ann.desc}</p>
                      <p className="text-[11px] text-[var(--foreground)]/30 mt-1">{ann.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
