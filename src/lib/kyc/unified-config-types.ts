/**
 * 统一 KYC 配置系统类型定义
 * 整合 kyc-system-config 和 kyc-config 的配置体系
 * 
 * 这是 KYC 配置系统整合后的唯一类型定义文件
 */

import type { RegionCode } from "./region-config";

// ============================================================
// 基础类型
// ============================================================

export type KYCTierLevel = 0 | 1 | 2 | 3 | 4;

export type VerificationStage =
  | "identity"      // 身份认证
  | "liveness"      // 活体检测
  | "address"       // 地址证明
  | "questionnaire"; // 问卷/适合性调查

export type OpeningStep = 
  | "document"      // 文档上传
  | "liveness"      // 活体检测
  | "personalInfo"  // 个人信息
  | "agreements";   // 协议签署

// ============================================================
// KYC 等级定义
// ============================================================

export interface KYCTier {
  level: KYCTierLevel;
  name: string;
  nameLocal: Record<string, string>;
  description: string;
  requiredStages: VerificationStage[];
  badge: {
    color: string;
    icon: string;
  };
}

// ============================================================
// 认证阶段定义
// ============================================================

export interface StageConfig {
  id: VerificationStage;
  name: string;
  nameLocal: Record<string, string>;
  description: string;
  enabled: boolean;
  required: boolean;
  autoApprove: boolean;
  maxAttempts?: number;
  timeout?: number;
  documents?: string[];
}

// ============================================================
// 开户流程配置（从原 kyc-config.json 迁移）
// ============================================================

export interface OpeningStepConfig {
  enabled: boolean;
  required: boolean;
  order: number;
}

export interface DocumentStepConfig extends OpeningStepConfig {
  requiredDocuments: number;
  maxFileSize: number; // MB
  allowedFormats: string[];
}

export interface LivenessStepConfig extends OpeningStepConfig {
  maxAttempts: number;
  videoDuration: number; // seconds
}

export interface PersonalInfoStepConfig extends OpeningStepConfig {
  sections: string[];
}

export interface AgreementsStepConfig extends OpeningStepConfig {
  requiredAgreements: string[];
}

export interface OpeningStepsConfig {
  document: DocumentStepConfig;
  liveness: LivenessStepConfig;
  personalInfo: PersonalInfoStepConfig;
  agreements: AgreementsStepConfig;
}

// ============================================================
// 表单字段配置
// ============================================================

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "textarea" | "select";
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface FormFieldsConfig {
  personalInfo: FieldConfig[];
  education: boolean;
  investmentExperience: boolean;
  financialStatus: boolean;
  pepDeclaration: boolean;
  usPersonDeclaration: boolean;
  professionalDeclaration: boolean;
  militaryDeclaration: boolean;
}

// ============================================================
// 联系信息验证配置
// ============================================================

export interface ContactVerificationConfig {
  phoneOtpRequired: boolean;
  emailOtpRequired: boolean;
  skipIfPreVerified: boolean;
  lockIfPreVerified: boolean;
}

// ============================================================
// 功能特性配置
// ============================================================

export interface RegionFeatures {
  ocrEnabled: boolean;
  ocrProvider?: "tencent" | "google" | "azure";
  livenessRequired: boolean;
  livenessProvider?: "tencent" | "face++" | "onfido";
  addressProofRequired: boolean;
  videoKYCRequired: boolean;
  agreementEsign?: boolean;
}

// ============================================================
// 补充认证触发规则
// ============================================================

export interface SupplementalTriggerConfig {
  enabled: boolean;
  condition: "amount_threshold" | "risk_score" | "manual" | "document_expiry" | "time_based";
  threshold?: number;
  currency?: string;
  daysSinceOnboarding?: number;
  requireStage: VerificationStage;
  messageLocal: Record<string, string>;
}

export interface RegionSupplementalRules {
  largeWithdrawal: SupplementalTriggerConfig;
  riskScore?: SupplementalTriggerConfig;
  documentExpiry?: {
    enabled: boolean;
    warningDays: number;
    graceDays: number;
  };
  timeBased?: SupplementalTriggerConfig;
}

// ============================================================
// 升级路径配置
// ============================================================

export interface UpgradePath {
  targetTier: KYCTierLevel;
  requiredStages: VerificationStage[];
  autoApprove: boolean;
  approverRole?: string;
}

// ============================================================
// 统一地区配置（核心整合点）
// ============================================================

export interface UnifiedRegionConfig {
  code: RegionCode;
  name: string;
  enabled: boolean;
  
  // ── 开户流程配置 ──
  opening: {
    // 步骤配置
    steps: OpeningStepsConfig;
    // 表单字段
    formFields: FormFieldsConfig;
    // 功能特性
    features: RegionFeatures;
    // 联系信息验证
    contactVerification?: ContactVerificationConfig;
    // ID 号码验证
    idNumberPattern?: string;
    idNumberExample?: string;
    // 开户完成后默认等级
    defaultTierOnComplete: KYCTierLevel;
  };
  
  // ── KYC 流程配置 ──
  kyc: {
    // 当前等级 → 可升级路径
    upgradePaths: Record<KYCTierLevel, UpgradePath[]>;
    // 补充认证触发规则
    supplementalTriggers: RegionSupplementalRules;
  };
  
  // ── 阶段覆盖配置（可选，用于地区特定覆盖）──
  stageOverrides?: Partial<Record<VerificationStage, Partial<StageConfig>>>;
}

// ============================================================
// 权限配置
// ============================================================

export interface FundPermissions {
  depositEnabled: boolean;
  depositLimit: number;
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
  accountTypes: string[];
  leverageMax: number;
  tradingEnabled: boolean;
  productsAllowed: string[];
}

export interface GrowthPermissions {
  campaignAccess: boolean;
  bonusEligible: boolean;
  referralEnabled: boolean;
  loyaltyProgram: boolean;
  aiSignalsQuota: number;
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
// 全局设置
// ============================================================

export interface KYCGlobalSettings {
  // 系统开关
  enabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: Record<string, string>;
  
  // 默认配置
  defaultRegion: RegionCode;
  
  // 审核配置
  reviewMode: "auto" | "manual" | "hybrid";
  autoApprovalEnabled: boolean;
  autoApprovalThreshold: number;
  riskCheckEnabled: boolean;
  manualReviewTimeout: number; // 小时
  
  // 重试配置
  allowRetryOnReject: boolean;
  maxRetryAttempts: number;
  
  // 会话配置
  sessionTimeout: number; // 分钟
}

// ============================================================
// 统一配置根对象
// ============================================================

export interface UnifiedKYCConfig {
  version: string;
  updatedAt: string;
  updatedBy: string;
  changelog?: string;
  
  // 全局设置
  global: KYCGlobalSettings;
  
  // 等级定义
  tiers: KYCTier[];
  
  // 阶段定义（全局默认）
  stageDefinitions: Record<VerificationStage, StageConfig>;
  
  // 地区配置（整合后的核心配置）
  regions: Record<RegionCode, UnifiedRegionConfig>;
  
  // 权限映射
  tierPermissions: Record<KYCTierLevel, TierPermissions>;
}

// ============================================================
// API 请求/响应类型
// ============================================================

export interface UpdateUnifiedConfigRequest {
  config: Partial<UnifiedKYCConfig>;
  reason?: string;
}

export interface UpdateUnifiedConfigResponse {
  success: boolean;
  version: string;
  updatedAt: string;
  error?: string;
}

export interface UnifiedConfigVersion {
  version: string;
  updatedAt: string;
  updatedBy: string;
  changes: string;
}

export interface UnifiedConfigHistoryResponse {
  versions: UnifiedConfigVersion[];
}

// ============================================================
// 向后兼容类型（用于迁移期）
// ============================================================

/** 兼容旧版 AccountOpeningConfig 的转换函数输入 */
export interface LegacyAccountOpeningConfig {
  version: string;
  enabled: boolean;
  maintenanceMode: boolean;
  maintenanceMessage: Record<string, string>;
  updatedAt: string;
  updatedBy: string;
  regions: Record<string, any>;
  steps: any;
  defaults: any;
}

/** 兼容旧版 KYCSystemConfig 的转换函数输入 */
export interface LegacyKYCSystemConfig {
  version: string;
  updatedAt: string;
  updatedBy: string;
  changelog?: string;
  tiers: KYCTier[];
  stageDefinitions: Record<VerificationStage, StageConfig>;
  regionFlows: Record<string, any>;
  tierPermissions: Record<KYCTierLevel, TierPermissions>;
  settings: any;
}

// ============================================================
// 工具类型
// ============================================================

/** 配置差异对比结果 */
export interface ConfigDiff {
  path: string;
  oldValue: any;
  newValue: any;
  type: "added" | "removed" | "modified";
}

/** 配置验证结果 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/** 地区配置摘要（用于列表展示） */
export interface RegionConfigSummary {
  code: RegionCode;
  name: string;
  enabled: boolean;
  stepCount: number;
  defaultTier: KYCTierLevel;
  kycLevel: string;
  lastModified: string;
}
