"use client";

import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Wallet, Clock } from "lucide-react";
import Link from "next/link";

const investments = [
  {
    id: 1,
    manager: "Alpha Trader",
    invested: "$5,000",
    current: "$5,625",
    profit: "+$625",
    profitPercent: "+12.5%",
    since: "2024-01-15",
  },
  {
    id: 2,
    manager: "Beta Strategies",
    invested: "$3,000",
    current: "$3,249",
    profit: "+$249",
    profitPercent: "+8.3%",
    since: "2024-02-01",
  },
];

export default function PAMMMyInvestmentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/portal/pamm">
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My PAMM Investments</h1>
          <p className="text-slate-500">Track your investment performance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-500">Total Invested</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">$8,000</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-500">Current Value</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">$8,874</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-500">Total Profit</span>
          </div>
          <p className="text-2xl font-bold text-green-600">+$874 (+10.9%)</p>
        </motion.div>
      </div>

      {/* Investments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl border border-slate-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Active Investments</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {investments.map((inv) => (
            <div key={inv.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">{inv.manager}</h3>
                  <p className="text-sm text-slate-500">Since {inv.since}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{inv.current}</p>
                  <p className="text-sm text-green-600">{inv.profit}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <span className="text-slate-500">Invested:</span>
                  <span className="ml-2 text-slate-900">{inv.invested}</span>
                </div>
                <div>
                  <span className="text-slate-500">Return:</span>
                  <span className="ml-2 text-green-600">{inv.profitPercent}</span>
                </div>
                <div className="text-right">
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
