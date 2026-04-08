"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Filter,
} from "lucide-react";
import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { SignalCard } from "@/components/ai-signals";
import { mockSignals, filterSignalsByDirection } from "@/lib/ai-signals";
import { cn } from "@/lib/utils";

export default function AISignalsFeedPage() {
  const [savedIds, setSavedIds] = useState<Set<string | number>>(new Set());
  const [filter, setFilter] = useState<"all" | "buy" | "sell">("all");

  const toggleSave = (id: string | number) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = filterSignalsByDirection(mockSignals, filter.toUpperCase() as "all" | "BUY" | "SELL");

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Signals"
        description="AI-powered trading signals with real-time confidence scores."
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
              <Zap size={12} />
              <span>15 / 20 daily signals used</span>
            </div>
          </div>
        }
      />

      {/* Quota bar */}
      <div className="p-4 rounded-2xl bg-white border-2 border-gray-200 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
          <Zap size={18} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500">Daily Quota</span>
            <span className="font-bold text-gray-900">15 / 20 signals</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 border border-gray-200">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: "75%" }} />
          </div>
        </div>
        <button className="text-xs font-bold text-blue-600 hover:text-blue-700 shrink-0">
          Upgrade
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(["all", "buy", "sell"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-xl text-sm font-semibold transition-all border-2",
              filter === f
                ? f === "buy" ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : f === "sell" ? "bg-red-50 text-red-700 border-red-300"
                  : "bg-blue-50 text-blue-700 border-blue-300"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 text-xs text-gray-500 cursor-pointer hover:text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-xl">
          <Filter size={13} />
          Filter
        </div>
      </div>

      {/* Signal grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((signal) => (
          <SignalCard
            key={signal.id}
            signal={signal}
            variant="default"
            saved={savedIds.has(signal.id)}
            onSave={() => toggleSave(signal.id)}
          />
        ))}
      </div>
    </div>
  );
}
