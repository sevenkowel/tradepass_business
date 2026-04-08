"use client";

import { ChevronRight, Clock, Gift, Flame, Zap, Award, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";

interface Promotion {
  id: string;
  title: string;
  subtitle: string;
  reward: string;
  status: "available" | "joined" | "ended";
  endTime?: string;
  tag?: string;
  color: string;
  bgGradient: string;
  coverImage: string;
}

const mockPromotions: Promotion[] = [
  {
    id: "1",
    title: "存款送彩金",
    subtitle: "首次入金即享",
    reward: "50% 高达 $100",
    status: "available",
    endTime: "02:12:33",
    tag: "限时",
    color: "from-amber-500 to-orange-500",
    bgGradient: "from-amber-50 to-orange-50",
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
  },
  {
    id: "2",
    title: "邀请好友赚佣金",
    subtitle: "好友交易你赚钱",
    reward: "最高 $500",
    status: "available",
    tag: "热门",
    color: "from-blue-500 to-indigo-500",
    bgGradient: "from-blue-50 to-indigo-50",
    coverImage: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=400&h=200&fit=crop",
  },
  {
    id: "3",
    title: "新手交易免点差",
    subtitle: "零成本体验交易",
    reward: "30天免点差",
    status: "available",
    tag: "新手",
    color: "from-emerald-500 to-teal-500",
    bgGradient: "from-emerald-50 to-teal-50",
    coverImage: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=400&h=200&fit=crop",
  },
];

const tagIcons: Record<string, typeof Gift> = {
  "限时": Flame,
  "热门": Zap,
  "新手": Award,
};

export function Promotions() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Gift size={18} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">热门活动</h3>
          </div>
          <Link
            href="/portal/activity/promotions"
            className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-0.5 transition-colors"
          >
            查看全部
            <ChevronRight size={16} />
          </Link>
        </div>

        {/* 活动卡片 - 横向滚动 */}
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          {mockPromotions.map((promo, index) => {
            const TagIcon = promo.tag ? tagIcons[promo.tag] || Gift : Gift;
            return (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-72"
              >
                <div className="group relative overflow-hidden rounded-xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 h-full">
                  {/* 封面图 */}
                  <div className="relative h-28 overflow-hidden">
                    <Image
                      src={promo.coverImage}
                      alt={promo.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* 渐变遮罩 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* 标签 - 左上角 */}
                    <div className={`absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/95 backdrop-blur-sm shadow-sm ${
                      promo.tag === '限时' ? 'text-amber-600' :
                      promo.tag === '热门' ? 'text-blue-600' :
                      'text-emerald-600'
                    }`}>
                      <TagIcon size={12} />
                      {promo.tag}
                    </div>

                    {/* 倒计时 - 右上角 */}
                    {promo.endTime && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-black/50 backdrop-blur-sm text-white">
                        <Clock size={12} />
                        <span>{promo.endTime}</span>
                      </div>
                    )}

                    {/* 标题覆盖在图片上 */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white/80 text-xs mb-0.5">{promo.subtitle}</p>
                      <h4 className="text-white font-semibold text-base">
                        {promo.title}
                      </h4>
                    </div>
                  </div>

                  {/* 内容区 */}
                  <div className="p-4 bg-gradient-to-b" style={{
                    background: `linear-gradient(to bottom, ${promo.color.includes('amber') ? '#fffbeb' : promo.color.includes('blue') ? '#eff6ff' : '#ecfdf5'}, white)`
                  }}>
                    {/* 奖励金额 */}
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className={`text-2xl font-bold bg-gradient-to-r ${promo.color} bg-clip-text text-transparent`}>
                        {promo.reward}
                      </span>
                    </div>

                    {/* 参与按钮 */}
                    <Link
                      href={`/portal/activity/promotions/${promo.id}`}
                      className={`group/btn flex items-center justify-center gap-2 w-full py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        promo.tag === '限时' 
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600' :
                        promo.tag === '热门'
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600' :
                          'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                      }`}
                    >
                      立即参与
                      <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
