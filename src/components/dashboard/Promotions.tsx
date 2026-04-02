"use client";

import { ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

interface Promotion {
  id: string;
  title: string;
  reward: string;
  status: "available" | "joined" | "ended";
  endTime?: string;
}

const mockPromotions: Promotion[] = [
  {
    id: "1",
    title: "存款送彩金 50%",
    reward: "$100 Bonus",
    status: "available",
    endTime: "02:12:33",
  },
  {
    id: "2",
    title: "邀请好友赚佣金",
    reward: "最高 $500",
    status: "available",
  },
];

export function Promotions() {
  return (
    <section className="py-6 border-b border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900">热门活动</h3>
        <Link
          href="/portal/activity/promotions"
          className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-0.5"
        >
          全部
          <ChevronRight size={14} />
        </Link>
      </div>

      <div className="space-y-3">
        {mockPromotions.map((promo) => (
          <div
            key={promo.id}
            className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
          >
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">
                {promo.title}
              </h4>
              <p className="text-xs text-gray-500">奖励: {promo.reward}</p>
              {promo.endTime && (
                <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                  <Clock size={12} />
                  <span>倒计时: {promo.endTime}</span>
                </div>
              )}
            </div>
            <Link
              href={`/portal/activity/promotions/${promo.id}`}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
            >
              参与
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
