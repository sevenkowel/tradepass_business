"use client";

import { motion } from "framer-motion";
import {
  Gift,
  Star,
  TrendingUp,
  Wallet,
  Zap,
  ChevronRight,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { cn } from "@/lib/utils";

// ─── Mock Data ─────────────────────────────────────────────
const availableRewards = [
  {
    id: 1,
    title: "Welcome Bonus",
    description: "Get $500 bonus on your first deposit of $1000+",
    value: "$500",
    type: "deposit_bonus",
    expiresIn: "30 days",
    icon: Wallet,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    isNew: true,
  },
  {
    id: 2,
    title: "Trading Rebate",
    description: "Earn up to 20% cashback on your trading volume",
    value: "Up to 20%",
    type: "rebate",
    expiresIn: "Ongoing",
    icon: TrendingUp,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    isNew: false,
  },
  {
    id: 3,
    title: "Loyalty Points",
    description: "Earn points for every trade and redeem for rewards",
    value: "2x Points",
    type: "loyalty",
    expiresIn: "Limited time",
    icon: Star,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    isNew: true,
  },
  {
    id: 4,
    title: "Referral Bonus",
    description: "Earn $30 for each friend you invite",
    value: "$30/friend",
    type: "referral",
    expiresIn: "Ongoing",
    icon: Gift,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    isNew: false,
  },
];

const myRewards = [
  {
    id: 1,
    title: "Welcome Bonus",
    claimedAt: "Jul 15, 2025",
    status: "active",
    value: "$500",
  },
  {
    id: 2,
    title: "Trading Rebate - Week 28",
    claimedAt: "Jul 20, 2025",
    status: "active",
    value: "$125.50",
  },
];

// ─── Components ────────────────────────────────────────────
function RewardCard({
  reward,
}: {
  reward: (typeof availableRewards)[0];
}) {
  const Icon = reward.icon;
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 hover:border-blue-300 transition-all">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            reward.iconBg
          )}
        >
          <Icon size={22} className={reward.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">{reward.title}</h3>
                {reward.isNew && (
                  <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-medium rounded-full">
                    New
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{reward.description}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-gray-800">{reward.value}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock size={12} />
              <span>Expires in {reward.expiresIn}</span>
            </div>
            <button className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
              Claim
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function RewardsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Rewards Center"
        description="Discover and claim exclusive rewards and bonuses"
      />

      {/* Available Rewards Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Available Rewards
          </h2>
          <span className="text-sm text-gray-500">
            {availableRewards.length} rewards available
          </span>
        </div>
        <div className="grid gap-4">
          {availableRewards.map((reward, index) => (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <RewardCard reward={reward} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* My Active Rewards Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">My Rewards</h2>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View History
          </button>
        </div>
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
          {myRewards.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                <Gift size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-500">No active rewards yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Claim rewards above to see them here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {myRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {reward.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Claimed on {reward.claimedAt}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {reward.value}
                    </p>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        reward.status === "active"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {reward.status === "active" ? "Active" : "Expired"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
