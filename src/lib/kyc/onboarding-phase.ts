/**
 * Onboarding Phase - 开户流程阶段状态机
 *
 * 独立的开户流程状态管理，不与用户类型强绑定
 */

import { UserCircle, Shield, FileCheck, Sparkles, TrendingUp, Loader2, AlertCircle, RefreshCw, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// 开户阶段类型
export type OnboardingPhase =
  | "identity_pending"      // 1. 未认证
  | "identity_in_progress"   // 4. 流程中断
  | "identity_reviewing"     // 2. 审核中
  | "identity_rejected"      // 3. 审核拒绝
  | "kyc_pending"           // 5. 认证通过，待KYC
  | "account_pending"        // 6. 待开户
  | "deposit_pending"       // 7. 待入金
  | "completed";            // 已完成

// 阶段配置
export interface PhaseConfig {
  id: OnboardingPhase;
  title: string;
  subtitle: string;
  progress: number;
  task: {
    title: string;
    status: "pending" | "in_progress" | "reviewing" | "rejected" | "completed";
    action: string;
    link: string;
    reason?: string; // 拒绝原因等
  };
  theme: "blue" | "amber" | "green" | "red";
  icon: LucideIcon;
}

// 阶段配置映射
export const PHASE_CONFIGS: Record<OnboardingPhase, PhaseConfig> = {
  identity_pending: {
    id: "identity_pending",
    title: "完成开户流程，开始交易",
    subtitle: "验证身份信息，保障账户安全",
    progress: 0,
    task: {
      title: "身份认证",
      status: "pending",
      action: "开始认证",
      link: "/portal/kyc",
    },
    theme: "blue",
    icon: UserCircle,
  },
  identity_in_progress: {
    id: "identity_in_progress",
    title: "继续完成身份认证",
    subtitle: "您还有未完成的步骤",
    progress: 30,
    task: {
      title: "身份认证",
      status: "in_progress",
      action: "继续填写",
      link: "/portal/kyc",
    },
    theme: "blue",
    icon: FileCheck,
  },
  identity_reviewing: {
    id: "identity_reviewing",
    title: "完成开户流程，开始交易",
    subtitle: "身份认证审核中，请耐心等待",
    progress: 50,
    task: {
      title: "身份认证",
      status: "reviewing",
      action: "查看进度",
      link: "/portal/kyc/status",
    },
    theme: "amber",
    icon: Loader2,
  },
  identity_rejected: {
    id: "identity_rejected",
    title: "身份认证未通过",
    subtitle: "请根据拒绝原因重新提交认证资料",
    progress: 40,
    task: {
      title: "身份认证",
      status: "rejected",
      action: "重新认证",
      link: "/portal/kyc",
      reason: "证件照片不清晰，请重新上传",
    },
    theme: "red",
    icon: AlertCircle,
  },
  kyc_pending: {
    id: "kyc_pending",
    title: "完成开户流程，开始交易",
    subtitle: "身份认证已通过，开始KYC升级",
    progress: 100,
    task: {
      title: "KYC 升级",
      status: "pending",
      action: "去KYC",
      link: "/portal/kyc/upgrade",
    },
    theme: "blue",
    icon: Shield,
  },
  account_pending: {
    id: "account_pending",
    title: "创建您的交易账户",
    subtitle: "完成账户创建即可开始交易",
    progress: 100,
    task: {
      title: "创建交易账户",
      status: "pending",
      action: "立即开户",
      link: "/portal/trading/open-account",
    },
    theme: "blue",
    icon: FileCheck,
  },
  deposit_pending: {
    id: "deposit_pending",
    title: "存入资金，激活账户",
    subtitle: "完成首次入金，开始您的交易之旅",
    progress: 100,
    task: {
      title: "首次入金",
      status: "pending",
      action: "去入金",
      link: "/portal/fund/deposit",
    },
    theme: "blue",
    icon: Sparkles,
  },
  completed: {
    id: "completed",
    title: "恭喜！您已完成所有步骤",
    subtitle: "开始您的交易之旅",
    progress: 100,
    task: {
      title: "开始交易",
      status: "completed",
      action: "开始交易",
      link: "/portal/trading",
    },
    theme: "green",
    icon: TrendingUp,
  },
};

// 主题颜色映射
export const THEME_COLORS = {
  blue: {
    bg: "bg-blue-600",
    bgLight: "bg-blue-50",
    border: "border-blue-100",
    text: "text-blue-600",
    textLight: "text-blue-100",
    gradient: "from-blue-500 to-blue-600",
  },
  amber: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-600",
    textLight: "text-amber-100",
    gradient: "from-amber-400 to-amber-500",
  },
  green: {
    bg: "bg-emerald-500",
    bgLight: "bg-emerald-50",
    border: "border-emerald-100",
    text: "text-emerald-600",
    textLight: "text-emerald-100",
    gradient: "from-emerald-400 to-emerald-500",
  },
  red: {
    bg: "bg-rose-500",
    bgLight: "bg-rose-50",
    border: "border-rose-100",
    text: "text-rose-600",
    textLight: "text-rose-100",
    gradient: "from-rose-400 to-rose-500",
  },
};
