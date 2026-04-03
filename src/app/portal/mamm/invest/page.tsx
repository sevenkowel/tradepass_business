"use client";

import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Star, Filter } from "lucide-react";
import Link from "next/link";

const managers = [
  {
    id: 1,
    name: "Sigma Capital",
    return30d: "+9.8%",
    returnAll: "+124%",
    investors: 156,
    aum: "$4.2M",
    risk: "Medium",
    rating: 4.7,
  },
  {
    id: 2,
    name: "Delta Fund",
    return30d: "+6.5%",
    returnAll: "+78%",
    investors: 98,
    aum: "$2.1M",
    risk: "Low",
    rating: 4.5,
  },
  {
    id: 3,
    name: "Omega Trading",
    return30d: "+14.3%",
    returnAll: "+189%",
    investors: 267,
    aum: "$5.8M",
    risk: "High",
    rating: 4.8,
  },
];

export default function MAMMInvestPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/portal/mamm">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Invest in MAMM</h1>
            <p className="text-slate-500">Browse and select top-performing managers</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filter</span>
        </button>
      </div>

      {/* Managers List */}
      <div className="space-y-4">
        {managers.map((manager, index) => (
          <motion.div
            key={manager.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                  {manager.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{manager.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-slate-600">{manager.rating}</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-sm text-slate-500">{manager.investors} investors</span>
                  </div>
                </div>
              </div>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Invest
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500 mb-1">30D Return</p>
                <p className="text-lg font-semibold text-green-600">{manager.return30d}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">All Time</p>
                <p className="text-lg font-semibold text-green-600">{manager.returnAll}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">AUM</p>
                <p className="text-lg font-semibold text-slate-900">{manager.aum}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Risk Level</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  manager.risk === "Low" ? "bg-green-100 text-green-700" :
                  manager.risk === "Medium" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {manager.risk}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
