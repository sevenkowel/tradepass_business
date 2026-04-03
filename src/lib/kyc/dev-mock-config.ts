/**
 * KYC Mock 配置 Store (Zustand)
 * 独立于 KYC store，控制 mock 服务的返回行为
 * 仅用于开发调试
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ReviewResult } from "./mock-service";
import type { RegionCode } from "./region-config";

export interface KYCMockConfig {
  // OCR 控制
  ocrConfidence: number;        // 0.7 ~ 0.99
  ocrSimulateError: boolean;    // 模拟 OCR 失败

  // 活体检测控制
  livenessPassRate: number;     // 0 ~ 1
  livenessForceResult: "auto" | "pass" | "fail";

  // 审核结果控制
  reviewForceResult: "auto" | ReviewResult;

  // 地区
  regionCode: RegionCode;
}

interface KYCMockConfigState extends KYCMockConfig {
  setOcrConfidence: (v: number) => void;
  setOcrSimulateError: (v: boolean) => void;
  setLivenessPassRate: (v: number) => void;
  setLivenessForceResult: (v: KYCMockConfig["livenessForceResult"]) => void;
  setReviewForceResult: (v: KYCMockConfig["reviewForceResult"]) => void;
  setRegionCode: (v: RegionCode) => void;
  reset: () => void;
}

const defaults: KYCMockConfig = {
  ocrConfidence: 0.95,
  ocrSimulateError: false,
  livenessPassRate: 0.9,
  livenessForceResult: "auto",
  reviewForceResult: "auto",
  regionCode: "VN",
};

export const useKYCMockConfig = create<KYCMockConfigState>()(
  persist(
    (set) => ({
      ...defaults,

      setOcrConfidence: (v) => set({ ocrConfidence: v }),
      setOcrSimulateError: (v) => set({ ocrSimulateError: v }),
      setLivenessPassRate: (v) => set({ livenessPassRate: v }),
      setLivenessForceResult: (v) => set({ livenessForceResult: v }),
      setReviewForceResult: (v) => set({ reviewForceResult: v }),
      setRegionCode: (v) => set({ regionCode: v }),
      reset: () => set(defaults),
    }),
    {
      name: "kyc-mock-config",
    }
  )
);
