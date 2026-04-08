/**
 * KYC 补充认证类型定义
 * 支持动态补充认证流程
 */

import type { VerificationStage, KYCTierLevel } from "./config-types";

// Re-export types from config-types for convenience
export type { VerificationStage, KYCTierLevel } from "./config-types";

// ============================================================
// 补充认证请求类型
// ============================================================

export type SupplementalKYCType =
  | "document_expiry"      // 证件过期更新
  | "risk_control"         // 风控补充认证
  | "manual_review"        // 人工审核发起
  | "aml_compliance"       // AML合规要求
  | "large_withdrawal"     // 大额提款触发
  | "tier_upgrade";        // 等级提升申请

export type SupplementalKYCStatus =
  | "pending"      // 待处理（用户未开始）
  | "in_progress"  // 进行中（用户已开始）
  | "completed"    // 已完成
  | "expired"      // 已过期
  | "cancelled";   // 已取消

// ============================================================
// 功能限制配置
// ============================================================

export interface SupplementalRestrictions {
  depositEnabled: boolean;
  withdrawEnabled: boolean;
  tradingEnabled: boolean;
  accountOpeningEnabled: boolean;
}

// ============================================================
// 补充认证请求
// ============================================================

export interface SupplementalKYCRequest {
  id: string;
  userId: string;

  // 补充认证类型
  type: SupplementalKYCType;

  // 要求的阶段（支持多阶段同时要求）
  requiredStages: VerificationStage[];

  // 已完成的阶段
  completedStages: VerificationStage[];

  // 当前状态
  status: SupplementalKYCStatus;

  // 发起信息
  initiatedBy: string;      // admin user id
  initiatedByName?: string; // admin user name
  initiatedAt: string;      // ISO date

  // 截止日期
  deadline?: string;        // ISO date

  // 原因说明
  reason: string;
  notes?: string;

  // 限制措施
  restrictions: SupplementalRestrictions;

  // 完成后目标等级（可选）
  targetTier?: KYCTierLevel;

  // 完成信息
  completedAt?: string;
  completedBy?: string;     // 审核人员

  // 通知记录
  notificationsSent: NotificationRecord[];

  // 关联的审核记录
  reviewId?: string;

  // 元数据
  metadata?: {
    triggeredBy?: string;       // 触发来源
    amount?: number;            // 触发金额（如大额提款）
    currency?: string;
    riskScore?: number;         // 风险评分
    documentType?: string;      // 证件类型
    documentExpiryDate?: string;
  };

  // 时间戳
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// 通知记录
// ============================================================

export interface NotificationRecord {
  type: "email" | "sms" | "push" | "in_app";
  sentAt: string;
  status: "sent" | "delivered" | "failed";
  templateId?: string;
  error?: string;
}

// ============================================================
// 用户补充认证状态（聚合）
// ============================================================

export interface UserSupplementalKYCStatus {
  // 是否有待处理的补充认证
  hasPendingRequest: boolean;

  // 待处理的请求列表
  pendingRequests: SupplementalKYCRequest[];

  // 当前有效的限制（所有 pending 请求的合并）
  effectiveRestrictions: SupplementalRestrictions;

  // 需要完成的阶段（去重合并）
  requiredStages: VerificationStage[];

  // 最近完成的补充认证
  lastCompletedRequest?: SupplementalKYCRequest;
}

// ============================================================
// API 请求/响应类型
// ============================================================

// 发起补充认证请求
export interface InitiateSupplementalKYCRequest {
  userId: string;
  type: SupplementalKYCType;
  requiredStages: VerificationStage[];
  reason: string;
  notes?: string;
  deadline?: string;        // ISO date
  restrictions?: Partial<SupplementalRestrictions>;
  targetTier?: KYCTierLevel;
  notifyUser: boolean;
  metadata?: Record<string, unknown>;
}

export interface InitiateSupplementalKYCResponse {
  success: boolean;
  request?: SupplementalKYCRequest;
  error?: string;
}

// 取消补充认证请求
export interface CancelSupplementalKYCRequest {
  requestId: string;
  reason: string;
}

export interface CancelSupplementalKYCResponse {
  success: boolean;
  error?: string;
}

// 完成补充认证阶段
export interface CompleteSupplementalStageRequest {
  requestId: string;
  stage: VerificationStage;
  data?: Record<string, unknown>;
}

export interface CompleteSupplementalStageResponse {
  success: boolean;
  request?: SupplementalKYCRequest;
  allCompleted: boolean;
  error?: string;
}

// 获取用户补充认证状态
export interface GetUserSupplementalKYCStatusResponse {
  status: UserSupplementalKYCStatus;
  error?: string;
}

// 检查操作权限
export interface CheckKYCPermissionRequest {
  action: "deposit" | "withdraw" | "trade" | "open_account" | "transfer";
  amount?: number;
  currency?: string;
}

export interface CheckKYCPermissionResponse {
  allowed: boolean;
  reason?: string;
  supplementalRequired?: boolean;
  requiredStages?: VerificationStage[];
  pendingRequest?: SupplementalKYCRequest;
  restrictions?: SupplementalRestrictions;
}

// 补充认证审核列表查询
export interface ListSupplementalReviewRequest {
  status?: SupplementalKYCStatus | "all";
  type?: SupplementalKYCType;
  regionCode?: string;
  page?: number;
  limit?: number;
}

export interface ListSupplementalReviewResponse {
  requests: SupplementalKYCRequest[];
  total: number;
  page: number;
  limit: number;
}

// ============================================================
// 默认限制配置
// ============================================================

export const DEFAULT_RESTRICTIONS: SupplementalRestrictions = {
  depositEnabled: true,
  withdrawEnabled: true,
  tradingEnabled: true,
  accountOpeningEnabled: true,
};

// 完全限制（用于高风险场景）
export const FULL_RESTRICTIONS: SupplementalRestrictions = {
  depositEnabled: false,
  withdrawEnabled: false,
  tradingEnabled: false,
  accountOpeningEnabled: false,
};

// 仅限制提款（用于大额提款补充认证）
export const WITHDRAW_ONLY_RESTRICTIONS: SupplementalRestrictions = {
  depositEnabled: true,
  withdrawEnabled: false,
  tradingEnabled: true,
  accountOpeningEnabled: true,
};

// ============================================================
// 辅助函数
// ============================================================

/**
 * 检查补充认证请求是否已完成所有要求阶段
 */
export function isSupplementalRequestCompleted(
  request: SupplementalKYCRequest
): boolean {
  return request.requiredStages.every((stage) =>
    request.completedStages.includes(stage)
  );
}

/**
 * 合并多个限制配置（任一限制为 false 则结果为 false）
 */
export function mergeRestrictions(
  ...restrictions: SupplementalRestrictions[]
): SupplementalRestrictions {
  return {
    depositEnabled: restrictions.every((r) => r.depositEnabled),
    withdrawEnabled: restrictions.every((r) => r.withdrawEnabled),
    tradingEnabled: restrictions.every((r) => r.tradingEnabled),
    accountOpeningEnabled: restrictions.every((r) => r.accountOpeningEnabled),
  };
}

/**
 * 获取补充认证类型的显示名称
 */
export function getSupplementalKYCTypeLabel(type: SupplementalKYCType): string {
  const labels: Record<SupplementalKYCType, string> = {
    document_expiry: "Document Expiry Update",
    risk_control: "Risk Control Verification",
    manual_review: "Manual Review Request",
    aml_compliance: "AML Compliance",
    large_withdrawal: "Large Withdrawal Verification",
    tier_upgrade: "Tier Upgrade Application",
  };
  return labels[type] || type;
}

/**
 * 获取补充认证状态的显示名称
 */
export function getSupplementalKYCStatusLabel(
  status: SupplementalKYCStatus
): string {
  const labels: Record<SupplementalKYCStatus, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    expired: "Expired",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}
