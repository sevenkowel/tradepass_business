"use client";

import { Plus, ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import { UserPerspective } from "@/types/user";
import { formatCurrency } from "@/lib/utils";

interface TradingAccountsProps {
  user: UserPerspective;
}

export function TradingAccounts({ user }: TradingAccountsProps) {
  const { accounts } = user;
  const hasAccounts = accounts.length > 0;

  if (!hasAccounts) {
    return (
      <section className="py-6 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-900 mb-4">交易账户</h3>
        <div className="flex items-center justify-between p-4 border border-dashed border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500">还没有交易账户</p>
          <Link
            href="/portal/trading/open-account"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Plus size={14} />
            开户
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 border-b border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">我的交易账户</h3>
        <Link
          href="/portal/trading/open-account"
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          + 添加账户
        </Link>
      </div>

      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className="p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    account.type === "live"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-gray-50 text-gray-500"
                  }`}
                >
                  {account.type === "live" ? "实盘" : "模拟"}
                </span>
                <span className="text-sm text-gray-500">{account.id}</span>
              </div>
              <span className="text-xs text-gray-400">
                {account.leverage}:1
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-xl font-medium text-gray-900">
                {formatCurrency(account.balance, account.currency)}
              </span>
              <span className="text-xs text-gray-400">{account.currency}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
              <span>净值: {formatCurrency(account.equity, account.currency)}</span>
              <span className="mx-2">·</span>
              <span>可用: {formatCurrency(account.freeMargin, account.currency)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/portal/wallet/deposit"
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
              >
                <ArrowUpRight size={12} />
                入金
              </Link>
              <Link
                href="/portal/wallet/withdraw"
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
              >
                <ArrowDownRight size={12} />
                出金
              </Link>
              <Link
                href="/portal/trading"
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded hover:bg-gray-800"
              >
                <ExternalLink size={12} />
                交易
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
