"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Circle, Shield, UserPlus, Wallet, TrendingUp } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TestUser, getOnboardingSteps } from "@/lib/test-users";

interface OnboardingStepsProps {
  user: TestUser;
}

const stepIcons: Record<string, React.ReactNode> = {
  register: <UserPlus size={20} />,
  kyc: <Shield size={20} />,
  account: <Circle size={20} />,
  deposit: <Wallet size={20} />,
  trade: <TrendingUp size={20} />,
};

const stepDescriptions: Record<string, string> = {
  register: "创建您的 TradePass 账户",
  kyc: "上传身份证件并完成人脸识别",
  account: "创建您的 MT5 交易账户",
  deposit: "入金以激活账户并开始交易",
  trade: "开始您的第一笔交易",
};

export function OnboardingSteps({ user }: OnboardingStepsProps) {
  const steps = getOnboardingSteps(user);
  
  // 计算进度
  const completedCount = steps.filter(s => s.status === 'completed').length;
  const totalCount = steps.length;
  const progressPercent = (completedCount / totalCount) * 100;
  
  // 找到当前步骤
  const currentStep = steps.find(s => s.status === 'current');
  const currentStepIndex = steps.findIndex(s => s.status === 'current');
  
  // 已完成步骤（除了注册）
  const completedSteps = steps.filter(s => s.status === 'completed' && s.id !== 'register');
  
  // 待完成步骤
  const pendingSteps = steps.filter(s => s.status === 'pending');

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35 }}
      className="bg-white rounded-2xl border-2 border-gray-200 p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            {currentStep ? `完成${currentStep.title}，解锁交易功能` : '开户流程已完成'}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {currentStep ? stepDescriptions[currentStep.id] : '您已完成所有开户步骤，可以开始交易了'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-sm font-semibold text-gray-700">{completedCount}/{totalCount}</span>
          <p className="text-xs text-gray-400">步骤</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full mb-5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
        />
      </div>

      {/* Current Step Card */}
      {currentStep && (
        <div className="mb-4">
          <div className="relative p-5 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50">
            {/* Current Badge */}
            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
              当前步骤
            </div>
            
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                {stepIcons[currentStep.id]}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {currentStep.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {stepDescriptions[currentStep.id]}
                </p>
                
                {/* CTA Button */}
                <Link href={currentStep.href}>
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm hover:shadow-md">
                    {currentStep.actionText}
                    <ArrowRight size={16} />
                  </button>
                </Link>
                
                <span className="ml-3 text-xs text-gray-400">
                  预计 3-5 分钟
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completed & Pending Steps */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {/* Completed */}
        {completedSteps.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">已完成：</span>
            <div className="flex items-center gap-2">
              {completedSteps.map((step, idx) => (
                <span key={step.id} className="flex items-center gap-1 text-emerald-600">
                  <Check size={14} className="text-emerald-500" />
                  <span className="font-medium">{step.title}</span>
                  {idx < completedSteps.length - 1 && (
                    <span className="text-gray-300 ml-1">→</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Pending */}
        {pendingSteps.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">待完成：</span>
            <div className="flex items-center gap-2">
              {pendingSteps.map((step, idx) => (
                <span key={step.id} className="flex items-center gap-1 text-gray-400">
                  <Circle size={12} />
                  <span>{step.title}</span>
                  {idx < pendingSteps.length - 1 && (
                    <span className="text-gray-300 ml-1">→</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
