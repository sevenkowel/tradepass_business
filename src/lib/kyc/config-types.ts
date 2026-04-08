/**
 * KYC 认证体系配置类型定义
 * 支持分阶段认证、等级体系、权限控制
 */

import type { RegionCode } from "./region-config";

// ============================================================
// KYC 认证等级（Level 0-4）
// ============================================================

export type KYCTierLevel = 0 | 1 | 2 | 3 | 4;

export interface KYCTier {
  level: KYCTierLevel;
  name: string;
  nameLocal: Record<string, string>; // 多语言名称
  description: string;
  requiredStages: VerificationStage[];
  badge: {
    color: string; // tailwind color class
    icon: string; // lucide icon name
  };
}

// ============================================================
// 认证阶段（Verification Stages）
// ============================================================

export type VerificationStage =
  | "identity"      // 身份认证
  | "liveness"      // 活体检测
  | "address"       // 地址证明
  | "questionnaire"; // 问卷/适合性调查

export interface StageConfig {
  id: VerificationStage;
  name: string;
  nameLocal: Record<string, string>;
  description: string;
  enabled: boolean;
  required: boolean; // 是否为强制阶段
  autoApprove: boolean; // 是否支持自动审核
  maxAttempts?: number; // 最大尝试次数
  timeout?: number; // 超时时间（分钟）
  documents?: string[]; // 所需文档类型
}

// ============================================================
// 补充认证触发规则
// ============================================================

export interface SupplementalTriggerConfig {
  enabled: boolean;
  // 触发条件类型
  condition: "amount_threshold" | "risk_score" | "manual" | "document_expiry";
  // 触发阈值（金额阈值或风险评分）
  threshold?: number;
  // 货币（用于金额阈值）
  currency?: string;
  // 要求补充的阶段
  requireStage: VerificationStage;
  // 提示信息
  messageLocal: Record<string, string>;
}

export interface RegionSupplementalRules {
  // 大额提款触发补充认证
  largeWithdrawal: SupplementalTriggerConfig;
  // 风险评分触发
  riskScore?: SupplementalTriggerConfig;
  // 证件过期检查
  documentExpiry?: {
    enabled: boolean;
    warningDays: number; // 提前多少天警告
    graceDays: number;   // 过期后宽限天数
  };
}

// ============================================================
// 地区认证流程配置
// ============================================================

export interface RegionKYCFlow {
  regionCode: RegionCode;
  enabled: boolean;
  defaultTier: KYCTierLevel;
  stages: Record<VerificationStage, StageConfig>;
  tierRequirements: Record<KYCTierLevel, VerificationStage[]>;
  // 补充认证触发规则
  supplementalRules: RegionSupplementalRules;
}

// ============================================================
// 权限控制（Permissions）
// ============================================================

export interface FundPermissions {
  depositEnabled: boolean;
  depositLimit: number; // 单笔/日限额
  depositLimitCurrency: string;
  withdrawEnabled: boolean;
  withdrawLimit: number;
  maxBalance: number;
}

export interface TransferPermissions {
  internalTransferEnabled: boolean;
  internalTransferLimit: number;
  wireTransferEnabled: boolean;
  wireTransferLimit: number;
  cryptoTransferEnabled: boolean;
  cryptoTransferLimit: number;
}

export interface TradingPermissions {
  canOpenAccount: boolean;
  maxAccounts: number;
  accountTypes: string[]; // ["standard", "ecn", "pro"]
  leverageMax: number;
  tradingEnabled: boolean;
  productsAllowed: string[]; // ["forex", "stocks", "crypto", "commodities"]
}

export interface GrowthPermissions {
  campaignAccess: boolean;
  bonusEligible: boolean;
  referralEnabled: boolean;
  loyaltyProgram: boolean;
  aiSignalsQuota: number; // AI 信号每日配额
  premiumFeatures: string[];
}

export interface TierPermissions {
  tier: KYCTierLevel;
  funds: FundPermissions;
  transfer: TransferPermissions;
  trading: TradingPermissions;
  growth: GrowthPermissions;
}

// ============================================================
// 完整 KYC 配置
// ============================================================

export interface KYCSystemConfig {
  version: string;
  updatedAt: string;
  updatedBy: string;

  // 等级定义
  tiers: KYCTier[];

  // 阶段定义
  stageDefinitions: Record<VerificationStage, StageConfig>;

  // 地区流程配置
  regionFlows: Record<RegionCode, RegionKYCFlow>;

  // 等级权限映射
  tierPermissions: Record<KYCTierLevel, TierPermissions>;

  // 全局设置
  settings: {
    autoApprovalEnabled: boolean;
    autoApprovalThreshold: number; // 0-100
    riskCheckEnabled: boolean;
    manualReviewTimeout: number; // 小时
    allowRetryOnReject: boolean;
    maxRetryAttempts: number;
  };
}

// ============================================================
// API 请求/响应类型
// ============================================================

export interface UpdateKYCConfigRequest {
  config: Partial<KYCSystemConfig>;
  reason?: string;
}

export interface UpdateKYCConfigResponse {
  success: boolean;
  version: string;
  updatedAt: string;
  error?: string;
}

export interface KYCConfigVersion {
  version: string;
  updatedAt: string;
  updatedBy: string;
  changes: string;
}

export interface KYCConfigHistoryResponse {
  versions: KYCConfigVersion[];
}

// ============================================================
// 默认配置
// ============================================================

export const DEFAULT_KYC_TIERS: KYCTier[] = [
  {
    level: 0,
    name: "Unverified",
    nameLocal: { en: "Unverified", zh: "未认证", vi: "Chưa xác minh", th: "ยังไม่ยืนยัน" },
    description: "Email/Phone registered only",
    requiredStages: [],
    badge: { color: "gray", icon: "CircleDashed" },
  },
  {
    level: 1,
    name: "Basic",
    nameLocal: { en: "Basic", zh: "基础认证", vi: "Cơ bản", th: "พื้นฐาน" },
    description: "Identity verified",
    requiredStages: ["identity"],
    badge: { color: "blue", icon: "Shield" },
  },
  {
    level: 2,
    name: "Standard",
    nameLocal: { en: "Standard", zh: "标准认证", vi: "Tiêu chuẩn", th: "มาตรฐาน" },
    description: "Identity + Liveness",
    requiredStages: ["identity", "liveness"],
    badge: { color: "green", icon: "ShieldCheck" },
  },
  {
    level: 3,
    name: "Advanced",
    nameLocal: { en: "Advanced", zh: "高级认证", vi: "Nâng cao", th: "ขั้นสูง" },
    description: "Identity + Liveness + Address",
    requiredStages: ["identity", "liveness", "address"],
    badge: { color: "purple", icon: "BadgeCheck" },
  },
  {
    level: 4,
    name: "Complete",
    nameLocal: { en: "Complete", zh: "完整认证", vi: "Hoàn tất", th: "สมบูรณ์" },
    description: "Full compliance with questionnaire",
    requiredStages: ["identity", "liveness", "address", "questionnaire"],
    badge: { color: "gold", icon: "Crown" },
  },
];

export const DEFAULT_STAGE_CONFIGS: Record<VerificationStage, StageConfig> = {
  identity: {
    id: "identity",
    name: "Identity Verification",
    nameLocal: { en: "Identity", zh: "身份认证", vi: "Danh tính", th: "ตัวตน" },
    description: "Upload and verify government-issued ID",
    enabled: true,
    required: true,
    autoApprove: true,
    maxAttempts: 3,
    timeout: 30,
    documents: ["id_card", "passport", "driving_license"],
  },
  liveness: {
    id: "liveness",
    name: "Liveness Check",
    nameLocal: { en: "Liveness", zh: "活体检测", vi: "Sinh trắc học", th: "ตรวจสอบชีวิต" },
    description: "Facial recognition and anti-spoofing",
    enabled: true,
    required: true,
    autoApprove: true,
    maxAttempts: 5,
    timeout: 15,
  },
  address: {
    id: "address",
    name: "Address Verification",
    nameLocal: { en: "Address", zh: "地址证明", vi: "Địa chỉ", th: "ที่อยู่" },
    description: "Proof of residence document",
    enabled: false,
    required: false,
    autoApprove: false,
    maxAttempts: 3,
    timeout: 60,
    documents: ["utility_bill", "bank_statement"],
  },
  questionnaire: {
    id: "questionnaire",
    name: "Suitability Questionnaire",
    nameLocal: { en: "Questionnaire", zh: "问卷调查", vi: "Khảo sát", th: "แบบสอบถาม" },
    description: "Investment experience and risk assessment",
    enabled: false,
    required: false,
    autoApprove: true,
    timeout: 30,
  },
};

// 默认等级权限映射
export const DEFAULT_TIER_PERMISSIONS: Record<KYCTierLevel, TierPermissions> = {
  0: {
    tier: 0,
    funds: {
      depositEnabled: false,
      depositLimit: 0,
      depositLimitCurrency: "USD",
      withdrawEnabled: false,
      withdrawLimit: 0,
      maxBalance: 0,
    },
    transfer: {
      internalTransferEnabled: false,
      internalTransferLimit: 0,
      wireTransferEnabled: false,
      wireTransferLimit: 0,
      cryptoTransferEnabled: false,
      cryptoTransferLimit: 0,
    },
    trading: {
      canOpenAccount: false,
      maxAccounts: 0,
      accountTypes: [],
      leverageMax: 0,
      tradingEnabled: false,
      productsAllowed: [],
    },
    growth: {
      campaignAccess: false,
      bonusEligible: false,
      referralEnabled: false,
      loyaltyProgram: false,
      aiSignalsQuota: 0,
      premiumFeatures: [],
    },
  },
  1: {
    tier: 1,
    funds: {
      depositEnabled: true,
      depositLimit: 1000,
      depositLimitCurrency: "USD",
      withdrawEnabled: false,
      withdrawLimit: 0,
      maxBalance: 5000,
    },
    transfer: {
      internalTransferEnabled: false,
      internalTransferLimit: 0,
      wireTransferEnabled: false,
      wireTransferLimit: 0,
      cryptoTransferEnabled: false,
      cryptoTransferLimit: 0,
    },
    trading: {
      canOpenAccount: true,
      maxAccounts: 1,
      accountTypes: ["standard"],
      leverageMax: 50,
      tradingEnabled: true,
      productsAllowed: ["forex"],
    },
    growth: {
      campaignAccess: true,
      bonusEligible: true,
      referralEnabled: false,
      loyaltyProgram: false,
      aiSignalsQuota: 5,
      premiumFeatures: [],
    },
  },
  2: {
    tier: 2,
    funds: {
      depositEnabled: true,
      depositLimit: 10000,
      depositLimitCurrency: "USD",
      withdrawEnabled: true,
      withdrawLimit: 5000,
      maxBalance: 50000,
    },
    transfer: {
      internalTransferEnabled: true,
      internalTransferLimit: 5000,
      wireTransferEnabled: false,
      wireTransferLimit: 0,
      cryptoTransferEnabled: false,
      cryptoTransferLimit: 0,
    },
    trading: {
      canOpenAccount: true,
      maxAccounts: 3,
      accountTypes: ["standard", "ecn"],
      leverageMax: 100,
      tradingEnabled: true,
      productsAllowed: ["forex", "stocks", "indices"],
    },
    growth: {
      campaignAccess: true,
      bonusEligible: true,
      referralEnabled: true,
      loyaltyProgram: true,
      aiSignalsQuota: 20,
      premiumFeatures: ["basic_signals"],
    },
  },
  3: {
    tier: 3,
    funds: {
      depositEnabled: true,
      depositLimit: 50000,
      depositLimitCurrency: "USD",
      withdrawEnabled: true,
      withdrawLimit: 25000,
      maxBalance: 250000,
    },
    transfer: {
      internalTransferEnabled: true,
      internalTransferLimit: 25000,
      wireTransferEnabled: true,
      wireTransferLimit: 10000,
      cryptoTransferEnabled: false,
      cryptoTransferLimit: 0,
    },
    trading: {
      canOpenAccount: true,
      maxAccounts: 5,
      accountTypes: ["standard", "ecn", "pro"],
      leverageMax: 200,
      tradingEnabled: true,
      productsAllowed: ["forex", "stocks", "indices", "commodities"],
    },
    growth: {
      campaignAccess: true,
      bonusEligible: true,
      referralEnabled: true,
      loyaltyProgram: true,
      aiSignalsQuota: 50,
      premiumFeatures: ["advanced_signals", "priority_support"],
    },
  },
  4: {
    tier: 4,
    funds: {
      depositEnabled: true,
      depositLimit: 200000,
      depositLimitCurrency: "USD",
      withdrawEnabled: true,
      withdrawLimit: 100000,
      maxBalance: 1000000,
    },
    transfer: {
      internalTransferEnabled: true,
      internalTransferLimit: 100000,
      wireTransferEnabled: true,
      wireTransferLimit: 50000,
      cryptoTransferEnabled: true,
      cryptoTransferLimit: 25000,
    },
    trading: {
      canOpenAccount: true,
      maxAccounts: 10,
      accountTypes: ["standard", "ecn", "pro", "vip"],
      leverageMax: 500,
      tradingEnabled: true,
      productsAllowed: ["forex", "stocks", "indices", "commodities", "crypto"],
    },
    growth: {
      campaignAccess: true,
      bonusEligible: true,
      referralEnabled: true,
      loyaltyProgram: true,
      aiSignalsQuota: -1, // unlimited
      premiumFeatures: ["all_signals", "vip_support", "personal_manager", "api_access"],
    },
  },
};
