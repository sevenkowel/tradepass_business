"use client";

import { Star, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const awards = [
  { name: "MOST TRUSTED BROKER", year: "2025", org: "CNN" },
  { name: "BEST AFFILIATE BROKER IN ASIA", year: "2025", org: "International Investor Magazine" },
  { name: "MOST TRANSPARENT GLOBAL BROKER", year: "2025", org: "International Investor Magazine" },
  { name: "BEST INNOVATION FOREX BROKER", year: "2024", org: "Money Expo India" },
];

export function TrustBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-100 rounded-2xl p-6"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* 左侧：App Store 评分 + SSL */}
        <div className="flex items-center gap-8">
          {/* App Store */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-slate-900">App Store</span>
                <div className="flex">
                  {[1,2,3,4].map((i) => (
                    <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                  ))}
                  <Star size={12} className="text-amber-400 fill-amber-400/50" />
                </div>
                <span className="text-sm font-semibold text-slate-900">4.8</span>
              </div>
            </div>
          </div>

          {/* SSL Trust */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Trusted by</span>
            <div className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-slate-200">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-sm font-medium text-slate-600">digicert</span>
              <span className="text-xs text-slate-400">SECURE</span>
            </div>
          </div>
        </div>

        {/* 右侧：奖项徽章 */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          {awards.map((award, index) => (
            <div key={index} className="flex flex-col items-center text-center px-3">
              {/* 月桂花环图标 */}
              <div className="relative mb-1">
                <svg viewBox="0 0 60 40" className="w-14 h-10">
                  {/* 左侧月桂 */}
                  <path 
                    d="M30 35 Q20 30 15 20 Q10 10 12 5 Q15 8 18 12 Q20 15 22 20 Q24 25 25 30 Q28 32 30 35" 
                    fill="none" 
                    stroke="#94a3b8" 
                    strokeWidth="1"
                  />
                  <path 
                    d="M30 35 Q40 30 45 20 Q50 10 48 5 Q45 8 42 12 Q40 15 38 20 Q36 25 35 30 Q32 32 30 35" 
                    fill="none" 
                    stroke="#94a3b8" 
                    strokeWidth="1"
                  />
                  {/* 叶子装饰 */}
                  <ellipse cx="15" cy="15" rx="3" ry="6" fill="#94a3b8" transform="rotate(-30 15 15)"/>
                  <ellipse cx="45" cy="15" rx="3" ry="6" fill="#94a3b8" transform="rotate(30 45 15)"/>
                  <ellipse cx="18" cy="22" rx="2.5" ry="5" fill="#94a3b8" transform="rotate(-20 18 22)"/>
                  <ellipse cx="42" cy="22" rx="2.5" ry="5" fill="#94a3b8" transform="rotate(20 42 22)"/>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-slate-500 leading-tight text-center px-1">
                    {award.year}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-semibold text-slate-600 uppercase tracking-tight leading-tight max-w-[80px]">
                {award.name}
              </span>
              <span className="text-[8px] text-slate-400 mt-0.5">{award.org}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
