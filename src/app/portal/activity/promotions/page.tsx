"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Clock,
  ChevronRight,
  Percent,
  Gift,
  Trophy,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { cn } from "@/lib/utils";

// ─── Mock Data ─────────────────────────────────────────────
const activePromotions = [
  {
    id: 1,
    title: "Summer Trading Festival",
    description:
      "Trade during summer and win amazing prizes including iPhone 15 Pro and cash bonuses up to $10,000",
    badge: "Hot",
    badgeColor: "bg-rose-500",
    endsIn: "15 days",
    image: "🌴",
    cta: "Join Now",
    stats: "2,450 traders joined",
  },
  {
    id: 2,
    title: "Deposit Bonus 50%",
    description:
      "Get 50% bonus on every deposit up to $5,000. Perfect for boosting your trading capital!",
    badge: "Limited",
    badgeColor: "bg-amber-500",
    endsIn: "7 days",
    image: "💰",
    cta: "Deposit Now",
    stats: "Limited time offer",
  },
  {
    id: 3,
    title: "Trading Competition",
    description:
      "Compete with top traders worldwide. Prize pool of $100,000 for the best performers this month.",
    badge: "New",
    badgeColor: "bg-emerald-500",
    endsIn: "30 days",
    image: "🏆",
    cta: "Register",
    stats: "500+ participants",
  },
];

const upcomingPromotions = [
  {
    id: 4,
    title: "VIP Exclusive Event",
    description: "Special benefits for VIP members only",
    startsIn: "Starts in 5 days",
    icon: Trophy,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    id: 5,
    title: "Weekend Cashback",
    description: "Get 10% cashback on all trades during weekends",
    startsIn: "Starts in 12 days",
    icon: Percent,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
];

const pastPromotions = [
  {
    id: 6,
    title: "Spring Bonus 2025",
    description: "30% deposit bonus campaign",
    endedAt: "Ended May 31, 2025",
    participants: "3,200+",
  },
  {
    id: 7,
    title: "New Year Trading Race",
    description: "Annual trading competition",
    endedAt: "Ended Jan 31, 2025",
    participants: "5,800+",
  },
];

// ─── Components ────────────────────────────────────────────
function ActivePromotionCard({
  promotion,
}: {
  promotion: (typeof activePromotions)[0];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold",
              promotion.badgeColor
            )}
          >
            {promotion.badge}
          </span>
          <span className="flex items-center gap-1 text-xs text-blue-100">
            <Clock size={12} />
            Ends in {promotion.endsIn}
          </span>
        </div>

        {/* Content */}
        <div className="flex items-start gap-4">
          <div className="text-5xl">{promotion.image}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">{promotion.title}</h3>
            <p className="text-blue-100 text-sm mb-4 leading-relaxed">
              {promotion.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-200">{promotion.stats}</span>
              <button className="flex items-center gap-1 px-4 py-2 bg-white text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-50 transition-colors">
                {promotion.cta}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function UpcomingPromotionCard({
  promotion,
}: {
  promotion: (typeof upcomingPromotions)[0];
}) {
  const Icon = promotion.icon;
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 hover:border-blue-300 transition-all">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
            promotion.iconBg
          )}
        >
          <Icon size={22} className={promotion.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-800">{promotion.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {promotion.description}
          </p>
          <div className="flex items-center gap-1 mt-3 text-xs text-amber-600">
            <Clock size={12} />
            <span>{promotion.startsIn}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────
export default function PromotionsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Promotions"
        description="Discover ongoing and upcoming promotional campaigns"
      />

      {/* Active Promotions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Active Promotions
          </h2>
          <span className="text-sm text-gray-500">
            {activePromotions.length} ongoing
          </span>
        </div>
        <div className="space-y-4">
          {activePromotions.map((promotion) => (
            <ActivePromotionCard key={promotion.id} promotion={promotion} />
          ))}
        </div>
      </section>

      {/* Upcoming Promotions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Coming Soon
        </h2>
        <div className="grid gap-4">
          {upcomingPromotions.map((promotion, index) => (
            <motion.div
              key={promotion.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <UpcomingPromotionCard promotion={promotion} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Past Promotions */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Past Promotions
        </h2>
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {pastPromotions.map((promotion) => (
              <div
                key={promotion.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {promotion.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {promotion.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{promotion.endedAt}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {promotion.participants} participants
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
