/**
 * useOnboardingPhase Hook
 * 根据用户数据计算当前开户阶段
 */

import { useMemo } from "react";
import type { UserPerspective } from "@/types/user";
import type { OnboardingPhase, PhaseConfig } from "./onboarding-phase";
import { PHASE_CONFIGS } from "./onboarding-phase";

interface UseOnboardingPhaseReturn {
  phase: OnboardingPhase;
  config: PhaseConfig;
  isCompleted: boolean;
}

/**
 * 根据用户视角计算当前开户阶段
 *
 * 阶段流转逻辑：
 * 1. identity_pending → 未开始身份认证
 * 2. identity_reviewing → 身份认证提交，等待审核
 * 3. identity_rejected → 身份认证被拒绝
 * 4. identity_in_progress → 身份认证进行中（中断）
 * 5. kyc_pending → 身份认证通过，待KYC升级
 * 6. account_pending → KYC完成，待创建交易账户
 * 7. deposit_pending → 账户创建成功，待首次入金
 * 8. completed → 完成
 */
export function useOnboardingPhase(user: UserPerspective): UseOnboardingPhaseReturn {
  const phase = useMemo(() => {
    // 优先判断已完成状态
    if (user.hasTraded) {
      return "completed";
    }

    // 根据用户阶段和状态判断
    switch (user.stage) {
      case "registered":
        // 刚注册，未提交任何认证
        return "identity_pending";

      case "kyc_pending":
        // KYC提交中（身份认证审核中）
        return "identity_reviewing";

      case "kyc_done":
        // KYC完成（身份认证通过），未开户
        return "account_pending";

      case "account_opening_failed":
        // 开户流程中断
        return "identity_in_progress";

      case "account_rejected":
        // 开户被拒绝（这里复用为身份认证拒绝）
        return "identity_rejected";

      case "account_opened":
        // 已开户，未入金
        return "deposit_pending";

      case "first_deposit":
        // 首次入金，未交易
        return "deposit_pending";

      case "active_trader":
      case "vip":
        // 活跃交易者或VIP - 已完成
        return "completed";

      default:
        // 默认未认证
        return "identity_pending";
    }
  }, [user.stage, user.hasTraded]);

  return {
    phase,
    config: PHASE_CONFIGS[phase],
    isCompleted: phase === "completed",
  };
}

/**
 * 获取所有可用的阶段选项（用于 DevTool 下拉选择）
 */
export function getOnboardingPhaseOptions() {
  return Object.values(PHASE_CONFIGS).map((config) => ({
    value: config.id,
    label: config.title,
    description: config.subtitle,
  }));
}
