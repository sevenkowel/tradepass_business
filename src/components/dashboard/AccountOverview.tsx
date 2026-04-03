"use client";

import { Wallet, ArrowUpRight, ArrowDownRight, Repeat, Plus } from "lucide-react";
import Link from "next/link";
import { UserPerspective } from "@/types/user";
import { formatCurrency } from "@/lib/utils";

interface AccountOverviewProps {
  user: UserPerspective;
}

export function AccountOverview({ user }: AccountOverviewProps) {
  const { balance } = user;
  const hasBalance = balance.total > 0;

  return (
    <section className="py-6 border-b border-gray-100">
      <div className="flex items-start justify-between">
        {/* 资产信息 */}
        <div>
          <p className="text-sm text-gray-500 mb-1">账户总资产</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-semibold text-gray-900">
              {formatCurrency(balance.total, balance.currency)}
            </span>
            <span className="text-sm text-gray-500">{balance.currency}</span>
          </div>

          {hasBalance && (
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-gray-500">
                可用: {formatCurrency(balance.available, balance.currency)}
              </span>
              {balance.floatingPnL !== 0 && (
                <span
                  className={
                    balance.floatingPnL > 0 ? "text-green-600" : "text-red-600"
                  }
                >
                  浮动盈亏: {balance.floatingPnL > 0 ? "+" : ""}
                  {formatCurrency(balance.floatingPnL, balance.currency)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Deposit CTA */}
        <Link
          href="/portal/fund/deposit"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          入金
        </Link>
      </div>
    </section>
  );
}

// 快捷操作按钮
export function QuickActions() {
  const actions = [
    { label: "入金", href: "/portal/fund/deposit", icon: Plus },
    { label: "出金", href: "/portal/wallet/withdraw", icon: ArrowDownRight },
    { label: "划转", href: "/portal/wallet/transfer", icon: Repeat },
    { label: "交易", href: "/portal/trading", icon: ArrowUpRight },
  ];

  return (
    <section className="py-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <action.icon size={16} />
            {action.label}
          </Link>
        ))}
      </div>
    </section>
  );
}
