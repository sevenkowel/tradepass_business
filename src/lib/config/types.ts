/**
 * 开户配置中心类型定义
 * Backoffice 配置管理 → Portal KYC 流程 的桥梁
 */

import type { RegionCode, KYCLevel, DocumentType } from "@/lib/kyc/region-config";
import type { FieldConfig } from "@/lib/kyc/region-config";

// ============================================================
// 开户全局配置
// ============================================================

export interface AccountOpeningConfig {
  /** 配置版本 */
  version: string;
  /** 是否开放开户 */
  enabled: boolean;
  /** 维护模式 */
  maintenanceMode: boolean;
  /** 维护公告（支持多语言） */
  maintenanceMessage: Record<string, string>;
  /** 最后更新时间 */
  updatedAt: string;
  /** 最后更新人 */
  updatedBy: string;

  /** 各地区配置 */
  regions: Record<RegionCode, RegionAccountConfig>;

  /** 全局步骤开关 */
  steps: StepConfigs;

  /** 默认审核配置 */
  defaults: DefaultConfigs;
}

// ============================================================
// 地区级配置
// ============================================================

// 联系信息验证配置
export interface ContactVerificationConfig {
  phoneOtpRequired: boolean;      // 是否强制手机 OTP
  emailOtpRequired: boolean;      // 是否强制邮箱 OTP
  skipIfPreVerified: boolean;     // 如果已验证是否跳过 OTP
  lockIfPreVerified: boolean;     // 已验证是否锁定不可修改
}

export interface RegionAccountConfig {
  /** 该地区是否开放 */
  enabled: boolean;
  /** KYC 级别 */
  kycLevel: KYCLevel;
  /** 允许的证件类型 */
  allowedDocuments: DocumentType[];
  /** 地区特性开关 */
  features: {
    ocrEnabled: boolean;
    livenessRequired: boolean;
    addressProofRequired: boolean;
    videoKYCRequired: boolean;
  };
  /** 联系信息验证配置 */
  contactVerification: ContactVerificationConfig;
  /** 表单字段配置 */
  formFields: {
    personalInfo: FieldConfig[];
    education: boolean;
    investmentExperience: boolean;
    financialStatus: boolean;
    pepDeclaration: boolean;
    usPersonDeclaration: boolean;
    professionalDeclaration: boolean;
    militaryDeclaration: boolean;
  };
  /** ID 号码验证 */
  idNumberPattern?: string;
  idNumberExample?: string;
}

// ============================================================
// 步骤开关
// ============================================================

export interface StepConfigs {
  document: {
    enabled: boolean;
    requiredDocuments: number;
    maxFileSize: number; // MB
    allowedFormats: string[];
  };
  liveness: {
    enabled: boolean;
    maxAttempts: number;
    videoDuration: number; // seconds
  };
  personalInfo: {
    enabled: boolean;
    sections: string[];
  };
  agreements: {
    enabled: boolean;
    requiredAgreements: string[];
  };
}

// ============================================================
// 默认配置
// ============================================================

export interface DefaultConfigs {
  /** 默认地区 */
  defaultRegion: RegionCode;
  /** 审核模式 */
  reviewMode: "auto" | "manual" | "hybrid";
  /** 自动审批风险阈值（0-100，低于此分数自动通过） */
  autoApproveThreshold: number;
  /** 手动审核超时（小时） */
  reviewTimeout: number;
}

// ============================================================
// API 请求/响应
// ============================================================

export interface ConfigUpdateRequest {
  config: Partial<AccountOpeningConfig>;
  reason?: string;
}

export interface ConfigUpdateResponse {
  success: boolean;
  version: string;
  updatedAt: string;
  error?: string;
}

export interface ConfigVersion {
  version: string;
  updatedAt: string;
  updatedBy: string;
  changes: string;
}

export interface ConfigHistoryResponse {
  versions: ConfigVersion[];
}
