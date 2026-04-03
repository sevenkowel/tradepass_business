"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shield, CheckCircle, DollarSign, Users } from "lucide-react";
import Link from "next/link";

export default function MAMMBecomeManagerPage() {
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
          <h1 className="text-2xl font-bold text-slate-900">Become a MAMM Manager</h1>
          <p className="text-slate-500">Manage multiple accounts and earn performance fees</p>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Performance Fees</h3>
          <p className="text-sm text-slate-500">Earn up to 35% performance fee on profits generated for investors</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Scale Your Trading</h3>
          <p className="text-sm text-slate-500">Manage multiple accounts with flexible allocation methods</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 border border-slate-200"
        >
          <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-slate-900 mb-2">Advanced Tools</h3>
          <p className="text-sm text-slate-500">Access professional risk management and reporting tools</p>
        </motion.div>
      </div>

      {/* Requirements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-xl p-6 border border-slate-200"
      >
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Requirements</h2>
        <div className="space-y-3">
          {[
            "Verified trading account with minimum $25,000 balance",
            "At least 12 months of consistent trading history",
            "Demonstrated profitability over the past 6 months",
            "Complete KYC and professional verification",
            "Pass MAMM Manager Assessment Test",
            "Agree to MAMM Manager Terms & Conditions",
          ].map((req, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-slate-600">{req}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white text-center"
      >
        <h3 className="text-lg font-semibold mb-2">Ready to become a MAMM manager?</h3>
        <p className="text-indigo-100 mb-4">Start managing multiple accounts and earn higher performance fees</p>
        <button className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors">
          Apply Now
        </button>
      </motion.div>
    </div>
  );
}
