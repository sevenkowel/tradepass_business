/**
 * 用户相关类型定义
 */

// 用户阶段
export type UserStage =
  | "registered"           // 刚注册，未KYC
  | "kyc_pending"          // KYC提交中
  | "kyc_done"             // KYC完成，未开户
  | "account_opening_failed" // 开户中断（未完成）
  | "account_rejected"     // 开户被拒绝
  | "account_opened"       // 已开户，未入金
  | "first_deposit"        // 首次入金，未交易
  | "active_trader"        // 活跃交易者
  | "vip";                 // VIP用户

// 开户状态
export type AccountOpeningStatus = "none" | "in_progress" | "failed" | "rejected" | "created";

// KYC状态
export type KYCStatus = "pending" | "verified" | "rejected";

// 交易账户
export interface TradingAccount {
  id: string;
  type: "live" | "demo";
  balance: number;
  equity: number;
  freeMargin: number;
  leverage: number;
  currency: string;
  /** 账户产品类型，如 Standard / ECN / Raw */
  accountType?: string;
}

// 余额信息
export interface BalanceInfo {
  total: number;
  available: number;
  floatingPnL: number;
  currency: string;
}

// 用户视角（用于开发和演示）
export interface UserPerspective {
  id: string;
  name: string;
  stage: UserStage;
  accounts: TradingAccount[];
  balance: BalanceInfo;
  kycStatus: KYCStatus;
  accountOpeningStatus: AccountOpeningStatus;
  hasDeposit: boolean;
  hasTraded: boolean;
  vipLevel: number;
  // 开户被拒绝时的原因
  rejectionReason?: string;
}

// 用户完整信息
export interface User {
  id: string;
  name: string;
  email: string;
  stage: UserStage;
  kycStatus: KYCStatus;
  vipLevel: number;
  accounts: TradingAccount[];
  balance: BalanceInfo;
  createdAt: string;
}
