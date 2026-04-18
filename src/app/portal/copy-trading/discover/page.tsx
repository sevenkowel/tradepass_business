"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, TrendingDown, Star, Copy, Shield, BarChart2, Filter, Search } from "lucide-react";
import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { formatPercent, cn } from "@/lib/utils";

const mockTraders = [
  { id: 1, name: "AlphaEdge Pro", avatar: "AE", color: "#1E40AF", roi: 142.8, monthlyRoi: 12.4, drawdown: 8.2, followers: 1240, aum: 4820000, winRate: 72, trades: 380, since: "2023-01", level: "Master", tag: "TOP" },
  { id: 2, name: "Quantum Scalper", avatar: "QS", color: "#635BFF", roi: 98.4, monthlyRoi: 8.7, drawdown: 6.8, followers: 2100, aum: 7200000, winRate: 68, trades: 1420, since: "2022-08", level: "Master", tag: "POPULAR" },
  { id: 3, name: "FX Sentinel", avatar: "FS", color: "#FFB020", roi: 87.5, monthlyRoi: 7.2, drawdown: 12.1, followers: 680, aum: 2100000, winRate: 65, trades: 290, since: "2023-06", level: "Pro", tag: null },
  { id: 4, name: "TechWave FX", avatar: "TW", color: "#FF4D4F", roi: 76.3, monthlyRoi: 6.1, drawdown: 9.4, followers: 540, aum: 1680000, winRate: 70, trades: 410, since: "2023-03", level: "Pro", tag: null },
  { id: 5, name: "PrimeTrend", avatar: "PT", color: "#52C41A", roi: 64.1, monthlyRoi: 5.3, drawdown: 7.9, followers: 380, aum: 920000, winRate: 63, trades: 185, since: "2024-01", level: "Advanced", tag: "NEW" },
  { id: 6, name: "SafeHarbor", avatar: "SH", color: "#0A2540", roi: 38.2, monthlyRoi: 3.1, drawdown: 4.1, followers: 890, aum: 3400000, winRate: 78, trades: 520, since: "2022-05", level: "Master", tag: "LOW RISK" },
];

function TraderCard({ trader, rank }: { trader: (typeof mockTraders)[0]; rank: number }) {
  const [copying, setCopying] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.05 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all overflow-hidden"
    >
      {/* Top bar - trader's color accent */}
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${trader.color}, transparent)` }} />

      <div className="p-5">
        {/* Avatar + name */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                style={{ background: `linear-gradient(135deg, ${trader.color}, ${trader.color}99)` }}
              >
                {trader.avatar}
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-[9px] font-bold text-gray-500">
                #{rank}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-800">{trader.name}</span>
                {trader.tag && (
                  <span className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded-md border",
                    trader.tag === "TOP"       ? "bg-blue-50 text-blue-700 border-blue-200"
                    : trader.tag === "POPULAR" ? "bg-purple-50 text-purple-700 border-purple-200"
                    : trader.tag === "NEW"     ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : trader.tag === "LOW RISK"? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-gray-50 text-gray-500 border-gray-200"
                  )}>
                    {trader.tag}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] text-gray-400 font-medium">{trader.level}</span>
                <span className="text-gray-300">·</span>
                <span className="text-[11px] text-gray-400">{trader.followers.toLocaleString()} followers</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={10} className={s <= 4 ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
            <p className="text-[10px] text-emerald-600 font-medium mb-1">Total ROI</p>
            <p className="text-sm font-bold text-emerald-700">+{trader.roi}%</p>
          </div>
          <div className="text-center p-2.5 rounded-xl bg-red-50 border border-red-100">
            <p className="text-[10px] text-red-500 font-medium mb-1">Max DD</p>
            <p className="text-sm font-bold text-red-600">-{trader.drawdown}%</p>
          </div>
          <div className="text-center p-2.5 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-[10px] text-blue-600 font-medium mb-1">Win Rate</p>
            <p className="text-sm font-bold text-blue-700">{trader.winRate}%</p>
          </div>
        </div>

        {/* Mini ROI bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1.5">
            <span>Monthly: <span className="text-emerald-600 font-bold">+{trader.monthlyRoi}%</span></span>
            <span>AUM: ${(trader.aum / 1000000).toFixed(1)}M</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100">
            <div className="h-full rounded-full" style={{ width: `${Math.min(trader.roi / 1.5, 100)}%`, background: trader.color }} />
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setCopying(true)}
          className={cn(
            "w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm",
            copying
              ? "bg-blue-50 text-blue-700 border-2 border-blue-300"
              : "bg-blue-600 text-white hover:bg-blue-700"
          )}
        >
          <Copy size={14} />
          {copying ? "Copying..." : "Copy Trader"}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function DiscoverTradersPage() {
  const [sortBy, setSortBy] = useState<"roi" | "drawdown" | "followers">("roi");
  const [search, setSearch] = useState("");

  const sorted = [...mockTraders]
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "roi") return b.roi - a.roi;
      if (sortBy === "drawdown") return a.drawdown - b.drawdown;
      return b.followers - a.followers;
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Discover Traders"
        description="Find top-performing traders and start copying their strategies."
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search traders..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Sort by:</span>
          {(["roi", "drawdown", "followers"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2",
                sortBy === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-gray-500 bg-white border-gray-200 hover:border-blue-300 hover:text-blue-600"
              )}
            >
              {s === "roi" ? "ROI" : s === "drawdown" ? "Low Risk" : "Popular"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map((trader, i) => (
          <TraderCard key={trader.id} trader={trader} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}
