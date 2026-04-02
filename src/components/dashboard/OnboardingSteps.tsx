"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Circle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { TestUser, getOnboardingSteps } from "@/lib/test-users";

interface OnboardingStepsProps {
  user: TestUser;
}

export function OnboardingSteps({ user }: OnboardingStepsProps) {
  const steps = getOnboardingSteps(user);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.35 }}
      className="bg-white rounded-2xl border-2 border-gray-200 p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <span className="text-lg">🚀</span>
          开始你的交易之旅
        </h2>
        <span className="text-xs text-gray-400">（预计：2分钟完成）</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all duration-200",
              step.status === "completed"
                ? "bg-emerald-50 border-emerald-200"
                    : step.status === "current"
                    ? "bg-blue-50 border-blue-300 ring-2 ring-blue-100"
                : "bg-gray-50 border-gray-200"
            )}
          >
            {/* Step Number */}
            <div className="flex items-center justify-between mb-3">
              <span
                className={cn(
                  "text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center",
                  step.status === "completed"
                    ? "bg-emerald-500 text-white"
                        : step.status === "current"
                        ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-white"
                )}
              >
                {step.status === "completed" ? (
                  <Check size={14} />
                ) : (
                  index + 1
                )}
              </span>
              {step.status === "current" && (
                <ArrowRight size={16} className="text-blue-500" />
              )}
            </div>

            {/* Content */}
            <p
              className={cn(
                "font-semibold text-sm mb-1",
                step.status === "completed"
                  ? "text-emerald-700"
                      : step.status === "current"
                      ? "text-blue-700"
                  : "text-gray-500"
              )}
            >
              {step.title}
            </p>

            {/* Action Button */}
            {step.status === "current" && step.actionText && (
              <Link href={step.href}>
                <button className="mt-2 w-full py-1.5 px-3 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  {step.actionText}
                </button>
              </Link>
            )}

            {step.status === "pending" && (
              <div className="mt-2 flex items-center gap-1 text-gray-400">
                <Circle size={12} />
                <span className="text-xs">等待中</span>
              </div>
            )}

            {step.status === "completed" && (
              <div className="mt-2 flex items-center gap-1 text-emerald-600">
                <Check size={12} />
                <span className="text-xs font-medium">已完成</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
