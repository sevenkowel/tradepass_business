"use client";

import { Newspaper, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
  impact: "high" | "medium" | "low";
}

const mockNews: NewsItem[] = [
  {
    id: "1",
    title: "美联储利率决议公布，维持利率不变",
    source: "财联社",
    time: "15分钟前",
    impact: "high",
  },
  {
    id: "2",
    title: "美国非农就业数据超预期，美元走强",
    source: "FX168",
    time: "1小时前",
    impact: "high",
  },
  {
    id: "3",
    title: "地缘政治风险升温，黄金避险需求增加",
    source: "路透社",
    time: "2小时前",
    impact: "medium",
  },
];

const impactConfig = {
  high: { color: "bg-rose-100 text-rose-700", label: "高" },
  medium: { color: "bg-amber-100 text-amber-700", label: "中" },
  low: { color: "bg-slate-100 text-slate-600", label: "低" },
};

export function MarketNews() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 h-full"
    >
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Newspaper size={18} className="text-white" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">市场快讯</h3>
        </div>
        <Link
          href="/portal/news"
          className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-0.5 transition-colors"
        >
          更多
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* 新闻列表 */}
      <div className="space-y-3">
        {mockNews.map((news, index) => {
          const impact = impactConfig[news.impact];
          return (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group cursor-pointer"
            >
              <Link href={`/portal/news/${news.id}`}>
                <div className="flex items-start gap-3">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${impact.color} shrink-0 mt-0.5`}>
                    {impact.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2">
                      {news.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{news.source}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-xs text-slate-400 flex items-center gap-0.5">
                        <Clock size={10} />
                        {news.time}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
