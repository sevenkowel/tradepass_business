"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users, Heart, Trophy } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// 运营 Banner 数据
const banners = [
  {
    id: 1,
    type: "exhibition",
    typeLabel: "展会活动",
    typeIcon: Trophy,
    title: "2026 迪拜外汇博览会",
    subtitle: "TradePass 作为金牌赞助商参展",
    date: "2026.05.15 - 05.17",
    location: "迪拜世界贸易中心",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    link: "#exhibition-dubai",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: 2,
    type: "offline",
    typeLabel: "线下活动",
    typeIcon: Users,
    title: "上海交易者交流会",
    subtitle: "与资深交易员面对面分享策略",
    date: "2026.04.20",
    location: "上海陆家嘴金融中心",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop",
    link: "#event-shanghai",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: 3,
    type: "charity",
    typeLabel: "公益慈善",
    typeIcon: Heart,
    title: "TradePass 公益基金",
    subtitle: "每笔交易贡献一份力量",
    date: "长期进行",
    location: "全球",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=400&fit=crop",
    link: "#charity",
    color: "from-emerald-500 to-teal-600",
  },
];

export function AccountOverview() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const currentBanner = banners[currentIndex];
  const TypeIcon = currentBanner.typeIcon;

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-slate-900 shadow-xl h-[280px] group"
    >
      {/* 背景图片 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <img
            src={currentBanner.image}
            alt={currentBanner.title}
            className="w-full h-full object-cover"
          />
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* 内容 */}
      <div className="relative z-10 h-full flex flex-col justify-between p-6">
        {/* 顶部：类型标签 + 指示器 */}
        <div className="flex items-center justify-between">
          <motion.div
            key={`type-${currentBanner.id}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${currentBanner.color} text-white text-sm font-medium`}
          >
            <TypeIcon size={14} />
            {currentBanner.typeLabel}
          </motion.div>

          {/* 轮播指示器 */}
          <div className="flex items-center gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-6 bg-white"
                    : "bg-white/40 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 中部：标题和内容 */}
        <div className="max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${currentBanner.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {currentBanner.title}
              </h2>
              <p className="text-slate-300 text-base mb-4">
                {currentBanner.subtitle}
              </p>

              {/* 日期和地点 */}
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {currentBanner.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {currentBanner.location}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 底部：操作按钮 */}
        <div className="flex items-center justify-between">
          <Link
            href={currentBanner.link}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r ${currentBanner.color} text-white font-medium hover:opacity-90 transition-opacity`}
          >
            了解详情
            <ChevronRight size={16} />
          </Link>

          {/* 左右切换按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToPrev}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={goToNext}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// 保留 QuickActions 导出（虽然当前未使用）
export function QuickActions() {
  return null;
}
