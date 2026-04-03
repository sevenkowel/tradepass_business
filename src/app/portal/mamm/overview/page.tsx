"use client";

import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Users, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function MAMMOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/portal/mamm">
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">MAMM Overview</h1>
          <p className="text-slate-500">Understanding MAMM investment</p>
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
            What is MAMM?
          </h2>
          <p className="text-slate-600 mb-6 leading-relaxed">
            MAMM (Multi-Account Management Module) is an advanced trading allocation system 
            that allows professional traders to manage multiple investor accounts simultaneously 
            from a single master account. Unlike PAMM, MAMM allows for more flexible allocation 
            methods including lot-based and percentage-based allocation.
          </p>

          <h3 className="text-lg font-semibold text-slate-900 mb-4">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-3">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="font-medium text-slate-900 mb-2">1. Choose Manager</h4>
              <p className="text-sm text-slate-500">Select from verified professional traders</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="font-medium text-slate-900 mb-2">2. Set Allocation</h4>
              <p className="text-sm text-slate-500">Choose your preferred allocation method</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="font-medium text-slate-900 mb-2">3. Track Performance</h4>
              <p className="text-sm text-slate-500">Monitor returns in real-time</p>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
            <h4 className="font-medium text-indigo-900 mb-2">Key Benefits</h4>
            <ul className="space-y-2 text-sm text-indigo-800">
              <li>• Flexible allocation methods (lot-based or percentage-based)</li>
              <li>• Professional management by experienced traders</li>
              <li>• Real-time performance monitoring</li>
              <li>• Suitable for larger investment amounts</li>
              <li>• Advanced risk management options</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
