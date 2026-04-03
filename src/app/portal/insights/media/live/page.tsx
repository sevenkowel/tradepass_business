"use client";

import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { Users, Clock, AlertCircle } from "lucide-react";

export default function LivePage() {
  const liveStreams = [
    {
      title: "Live Market Analysis - London Session",
      host: "Sarah Chen",
      viewers: "1,234",
      status: "live",
      category: "Market Analysis",
    },
    {
      title: "Trading Psychology Workshop",
      host: "Dr. Michael Torres",
      viewers: "892",
      status: "live",
      category: "Education",
    },
  ];

  const upcomingStreams = [
    {
      title: "Pre-Market Briefing - US Session",
      host: "James Wilson",
      time: "Today, 14:00 UTC",
      category: "Market Analysis",
    },
    {
      title: "Weekly Technical Outlook",
      host: "Sarah Chen",
      time: "Tomorrow, 10:00 UTC",
      category: "Technical Analysis",
    },
    {
      title: "Risk Management Masterclass",
      host: "Dr. Michael Torres",
      time: "Apr 4, 16:00 UTC",
      category: "Education",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live"
        description="Watch live streams and upcoming broadcasts"
      />

      {/* Live Now Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Live Now
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {liveStreams.map((stream, index) => (
            <div
              key={index}
              className="bg-white border-2 border-red-200 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-lg border border-red-200">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  LIVE
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  {stream.viewers} watching
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{stream.title}</h3>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                  {stream.host.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{stream.host}</p>
                  <p className="text-xs text-gray-500">{stream.category}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming</h2>
        <div className="space-y-3">
          {upcomingStreams.map((stream, index) => (
            <div
              key={index}
              className="bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-blue-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{stream.title}</h3>
                    <p className="text-xs text-gray-500">
                      {stream.host} • {stream.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{stream.time}</p>
                  <button className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1">
                    Remind Me
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          Enable notifications to get alerted when your favorite streamers go live.
        </p>
        <button className="ml-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Enable
        </button>
      </div>
    </div>
  );
}
