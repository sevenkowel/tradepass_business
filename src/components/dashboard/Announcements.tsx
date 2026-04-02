"use client";

import { Bell, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Announcement {
  id: string;
  title: string;
  date: string;
  important: boolean;
}

const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "系统维护通知：4月5日凌晨2:00-4:00",
    date: "2026-04-02",
    important: true,
  },
  {
    id: "2",
    title: "黄金交易时间调整公告",
    date: "2026-04-01",
    important: false,
  },
];

export function Announcements() {
  return (
    <section className="py-6 border-b border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">公告通知</h3>
        <Link
          href="/portal/support/announcements"
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-0.5"
        >
          全部
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="space-y-2">
        {mockAnnouncements.map((announcement) => (
          <Link
            key={announcement.id}
            href={`/portal/support/announcements/${announcement.id}`}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Bell
              size={16}
              className={`mt-0.5 shrink-0 ${
                announcement.important ? "text-orange-500" : "text-gray-400"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">
                {announcement.important && (
                  <span className="text-orange-600 mr-1">[重要]</span>
                )}
                {announcement.title}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{announcement.date}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
