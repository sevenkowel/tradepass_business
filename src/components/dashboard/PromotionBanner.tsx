"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Gift, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  countdown?: number; // seconds
  bgGradient: string;
  ctaText: string;
  href: string;
  icon: React.ReactNode;
}

const promotions: Promotion[] = [
  {
    id: "1",
    title: "存款送彩金 50%",
    subtitle: "限时活动，最高可领 $500",
    countdown: 2 * 3600 + 12 * 60 + 33, // 2:12:33
    bgGradient: "from-amber-500 to-orange-600",
    ctaText: "立即参与",
    href: "/portal/activity/promotions",
    icon: <Gift size={24} />,
  },
  {
    id: "2",
    title: "邀请好友赚佣金",
    subtitle: "每邀请一位好友最高赚 $100",
    bgGradient: "from-blue-500 to-indigo-600",
    ctaText: "立即邀请",
    href: "/portal/ib/invite",
    icon: <Users size={24} />,
  },
  {
    id: "3",
    title: "新手交易礼包",
    subtitle: "完成首单交易领取 $20 奖励",
    bgGradient: "from-emerald-500 to-teal-600",
    ctaText: "领取奖励",
    href: "/portal/activity/rewards",
    icon: <Gift size={24} />,
  },
];

function formatCountdown(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

interface PromotionBannerProps {
  userStage: "new" | "unverified" | "no_deposit" | "active" | "vip";
}

export function PromotionBanner({ userStage }: PromotionBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countdowns, setCountdowns] = useState<Record<string, number>>({});

  // Initialize countdowns
  useEffect(() => {
    const initial: Record<string, number> = {};
    promotions.forEach((p) => {
      if (p.countdown) {
        initial[p.id] = p.countdown;
      }
    });
    setCountdowns(initial);
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdowns((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((key) => {
          if (next[key] > 0) {
            next[key] -= 1;
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  const currentPromo = promotions[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.35 }}
      className="bg-white rounded-2xl border-2 border-gray-200 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="text-lg">🎁</span>
          活动专区
        </h2>
        <div className="flex gap-1">
          <button
            onClick={prevSlide}
            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <button
            onClick={nextSlide}
            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="relative overflow-hidden rounded-xl">
        <motion.div
          key={currentPromo.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "bg-gradient-to-r p-5 text-white",
            currentPromo.bgGradient
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {currentPromo.icon}
                <h3 className="font-bold text-lg">{currentPromo.title}</h3>
              </div>
              <p className="text-white/80 text-sm mb-3">
                {currentPromo.subtitle}
              </p>

              {/* Countdown */}
              {currentPromo.countdown && countdowns[currentPromo.id] > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={14} className="text-white/70" />
                  <span className="text-sm font-mono bg-white/20 px-2 py-0.5 rounded">
                    {formatCountdown(countdowns[currentPromo.id])}
                  </span>
                </div>
              )}

              <Link href={currentPromo.href}>
                <button className="px-4 py-2 bg-white text-gray-900 text-sm font-bold rounded-lg hover:bg-gray-100 transition-colors">
                  {currentPromo.ctaText}
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {promotions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex
                  ? "bg-white w-4"
                  : "bg-white/50 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      </div>

      {/* Mini Cards */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        {promotions.slice(0, 2).map((promo) => (
          <Link key={promo.id} href={promo.href}>
            <div className="p-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-white",
                    promo.bgGradient.replace("from-", "bg-").split(" ")[0]
                  )}
                >
                  {promo.icon}
                </div>
                <span className="text-xs font-semibold text-gray-800 truncate">
                  {promo.title}
                </span>
              </div>
              <p className="text-xs text-gray-500 truncate">{promo.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
