/**
 * KYC Step Guard — 步骤守卫工具（服务端 + 客户端通用）
 * 确保用户不能跳过前置步骤
 */

import { getRegionConfig } from "./region-config";
import type { RegionCode } from "./region-config";

/** 服务端检查步骤权限（用于 API 路由和客户端） */
export function checkStepPermission(
  targetStep: number,
  regionCode: RegionCode | null,
  kycData: Partial<import("./types").UserKYC> | null
): { allowed: boolean; missingStep?: number; message: string } {
  if (targetStep === 1) {
    if (!regionCode) return { allowed: false, missingStep: 0, message: "请先选择地区" };
    return { allowed: true, message: "OK" };
  }

  if (targetStep === 2) {
    if (!regionCode) return { allowed: false, missingStep: 0, message: "请先选择地区" };
    if (!kycData?.documentFrontUrl || !kycData?.ocrData) {
      return { allowed: false, missingStep: 1, message: "请先完成证件上传" };
    }
    return { allowed: true, message: "OK" };
  }

  if (targetStep === 3) {
    if (!regionCode) return { allowed: false, missingStep: 0, message: "请先选择地区" };
    if (!kycData?.documentFrontUrl || !kycData?.ocrData) {
      return { allowed: false, missingStep: 1, message: "请先完成证件上传" };
    }
    const regionConfig = getRegionConfig(regionCode);
    if ((regionConfig.features?.livenessRequired ?? true) && !kycData?.livenessPassed) {
      return { allowed: false, missingStep: 2, message: "请先完成活体检测" };
    }
    return { allowed: true, message: "OK" };
  }

  if (targetStep === 4) {
    if (!regionCode) return { allowed: false, missingStep: 0, message: "请先选择地区" };
    if (!kycData?.documentFrontUrl || !kycData?.ocrData) {
      return { allowed: false, missingStep: 1, message: "请先完成证件上传" };
    }
    const regionConfig = getRegionConfig(regionCode);
    if ((regionConfig.features?.livenessRequired ?? true) && !kycData?.livenessPassed) {
      return { allowed: false, missingStep: 2, message: "请先完成活体检测" };
    }
    if (!kycData?.personalInfo) {
      return { allowed: false, missingStep: 3, message: "请先完成个人信息" };
    }
    return { allowed: true, message: "OK" };
  }

  return { allowed: false, message: "Invalid step" };
}
