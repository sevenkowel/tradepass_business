"use client";

import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Users, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function PAMMOverviewPage() {
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
          <h1 className="text-2xl font-bold text-slate-900">PAMM Overview</h1>
          <p className="text-slate-500">Understanding PAMM investment</p>
        </div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 border border-slate-200"
      >
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            What is PAMM?
          </h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            PAMM (Percentage Allocation Management Module) is a trading allocation system 
            that allows investors to allocate their funds to experienced traders (managers) 
            who trade on their behalf. Profits and losses are distributed proportionally 
            based on each investor&apos;s contribution to the total pool.
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="font-medium text-slate-900 mb-2">1. Choose Manager</h4>
              <p className="text-sm text-slate-500">Browse and select from verified professional traders</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-medium text-slate-900 mb-2">2. Invest Funds</h4>
              <p className="text-sm text-slate-500">Allocate your capital to the chosen manager&apos;s pool</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-slate-900 mb-2">3. Earn Returns</h4>
              <p className="text-sm text-slate-500">Receive proportional profits based on performance</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Key Benefits</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Professional management by experienced traders</li>
              <li>• Transparent performance tracking and reporting</li>
              <li>• Flexible investment amounts starting from $100</li>
              <li>• Automatic profit/loss distribution</li>
              <li>• Full control over your investments</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
