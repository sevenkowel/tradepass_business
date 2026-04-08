"use client";

import { Check, ChevronRight, Loader2, AlertCircle, RefreshCw, Sparkles, Shield, UserCircle, FileCheck, TrendingUp, ArrowRight } from "lucide-react";
import Link from "next/link";
import { UserPerspective } from "@/types/user";
import { useOnboardingPhase } from "@/lib/kyc/use-onboarding-phase";
import { PHASE_CONFIGS, THEME_COLORS } from "@/lib/kyc/onboarding-phase";
import { motion, AnimatePresence } from "framer-motion";

interface OnboardingFunnelProps {
  user: UserPerspective;
}

// 图标映射
const stepIcons: Record<string, typeof Check> = {
  register: UserCircle,
  kyc: Shield,
  account: FileCheck,
  deposit: Sparkles,
  trade: TrendingUp,
};

// 步骤预估时间
const stepTimeEstimate: Record<string, string> = {
  register: "已完成",
  kyc: "预计 2-3 分钟",
  account: "预计 1 分钟",
  deposit: "即时到账",
  trade: "随时开始",
};

// 根据任务状态获取图标
function getTaskIcon(status: string, config: typeof PHASE_CONFIGS[keyof typeof PHASE_CONFIGS]) {
  switch (status) {
    case "completed":
      return Check;
    case "reviewing":
      return Loader2;
    case "rejected":
      return AlertCircle;
    case "in_progress":
      return RefreshCw;
    default:
      return config.icon;
  }
}

export function OnboardingFunnel({ user }: OnboardingFunnelProps) {
  const { phase, config, isCompleted } = useOnboardingPhase(user);
  const theme = THEME_COLORS[config.theme];
  const TaskIcon = getTaskIcon(config.task.status, config);

  // 已完成时隐藏组件
  if (isCompleted) return null;

  // 动画配置（根据状态）
  const isReviewing = config.task.status === "reviewing";
  const isRejected = config.task.status === "rejected";
  const isInProgress = config.task.status === "in_progress";

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {/* 顶部标题栏 */}
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                {config.title}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {config.task.status === "reviewing"
                  ? "身份认证审核中，请耐心等待" 
                  : config.subtitle}
              </p>
            </div>
            
            {/* 进度条 */}
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className={`h-full bg-gradient-to-r ${theme.gradient} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${config.progress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <span className="text-sm font-medium text-slate-600 min-w-[3rem]">
                {config.progress}%
              </span>
            </div>
          </div>
        </div>

        {/* 拒绝原因提示 */}
        {isRejected && config.task.reason && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="px-6 py-4 bg-rose-50 border-b border-rose-100"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle size={18} className="text-rose-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-rose-800">审核未通过</p>
                <p className="text-sm text-rose-600 mt-0.5">{config.task.reason}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 主内容区 - 单任务卡片 */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className={`bg-gradient-to-br ${theme.bgLight} via-white to-${config.theme}-50/50 rounded-xl border ${theme.border} p-6`}
            >
              <div className="flex items-start gap-5">
                {/* 左侧大图标 */}
                <div className="relative">
                  <motion.div 
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${theme.bg}`}
                    animate={
                      !isReviewing && !isRejected && !isInProgress ? {
                        scale: [1, 1.05, 1],
                        boxShadow: [
                          `0 10px 15px -3px rgba(var(--tp-accent-rgb), 0.3)`,
                          `0 20px 25px -5px rgba(var(--tp-accent-rgb), 0.4)`,
                          `0 10px 15px -3px rgba(var(--tp-accent-rgb), 0.3)`,
                        ],
                      } : {}
                    }
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {config.task.status === "reviewing" ? (
                      <Loader2 size={32} className="text-white animate-spin" />
                    ) : config.task.status === "rejected" ? (
                      <AlertCircle size={32} className="text-white" />
                    ) : config.task.status === "in_progress" ? (
                      <RefreshCw size={32} className="text-white" />
                    ) : config.task.status === "completed" ? (
                      <Check size={32} className="text-white" />
                    ) : (
                      <TaskIcon size={32} className="text-white" />
                    )}
                  </motion.div>
                  
                  {/* 步骤序号徽章 */}
                  <div className={`absolute -top-1 -right-1 w-6 h-6 bg-white rounded-full border-2 ${theme.border} flex items-center justify-center`}>
                    <span className={`text-xs font-bold ${theme.text}`}>
                      {config.progress < 50 ? "1" : config.progress < 100 ? "2" : "3"}
                    </span>
                  </div>
                </div>

                {/* 中间内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${theme.bgLight} ${theme.text} px-2 py-0.5 rounded-full border ${theme.border}`}>
                      当前任务
                    </span>
                    {isReviewing && (
                      <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                        审核中
                      </span>
                    )}
                    {isRejected && (
                      <span className="text-xs font-medium text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                        未通过
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {config.task.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm mb-3">
                    {config.subtitle}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${theme.bg}`} />
                      {config.task.status === "reviewing" ? "预计 2-3 分钟" :
                       config.task.status === "rejected" ? "请重新提交" :
                       config.task.status === "in_progress" ? "继续完成" :
                       "预计 2-3 分钟"}
                    </span>
                  </div>
                </div>

                {/* 右侧 CTA */}
                <div className="flex flex-col items-end gap-2">
                  {config.task.link && (
                    <Link
                      href={config.task.link}
                      className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20 whitespace-nowrap"
                    >
                      {config.task.action}
                      <ArrowRight size={18} className="ml-2" />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 阶段指示 - 简化版 */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="text-xs text-slate-400">阶段</span>
            <div className="flex items-center gap-1.5">
              {["identity_pending", "identity_reviewing", "account_pending", "deposit_pending"].map((p, i) => {
                const phaseConfig = PHASE_CONFIGS[p as keyof typeof PHASE_CONFIGS];
                const isActive = phase === p;
                const isPast = config.progress > phaseConfig.progress;
                return (
                  <div key={p} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <div className={`w-6 h-px ${isPast ? theme.bg : "bg-slate-200"}`} />
                    )}
                    <div 
                      className={`w-2 h-2 rounded-full transition-colors ${
                        isActive ? theme.bg : isPast ? theme.bg : "bg-slate-200"
                      }`}
                      title={phaseConfig.title}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
