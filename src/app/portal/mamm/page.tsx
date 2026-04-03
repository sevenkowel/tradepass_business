"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, BarChart3, Shield } from "lucide-react";
import Link from "next/link";

export default function MAMMPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">MAMM</h1>
          <p className="text-slate-500 mt-1">Multi-Account Management Module</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Active Managers</p>
              <p className="text-2xl font-bold text-slate-900">86</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total AUM</p>
              <p className="text-2xl font-bold text-slate-900">$32.8M</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Avg. Monthly Return</p>
              <p className="text-2xl font-bold text-slate-900">+7.2%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/portal/mamm/invest">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          >
            <TrendingUp className="w-8 h-8 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Invest in MAMM</h3>
            <p className="text-indigo-100 text-sm">Browse top-performing managers and start investing</p>
          </motion.div>
        </Link>

        <Link href="/portal/mamm/become-manager">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow"
          >
            <Shield className="w-8 h-8 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Become a Manager</h3>
            <p className="text-slate-300 text-sm">Manage multiple accounts and earn performance fees</p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}
