"use client";

import { Bell, ChevronRight, Megaphone, Info, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface Announcement {
  id: string;
  title: string;
  date: string;
  important: boolean;
  type: "important" | "info" | "update";
}

const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "系统维护通知：4月5日凌晨2:00-4:00",
    date: "2026-04-02",
    important: true,
    type: "important",
  },
  {
    id: "2",
    title: "黄金交易时间调整公告",
    date: "2026-04-01",
    important: false,
    type: "update",
  },
  {
    id: "3",
    title: "新版本 App 已上线，欢迎更新体验",
    date: "2026-03-30",
    important: false,
    type: "info",
  },
];

const typeConfig = {
  important: {
    icon: AlertTriangle,
    bgColor: "bg-amber-50",
    iconColor: "text-amber-500",
    borderColor: "border-amber-100",
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-500",
    borderColor: "border-blue-100",
  },
  update: {
    icon: Megaphone,
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-500",
    borderColor: "border-emerald-100",
  },
};

export function Announcements() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 h-full"
    >
      {/* 头部 */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
            <Bell size={18} className="text-slate-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">公告通知</h3>
        </div>
        <Link
          href="/portal/support/announcements"
          className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-0.5 transition-colors"
        >
          查看全部
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* 公告列表 */}
      <div className="space-y-3">
        {mockAnnouncements.map((announcement, index) => {
          const config = typeConfig[announcement.type];
          const Icon = config.icon;
          return (
            <motion.div
              key={announcement.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={`/portal/support/announcements/${announcement.id}`}
                className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all duration-200 group"
              >
                {/* 类型图标 */}
                <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center shrink-0`}>
                  <Icon size={20} className={config.iconColor} />
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-1">
                      {announcement.title}
                    </p>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors shrink-0 mt-0.5" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{announcement.date}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
