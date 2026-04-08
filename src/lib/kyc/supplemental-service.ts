/**
 * KYC 补充认证服务
 * 管理动态补充认证流程：发起、完成、权限检查
 */

import fs from "fs";
import path from "path";
import type {
  SupplementalKYCRequest,
  SupplementalKYCType,
  SupplementalKYCStatus,
  SupplementalRestrictions,
  VerificationStage,
  InitiateSupplementalKYCRequest,
  InitiateSupplementalKYCResponse,
  CancelSupplementalKYCResponse,
  CompleteSupplementalStageResponse,
  UserSupplementalKYCStatus,
  CheckKYCPermissionResponse,
  NotificationRecord,
  ListSupplementalReviewResponse,
} from "./supplemental-types";
import type { KYCTierLevel, RegionKYCFlow } from "./config-types";
import type { RegionCode } from "./region-config";
import type { KYCStatus } from "./types";

const KYC_SYSTEM_CONFIG_PATH = path.join(process.cwd(), "public", "data", "kyc-system-config.json");

/**
 * 读取 KYC 系统配置
 */
function getKYCSystemConfig(): { regionFlows: Record<RegionCode, RegionKYCFlow> } {
  const raw = fs.readFileSync(KYC_SYSTEM_CONFIG_PATH, "utf-8");
  return JSON.parse(raw);
}

// ============================================================
// 内存存储（实际项目中应使用数据库）
// ============================================================

// 补充认证请求存储
const supplementalRequestsStore = new Map<string, SupplementalKYCRequest>();

// 用户补充认证状态缓存
const userSupplementalStatusCache = new Map<string, UserSupplementalKYCStatus>();

// ============================================================
// 辅助函数
// ============================================================

/**
 * 生成唯一 ID
 */
function generateId(): string {
  return crypto.randomUUID();
}

/**
 * 生成补充认证请求 ID
 */
function generateRequestId(): string {
  return `sup-${generateId()}`;
}

/**
 * 获取当前时间 ISO 字符串
 */
function now(): string {
  return new Date().toISOString();
}

/**
 * 检查请求是否已完成所有要求阶段
 */
function isRequestCompleted(request: SupplementalKYCRequest): boolean {
  return request.requiredStages.every((stage) =>
    request.completedStages.includes(stage)
  );
}

/**
 * 合并多个限制配置
 */
function mergeRestrictions(
  ...restrictions: SupplementalRestrictions[]
): SupplementalRestrictions {
  return {
    depositEnabled: restrictions.every((r) => r.depositEnabled),
    withdrawEnabled: restrictions.every((r) => r.withdrawEnabled),
    tradingEnabled: restrictions.every((r) => r.tradingEnabled),
    accountOpeningEnabled: restrictions.every((r) => r.accountOpeningEnabled),
  };
}

// ============================================================
// 补充认证服务类
// ============================================================

export class SupplementalKYCService {
  constructor() {}

  // ============================================================
  // 发起补充认证
  // ============================================================

  async initiateSupplementalKYC(
    params: InitiateSupplementalKYCRequest,
    adminUserId: string,
    adminUserName?: string
  ): Promise<InitiateSupplementalKYCResponse> {
    try {
      // 验证参数
      if (!params.userId || !params.type || params.requiredStages.length === 0) {
        return {
          success: false,
          error: "Missing required parameters",
        };
      }

      // 检查用户是否已有同类型待处理请求
      const existingPending = await this.getPendingRequestByType(
        params.userId,
        params.type
      );
      if (existingPending) {
        return {
          success: false,
          error: `User already has a pending ${params.type} request`,
        };
      }

      // 创建补充认证请求
      const request: SupplementalKYCRequest = {
        id: generateRequestId(),
        userId: params.userId,
        type: params.type,
        requiredStages: params.requiredStages,
        completedStages: [],
        status: "pending",
        initiatedBy: adminUserId,
        initiatedByName: adminUserName,
        initiatedAt: now(),
        deadline: params.deadline,
        reason: params.reason,
        notes: params.notes,
        restrictions: {
          depositEnabled: params.restrictions?.depositEnabled ?? true,
          withdrawEnabled: params.restrictions?.withdrawEnabled ?? true,
          tradingEnabled: params.restrictions?.tradingEnabled ?? true,
          accountOpeningEnabled: params.restrictions?.accountOpeningEnabled ?? true,
        },
        targetTier: params.targetTier,
        notificationsSent: [],
        metadata: params.metadata,
        createdAt: now(),
        updatedAt: now(),
      };

      // 保存请求
      supplementalRequestsStore.set(request.id, request);

      // 清除用户缓存
      userSupplementalStatusCache.delete(params.userId);

      // 发送通知（如果启用）
      if (params.notifyUser) {
        await this.sendNotification(request);
      }

      return {
        success: true,
        request,
      };
    } catch (error) {
      console.error("Failed to initiate supplemental KYC:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ============================================================
  // 获取用户的待处理请求
  // ============================================================

  async getPendingRequests(userId: string): Promise<SupplementalKYCRequest[]> {
    const requests: SupplementalKYCRequest[] = [];
    for (const request of supplementalRequestsStore.values()) {
      if (request.userId === userId && ["pending", "in_progress"].includes(request.status)) {
        requests.push(request);
      }
    }
    return requests.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getPendingRequestByType(
    userId: string,
    type: SupplementalKYCType
  ): Promise<SupplementalKYCRequest | null> {
    for (const request of supplementalRequestsStore.values()) {
      if (
        request.userId === userId &&
        request.type === type &&
        ["pending", "in_progress"].includes(request.status)
      ) {
        return request;
      }
    }
    return null;
  }

  // ============================================================
  // 完成补充认证阶段
  // ============================================================

  async completeSupplementalStage(
    requestId: string,
    stage: VerificationStage,
    userId: string,
    data?: Record<string, unknown>
  ): Promise<CompleteSupplementalStageResponse> {
    try {
      const request = supplementalRequestsStore.get(requestId);
      if (!request) {
        return {
          success: false,
          allCompleted: false,
          error: "Supplemental request not found",
        };
      }

      if (request.userId !== userId) {
        return {
          success: false,
          allCompleted: false,
          error: "Unauthorized",
        };
      }

      if (!["pending", "in_progress"].includes(request.status)) {
        return {
          success: false,
          allCompleted: false,
          error: `Request is ${request.status}`,
        };
      }

      if (!request.requiredStages.includes(stage)) {
        return {
          success: false,
          allCompleted: false,
          error: `Stage ${stage} is not required for this request`,
        };
      }

      if (request.completedStages.includes(stage)) {
        return {
          success: false,
          allCompleted: false,
          error: `Stage ${stage} is already completed`,
        };
      }

      // 更新请求状态
      request.completedStages.push(stage);
      request.status = "in_progress";
      request.updatedAt = now();

      // 检查是否全部完成
      const allCompleted = isRequestCompleted(request);

      if (allCompleted) {
        request.status = "completed";
        request.completedAt = now();

        // 解除限制
        await this.removeRestrictions(request.userId, request.id);

        // 重新计算用户等级（如果需要）
        if (request.targetTier) {
          await this.upgradeUserTier(request.userId, request.targetTier);
        }
      }

      supplementalRequestsStore.set(request.id, request);

      // 清除用户缓存
      userSupplementalStatusCache.delete(userId);

      return {
        success: true,
        request,
        allCompleted,
      };
    } catch (error) {
      console.error("Failed to complete supplemental stage:", error);
      return {
        success: false,
        allCompleted: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ============================================================
  // 取消补充认证请求
  // ============================================================

  async cancelSupplementalRequest(
    requestId: string,
    reason: string,
    adminUserId: string
  ): Promise<CancelSupplementalKYCResponse> {
    try {
      const request = supplementalRequestsStore.get(requestId);
      if (!request) {
        return {
          success: false,
          error: "Supplemental request not found",
        };
      }

      if (!["pending", "in_progress"].includes(request.status)) {
        return {
          success: false,
          error: `Cannot cancel request with status ${request.status}`,
        };
      }

      request.status = "cancelled";
      request.notes = `${request.notes || ""}\nCancelled by ${adminUserId}: ${reason}`.trim();
      request.updatedAt = now();

      supplementalRequestsStore.set(request.id, request);

      // 解除限制
      await this.removeRestrictions(request.userId, request.id);

      // 清除用户缓存
      userSupplementalStatusCache.delete(request.userId);

      return { success: true };
    } catch (error) {
      console.error("Failed to cancel supplemental request:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ============================================================
  // 获取用户补充认证状态
  // ============================================================

  async getUserSupplementalStatus(userId: string): Promise<UserSupplementalKYCStatus> {
    // 检查缓存
    const cached = userSupplementalStatusCache.get(userId);
    if (cached) {
      return cached;
    }

    // 获取待处理请求
    const pendingRequests = await this.getPendingRequests(userId);

    // 计算有效限制（所有 pending 请求的合并）
    const effectiveRestrictions =
      pendingRequests.length > 0
        ? mergeRestrictions(...pendingRequests.map((r) => r.restrictions))
        : {
            depositEnabled: true,
            withdrawEnabled: true,
            tradingEnabled: true,
            accountOpeningEnabled: true,
          };

    // 合并需要完成的阶段
    const requiredStagesSet = new Set<VerificationStage>();
    for (const request of pendingRequests) {
      for (const stage of request.requiredStages) {
        if (!request.completedStages.includes(stage)) {
          requiredStagesSet.add(stage);
        }
      }
    }

    // 获取最近完成的请求
    const completedRequests = await this.getCompletedRequests(userId, 1);

    const status: UserSupplementalKYCStatus = {
      hasPendingRequest: pendingRequests.length > 0,
      pendingRequests,
      effectiveRestrictions,
      requiredStages: Array.from(requiredStagesSet),
      lastCompletedRequest: completedRequests[0],
    };

    // 缓存结果（5分钟）
    userSupplementalStatusCache.set(userId, status);
    setTimeout(() => userSupplementalStatusCache.delete(userId), 5 * 60 * 1000);

    return status;
  }

  async getCompletedRequests(
    userId: string,
    limit: number = 10
  ): Promise<SupplementalKYCRequest[]> {
    const requests: SupplementalKYCRequest[] = [];
    for (const request of supplementalRequestsStore.values()) {
      if (request.userId === userId && request.status === "completed") {
        requests.push(request);
      }
    }
    return requests
      .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
      .slice(0, limit);
  }

  // ============================================================
  // 检查操作权限
  // ============================================================

  async checkPermission(
    userId: string,
    action: "deposit" | "withdraw" | "trade" | "open_account" | "transfer",
    amount?: number,
    currency: string = "USD"
  ): Promise<CheckKYCPermissionResponse> {
    try {
      // 获取用户补充认证状态
      const supplementalStatus = await this.getUserSupplementalStatus(userId);

      // 检查是否有待处理的补充认证限制该操作
      if (supplementalStatus.hasPendingRequest) {
        const restrictions = supplementalStatus.effectiveRestrictions;

        switch (action) {
          case "withdraw":
            if (!restrictions.withdrawEnabled) {
              return {
                allowed: false,
                reason: "withdraw_restricted_due_to_supplemental_kyc",
                supplementalRequired: true,
                requiredStages: supplementalStatus.requiredStages,
                pendingRequest: supplementalStatus.pendingRequests[0],
                restrictions,
              };
            }
            break;
          case "deposit":
            if (!restrictions.depositEnabled) {
              return {
                allowed: false,
                reason: "deposit_restricted_due_to_supplemental_kyc",
                supplementalRequired: true,
                requiredStages: supplementalStatus.requiredStages,
                pendingRequest: supplementalStatus.pendingRequests[0],
                restrictions,
              };
            }
            break;
          case "trade":
            if (!restrictions.tradingEnabled) {
              return {
                allowed: false,
                reason: "trading_restricted_due_to_supplemental_kyc",
                supplementalRequired: true,
                requiredStages: supplementalStatus.requiredStages,
                pendingRequest: supplementalStatus.pendingRequests[0],
                restrictions,
              };
            }
            break;
          case "open_account":
            if (!restrictions.accountOpeningEnabled) {
              return {
                allowed: false,
                reason: "account_opening_restricted_due_to_supplemental_kyc",
                supplementalRequired: true,
                requiredStages: supplementalStatus.requiredStages,
                pendingRequest: supplementalStatus.pendingRequests[0],
                restrictions,
              };
            }
            break;
        }
      }

      // 检查大额提款触发补充认证
      if (action === "withdraw" && amount && amount > 0) {
        const triggerCheck = await this.checkLargeWithdrawalTrigger(
          userId,
          amount,
          currency
        );
        if (triggerCheck.triggered) {
          return {
            allowed: false,
            reason: "large_withdrawal_requires_supplemental_kyc",
            supplementalRequired: true,
            requiredStages: [triggerCheck.requiredStage!],
            pendingRequest: triggerCheck.createdRequest,
          };
        }
      }

      return { allowed: true };
    } catch (error) {
      console.error("Failed to check permission:", error);
      return {
        allowed: false,
        reason: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ============================================================
  // 大额提款触发检查
  // ============================================================

  async checkLargeWithdrawalTrigger(
    userId: string,
    amount: number,
    currency: string
  ): Promise<{
    triggered: boolean;
    requiredStage?: VerificationStage;
    createdRequest?: SupplementalKYCRequest;
  }> {
    // 获取用户地区和配置
    const userRegion = await this.getUserRegion(userId);
    if (!userRegion) {
      return { triggered: false };
    }

    const config = getKYCSystemConfig();
    const regionFlow = config.regionFlows[userRegion];

    if (!regionFlow || !regionFlow.supplementalRules?.largeWithdrawal?.enabled) {
      return { triggered: false };
    }

    const rule = regionFlow.supplementalRules.largeWithdrawal;

    // 检查金额是否超过阈值
    if (!rule.threshold || amount < rule.threshold) {
      return { triggered: false };
    }

    // 检查用户是否已完成该阶段
    const userKYC = await this.getUserKYC(userId);
    if (userKYC?.completedStages?.includes(rule.requireStage)) {
      return { triggered: false };
    }

    // 检查是否已有待处理的补充认证
    const existingPending = await this.getPendingRequests(userId);
    const hasAddressPending = existingPending.some((r) =>
      r.requiredStages.includes(rule.requireStage)
    );
    if (hasAddressPending) {
      return {
        triggered: true,
        requiredStage: rule.requireStage,
      };
    }

    // 自动创建补充认证请求
    const result = await this.initiateSupplementalKYC(
      {
        userId,
        type: "large_withdrawal",
        requiredStages: [rule.requireStage],
        reason: `Withdrawal amount ${amount} ${currency} exceeds threshold ${rule.threshold} ${rule.currency}`,
        restrictions: { withdrawEnabled: false },
        notifyUser: true,
        metadata: {
          amount,
          currency,
          threshold: rule.threshold,
          thresholdCurrency: rule.currency,
        },
      },
      "system",
      "System"
    );

    return {
      triggered: true,
      requiredStage: rule.requireStage,
      createdRequest: result.request,
    };
  }

  // ============================================================
  // 审核队列查询
  // ============================================================

  async listSupplementalReview(
    status: SupplementalKYCStatus | "all" = "all",
    type?: SupplementalKYCType,
    regionCode?: RegionCode,
    page: number = 1,
    limit: number = 20
  ): Promise<ListSupplementalReviewResponse> {
    const requests: SupplementalKYCRequest[] = [];

    for (const request of supplementalRequestsStore.values()) {
      // 状态过滤
      if (status !== "all" && request.status !== status) {
        continue;
      }

      // 类型过滤
      if (type && request.type !== type) {
        continue;
      }

      // 地区过滤（需要查询用户信息）
      if (regionCode) {
        const userRegion = await this.getUserRegion(request.userId);
        if (userRegion !== regionCode) {
          continue;
        }
      }

      requests.push(request);
    }

    // 排序：按创建时间倒序
    requests.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // 分页
    const total = requests.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedRequests = requests.slice(start, end);

    return {
      requests: paginatedRequests,
      total,
      page,
      limit,
    };
  }

  // ============================================================
  // 证件过期检查
  // ============================================================

  async checkDocumentExpiry(userId: string): Promise<{
    expired: boolean;
    expiringSoon: boolean;
    expiryDate?: string;
    daysUntilExpiry?: number;
  }> {
    // 获取用户 KYC 信息
    const userKYC = await this.getUserKYC(userId);
    if (!userKYC?.documentExpiryDate) {
      return { expired: false, expiringSoon: false };
    }

    const expiryDate = new Date(userKYC.documentExpiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    const userRegion = await this.getUserRegion(userId);
    const config = getKYCSystemConfig();
    const regionFlow = userRegion ? config.regionFlows[userRegion] : null;
    const warningDays = regionFlow?.supplementalRules?.documentExpiry?.warningDays ?? 30;

    return {
      expired: daysUntilExpiry < 0,
      expiringSoon: daysUntilExpiry >= 0 && daysUntilExpiry <= warningDays,
      expiryDate: userKYC.documentExpiryDate,
      daysUntilExpiry,
    };
  }

  async initiateDocumentExpiryRequest(
    userId: string,
    adminUserId: string,
    adminUserName?: string
  ): Promise<InitiateSupplementalKYCResponse> {
    const check = await this.checkDocumentExpiry(userId);

    if (!check.expired && !check.expiringSoon) {
      return {
        success: false,
        error: "Document is not expired or expiring soon",
      };
    }

    const reason = check.expired
      ? `Document expired on ${check.expiryDate}`
      : `Document expires in ${check.daysUntilExpiry} days (${check.expiryDate})`;

    // 计算截止日期
    const userRegion = await this.getUserRegion(userId);
    const config = getKYCSystemConfig();
    const regionFlow = userRegion ? config.regionFlows[userRegion] : null;
    const graceDays = regionFlow?.supplementalRules?.documentExpiry?.graceDays ?? 30;

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + graceDays);

    return this.initiateSupplementalKYC(
      {
        userId,
        type: "document_expiry",
        requiredStages: ["identity"],
        reason,
        deadline: deadline.toISOString(),
        restrictions: {
          withdrawEnabled: false,
          depositEnabled: true,
        },
        notifyUser: true,
        metadata: {
          documentExpiryDate: check.expiryDate,
          daysUntilExpiry: check.daysUntilExpiry,
        },
      },
      adminUserId,
      adminUserName
    );
  }

  // ============================================================
  // 内部辅助方法
  // ============================================================

  private async sendNotification(
    request: SupplementalKYCRequest
  ): Promise<void> {
    // TODO: 实现实际的通知发送逻辑
    const notification: NotificationRecord = {
      type: "email",
      sentAt: now(),
      status: "sent",
    };
    request.notificationsSent.push(notification);
    supplementalRequestsStore.set(request.id, request);
  }

  private async removeRestrictions(
    userId: string,
    requestId: string
  ): Promise<void> {
    // 检查用户是否还有其他待处理的补充认证
    const pendingRequests = await this.getPendingRequests(userId);
    const otherPending = pendingRequests.filter((r) => r.id !== requestId);

    if (otherPending.length === 0) {
      // 没有其他限制，可以解除
      console.log(`Restrictions removed for user ${userId}`);
    }
  }

  private async upgradeUserTier(
    userId: string,
    targetTier: KYCTierLevel
  ): Promise<void> {
    // TODO: 实现用户等级升级逻辑
    console.log(`Upgrading user ${userId} to tier ${targetTier}`);
  }

  private async getUserRegion(userId: string): Promise<RegionCode | null> {
    // TODO: 从用户数据中获取地区
    // 临时返回 null，实际应从用户服务获取
    return null;
  }

  private async getUserKYC(userId: string): Promise<{
    completedStages: VerificationStage[];
    documentExpiryDate?: string;
  } | null> {
    // TODO: 从用户 KYC 数据中获取
    // 临时返回 null，实际应从 KYC 服务获取
    return null;
  }
}

// ============================================================
// 单例导出
// ============================================================

export const supplementalKYCService = new SupplementalKYCService();
