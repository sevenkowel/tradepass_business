"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingUp, Briefcase, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { TestUser } from "@/lib/test-users";

interface AccountSummaryProps {
  user: TestUser;
}

export function AccountSummary({ user }: AccountSummaryProps) {
  const realAccount = user.accounts.find((a) => a.type === "Real");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.35 }}
      className="bg-white rounded-2xl border-2 border-gray-200 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="text-lg">📊</span>
          账户概览
        </h2>
        <Link
          href="/portal/wallet"
          className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
        >
          查看详情 <ChevronRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Total Assets */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Wallet size={16} />
            </div>
            <span className="text-xs text-blue-700 font-medium">总资产</span>
          </div>
          <p className="text-lg font-bold text-gray-800">
            {formatCurrency(user.wallet.total)}
          </p>
        </div>

        {/* Floating PnL */}
        <div
          className={`p-4 rounded-xl border ${
            (user.floatingPnL || 0) >= 0
              ? "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
              : "bg-gradient-to-br from-red-50 to-red-100 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                (user.floatingPnL || 0) >= 0
                  ? "bg-emerald-600 text-white"
                  : "bg-red-600 text-white"
              }`}
            >
              <TrendingUp size={16} />
            </div>
            <span
              className={`text-xs font-medium ${
                (user.floatingPnL || 0) >= 0
                  ? "text-emerald-700"
                  : "text-red-700"
              }`}
            >
              浮动盈亏
            </span>
          </div>
          <p
            className={`text-lg font-bold ${
              (user.floatingPnL || 0) >= 0
                ? "text-emerald-700"
                : "text-red-700"
            }`}
          >
            {(user.floatingPnL || 0) >= 0 ? "+" : ""}
            {formatCurrency(user.floatingPnL || 0)}
          </p>
        </div>

        {/* Positions */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
              <Briefcase size={16} />
            </div>
            <span className="text-xs text-amber-700 font-medium">持仓</span>
          </div>
          <p className="text-lg font-bold text-gray-800">
            {user.positions || 0} 笔
          </p>
        </div>
      </div>

      {/* Account Details */}
      {realAccount && (
        <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">主交易账户</p>
              <p className="font-mono font-semibold text-gray-800">
                {realAccount.id}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">账户余额</p>
              <p className="font-bold text-gray-800">
                {formatCurrency(realAccount.balance)}
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
