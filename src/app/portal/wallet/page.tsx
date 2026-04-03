"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  FileText,
  TrendingUp,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { StatCard } from "@/components/portal/widgets/StatCard";
import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { usePortalStore } from "@/store/portalStore";
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";

const mockTransactions = [
  { id: "TXN001", type: "Deposit", amount: 5000, currency: "USDT", status: "completed", method: "USDT TRC20", time: "2025-03-28 14:32" },
  { id: "TXN002", type: "Withdraw", amount: -1200, currency: "USDT", status: "completed", method: "USDT ERC20", time: "2025-03-26 09:15" },
  { id: "TXN003", type: "Transfer", amount: -2000, currency: "USD", status: "completed", method: "Wallet → MT5", time: "2025-03-25 16:48" },
  { id: "TXN004", type: "Deposit", amount: 3000, currency: "USD", status: "pending", method: "Wire Transfer", time: "2025-03-25 11:20" },
  { id: "TXN005", type: "Withdraw", amount: -800, currency: "USDT", status: "failed", method: "USDT TRC20", time: "2025-03-24 08:05" },
];

const quickActions = [
  { label: "Deposit",  icon: ArrowDownToLine, href: "/portal/fund/deposit",         iconBg: "bg-blue-50",    iconColor: "text-blue-600",    border: "border-blue-200",    hover: "hover:border-blue-500" },
  { label: "Withdraw", icon: ArrowUpFromLine, href: "/portal/wallet/withdraw",     iconBg: "bg-purple-50",  iconColor: "text-purple-600",  border: "border-purple-200",  hover: "hover:border-purple-500" },
  { label: "Transfer", icon: ArrowLeftRight,  href: "/portal/wallet/transfer",     iconBg: "bg-emerald-50", iconColor: "text-emerald-600", border: "border-emerald-200", hover: "hover:border-emerald-500" },
  { label: "History",  icon: FileText,        href: "/portal/wallet/transactions", iconBg: "bg-amber-50",   iconColor: "text-amber-600",   border: "border-amber-200",   hover: "hover:border-amber-500" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ElementType; label: string; className: string }> = {
    completed:  { icon: CheckCircle2, label: "Completed",  className: "text-emerald-700 bg-emerald-50 border border-emerald-200" },
    pending:    { icon: Clock,        label: "Pending",    className: "text-amber-700   bg-amber-50   border border-amber-200"   },
    failed:     { icon: XCircle,      label: "Failed",     className: "text-red-700     bg-red-50     border border-red-200"     },
    processing: { icon: AlertCircle,  label: "Processing", className: "text-blue-700   bg-blue-50    border border-blue-200"    },
  };
  const config = map[status] ?? map["processing"];
  const Icon = config.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg", config.className)}>
      <Icon size={11} />
      {config.label}
    </span>
  );
}

export default function WalletPage() {
  const { wallet } = usePortalStore();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet"
        description="Manage your funds, deposits, and withdrawals."
        actions={
          <Link href="/portal/fund/deposit">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <ArrowDownToLine size={15} />
              Deposit
            </motion.button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value={formatCurrency(wallet.total)} change={3.24} changeLabel="today" icon={Wallet} progressColor="blue" />
        <StatCard title="Equity" value={formatCurrency(wallet.equity)} change={4.81} icon={TrendingUp} progressColor="green" delay={0.05} />
        <StatCard title="Available" value={formatCurrency(wallet.available)} icon={ArrowDownToLine} progressColor="purple" delay={0.1} />
        <StatCard title="Frozen" value={formatCurrency(wallet.frozen)} icon={ArrowLeftRight} progressColor="orange" delay={0.15} />
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {quickActions.map(({ label, icon: Icon, href, iconBg, iconColor, border, hover }) => (
          <Link key={label} href={href}>
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "flex items-center gap-3 p-4 rounded-2xl bg-white border-2 cursor-pointer transition-all duration-200 hover:shadow-md",
                border, hover
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", iconBg)}>
                <Icon size={17} className={iconColor} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold text-gray-800">{label}</span>
                <ChevronRight size={14} className="text-gray-400" />
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl bg-white border border-gray-200 overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Recent Transactions</h2>
          <Link
            href="/portal/wallet/transactions"
            className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-0.5"
          >
            View all <ChevronRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {["ID", "Type", "Amount", "Method", "Status", "Time"].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-gray-400 px-5 py-3 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((tx, i) => (
                <motion.tr
                  key={tx.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{tx.id}</td>
                  <td className="px-5 py-3.5">
                    <span className={cn(
                      "text-xs font-bold px-2 py-0.5 rounded-lg border",
                      tx.type === "Deposit"  ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                      : tx.type === "Withdraw" ? "text-red-700 bg-red-50 border-red-200"
                      : "text-blue-700 bg-blue-50 border-blue-200"
                    )}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold">
                    <span className={tx.amount > 0 ? "text-emerald-600" : "text-red-600"}>
                      {tx.amount > 0 ? "+" : ""}{formatCurrency(Math.abs(tx.amount))}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">{tx.method}</td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-400">{tx.time}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
