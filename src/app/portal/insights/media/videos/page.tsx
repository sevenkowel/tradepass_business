"use client";

import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { Play, Eye } from "lucide-react";

export default function VideosPage() {
  const videos = [
    {
      title: "Technical Analysis: EUR/USD Key Levels for This Week",
      thumbnail: "EUR/USD Analysis",
      duration: "12:34",
      views: "2.4K",
      author: "TradePass Academy",
      category: "Technical Analysis",
    },
    {
      title: "Understanding Central Bank Policies: A Beginner's Guide",
      thumbnail: "Central Banks",
      duration: "18:45",
      views: "5.1K",
      author: "Market Education",
      category: "Education",
    },
    {
      title: "Gold Trading Strategies for Volatile Markets",
      thumbnail: "Gold Trading",
      duration: "15:20",
      views: "3.8K",
      author: "Pro Trader Series",
      category: "Strategy",
    },
    {
      title: "Risk Management: Position Sizing Explained",
      thumbnail: "Risk Management",
      duration: "10:15",
      views: "4.2K",
      author: "TradePass Academy",
      category: "Risk Management",
    },
    {
      title: "Crypto vs Forex: Key Differences Traders Should Know",
      thumbnail: "Crypto vs Forex",
      duration: "14:30",
      views: "6.7K",
      author: "Market Education",
      category: "Education",
    },
    {
      title: "Scalping Techniques for MT5 Platform",
      thumbnail: "Scalping",
      duration: "22:10",
      views: "1.9K",
      author: "Pro Trader Series",
      category: "Strategy",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Videos"
        description="Educational content and market analysis videos"
      />

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {["All", "Technical Analysis", "Education", "Strategy", "Risk Management"].map(
          (category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                category === "All"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300"
              }`}
            >
              {category}
            </button>
          )
        )}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <div
            key={index}
            className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
              <span className="text-lg font-semibold text-blue-800/50">{video.thumbnail}</span>
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all">
                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                  <Play className="w-6 h-6 text-blue-600 ml-1" />
                </div>
              </div>
              <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded-md">
                {video.duration}
              </span>
            </div>

            {/* Info */}
            <div className="p-4">
              <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200 mb-2">
                {video.category}
              </span>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                {video.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{video.author}</span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {video.views}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
