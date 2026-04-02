"use client";

import { motion } from "framer-motion";
import { Crown, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";
import { TestUser, getCurrentCTA } from "@/lib/test-users";

interface UserHeroCardProps {
  user: TestUser;
}

export function UserHeroCard({ user }: UserHeroCardProps) {
  const cta = getCurrentCTA(user);
  const realAccount = user.accounts.find((a) => a.type === "Real");
  const demoAccount = user.accounts.find((a) => a.type === "Demo");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left: User Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-lg font-bold">
              {user.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Welcome, {user.name}</h1>
                {user.vipLevel > 0 && (
                  <span className="flex items-center gap-1 text-xs font-semibold bg-amber-400/90 text-amber-900 px-2 py-0.5 rounded-lg">
                    <Crown size={12} />
                    VIP Lv{user.vipLevel}
                  </span>
                )}
              </div>
              <p className="text-blue-100 text-sm">Ready to start trading?</p>
            </div>
          </div>

          {/* Assets */}
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-blue-200 text-xs mb-1">账户总资产</p>
              <p className="text-2xl font-bold">{formatCurrency(user.wallet.total)}</p>
            </div>
            <div>
              <p className="text-blue-200 text-xs mb-1">可用保证金</p>
              <p className="text-2xl font-bold">{formatCurrency(user.wallet.available)}</p>
            </div>
          </div>

          {/* Account Tabs */}
          <div className="flex gap-3 mt-4">
            {realAccount && (
              <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2">
                <p className="text-xs text-blue-200">Real Account</p>
                <p className="font-semibold">{formatCurrency(realAccount.balance)}</p>
              </div>
            )}
            {demoAccount && (
              <div className="bg-white/10 backdrop-blur rounded-lg px-3 py-2">
                <p className="text-xs text-blue-200">Demo Account</p>
                <p className="font-semibold">{formatCurrency(demoAccount.balance)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: CTA Button */}
        <Link href={cta.href}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg cursor-pointer",
              "bg-white text-blue-700 shadow-lg hover:shadow-xl transition-shadow"
            )}
          >
            <Wallet size={20} />
            {cta.text}
            <ArrowRight size={18} />
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}
