"use client";

import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { TrendingUp, Clock, Globe } from "lucide-react";

export default function MarketNewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Market News"
        description="Latest financial headlines and market analysis"
      />

      {/* Featured News */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 mb-2">
              Featured
            </span>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Federal Reserve Signals Potential Rate Cuts in Coming Months
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              The Federal Reserve hinted at possible interest rate reductions as inflation shows signs of cooling, 
              sparking optimism in equity markets and affecting currency pairs across the board.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                2 hours ago
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Reuters
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="grid gap-4">
        {[
          {
            title: "Oil Prices Surge Amid Middle East Tensions",
            summary: "Crude oil benchmarks rose sharply as geopolitical concerns in the Middle East reignited supply worries.",
            time: "4 hours ago",
            source: "Bloomberg",
            tag: "Commodities",
            tagColor: "amber",
          },
          {
            title: "Tech Stocks Lead Market Rally on AI Optimism",
            summary: "Major technology companies posted gains as investors remain bullish on artificial intelligence developments.",
            time: "5 hours ago",
            source: "CNBC",
            tag: "Technology",
            tagColor: "purple",
          },
          {
            title: "ECB Maintains Interest Rates Amid Economic Uncertainty",
            summary: "The European Central Bank kept rates steady, citing persistent inflation concerns in the eurozone.",
            time: "6 hours ago",
            source: "Financial Times",
            tag: "Forex",
            tagColor: "emerald",
          },
          {
            title: "Gold Hits New Highs as Safe-Haven Demand Increases",
            summary: "Precious metals continue to attract investors seeking shelter from market volatility.",
            time: "8 hours ago",
            source: "MarketWatch",
            tag: "Metals",
            tagColor: "yellow",
          },
        ].map((news, index) => (
          <div
            key={index}
            className="bg-white border-2 border-gray-200 rounded-2xl p-5 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-block px-2 py-0.5 bg-${news.tagColor}-50 text-${news.tagColor}-700 text-xs font-medium rounded border border-${news.tagColor}-200`}>
                    {news.tag}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {news.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{news.summary}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {news.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {news.source}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
