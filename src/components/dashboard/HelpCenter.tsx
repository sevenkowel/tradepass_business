"use client";

import { BookOpen, PlayCircle, Shield, ChevronRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const guides = [
  {
    icon: PlayCircle,
    title: "快速入门",
    desc: "3分钟完成开户",
    href: "/portal/help/getting-started",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: BookOpen,
    title: "交易基础",
    desc: "如何下单平仓",
    href: "/portal/help/trading-basics",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
  },
  {
    icon: Shield,
    title: "风险管理",
    desc: "设置止损止盈",
    href: "/portal/help/risk-management",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
];

export function HelpCenter() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <GraduationCap size={16} className="text-white" />
          </div>
          <h3 className="font-semibold text-slate-900">新手学堂</h3>
        </div>
        <Link 
          href="/portal/help"
          className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-0.5 transition-colors"
        >
          查看全部
          <ChevronRight size={12} />
        </Link>
      </div>

      {/* Guide Cards */}
      <div className="space-y-2">
        {guides.map((guide, index) => (
          <motion.div
            key={guide.title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              href={guide.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
            >
              <div className={`w-10 h-10 ${guide.bgColor} rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <guide.icon size={18} className={guide.color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-slate-900">{guide.title}</div>
                <div className="text-xs text-slate-400">{guide.desc}</div>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
