"use client";

import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { Clock, AlertCircle } from "lucide-react";

export default function NewsFlashPage() {
  const flashNews = [
    {
      time: "14:32",
      content: "USD/JPY breaks above 150.00, highest level since November 2023",
      importance: "high",
    },
    {
      time: "14:28",
      content: "Gold spot price reaches $2,180/oz, up 0.8% on the day",
      importance: "medium",
    },
    {
      time: "14:15",
      content: "European markets close higher: DAX +0.9%, CAC 40 +0.7%, FTSE 100 +0.5%",
      importance: "medium",
    },
    {
      time: "14:05",
      content: "Breaking: Major central bank announces emergency liquidity measures",
      importance: "high",
    },
    {
      time: "13:58",
      content: "Crude oil WTI futures rise 2.3% to $78.50 per barrel",
      importance: "medium",
    },
    {
      time: "13:45",
      content: "Bitcoin briefly touches $67,000 before retracing",
      importance: "low",
    },
    {
      time: "13:30",
      content: "US Initial Jobless Claims: 215K vs 210K expected",
      importance: "high",
    },
    {
      time: "13:22",
      content: "Tesla announces new manufacturing facility in Southeast Asia",
      importance: "low",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="News Flash"
        description="Real-time market updates and breaking news"
      />

      {/* Live Indicator */}
      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium text-green-700">Live Updates</span>
        <span className="text-xs text-green-600 ml-auto">Auto-refresh every 30s</span>
      </div>

      {/* Flash News Timeline */}
      <div className="space-y-3">
        {flashNews.map((news, index) => (
          <div
            key={index}
            className="bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-blue-300 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center min-w-[60px]">
                <span className="text-sm font-semibold text-gray-900">{news.time}</span>
                <div className="w-px h-full bg-gray-200 mt-2" />
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  {news.importance === "high" && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 text-xs font-medium rounded border border-red-200">
                      <AlertCircle className="w-3 h-3" />
                      High Impact
                    </span>
                  )}
                  {news.importance === "medium" && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-200">
                      Medium Impact
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-800">{news.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
