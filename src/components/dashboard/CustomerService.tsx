"use client";

import { Headphones, MessageCircle, Phone, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function CustomerService() {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Headphones size={16} className="text-white" />
          </div>
          <h3 className="font-semibold text-slate-900">专属客服</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-600 font-medium">在线</span>
        </div>
      </div>

      {/* Agent Profile */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-4"
      >
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center border-2 border-white shadow-md">
            <span className="text-xl">👨‍💼</span>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
        </div>
        <div>
          <div className="font-medium text-slate-900">Alex Chen</div>
          <div className="text-xs text-slate-400">您的专属客户经理</div>
          <div className="text-xs text-slate-400 mt-0.5">工作时间: 9:00-21:00</div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Link
          href="/portal/support/chat"
          className="flex items-center justify-center gap-2 p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-sm font-medium transition-colors"
        >
          <MessageCircle size={16} />
          立即咨询
        </Link>
        <Link
          href="/portal/support/callback"
          className="flex items-center justify-center gap-2 p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-medium transition-colors"
        >
          <Phone size={16} />
          预约回电
        </Link>
      </div>

      {/* Quick Links */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <Link 
          href="/portal/support/faq"
          className="flex items-center justify-between text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Calendar size={14} />
            查看常见问题
          </span>
          <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
