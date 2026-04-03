/**
 * 双因素认证 (2FA) 类型定义
 */

/** 2FA 配置状态 */
export interface TwoFactorConfig {
  /** 是否已启用 */
  enabled: boolean;
  /** TOTP Secret (加密存储，仅后端使用) */
  secret?: string;
  /** 备份码哈希数组 */
  backupCodeHashes?: string[];
  /** 剩余可用备份码数量 */
  backupCodesRemaining?: number;
  /** 创建时间 */
  createdAt?: string;
  /** 最后使用时间 */
  lastUsedAt?: string;
}

/** 2FA 状态响应 */
export interface TwoFactorStatus {
  enabled: boolean;
  createdAt?: string;
  backupCodesRemaining?: number;
}

/** 启用 2FA 初始化请求 */
export interface Enable2FAInitRequest {
  /** 当前登录密码 */
  password: string;
}

/** 启用 2FA 初始化响应 */
export interface Enable2FAInitResponse {
  /** TOTP Secret (明文，仅展示一次) */
  secret: string;
  /** QR Code Data URL */
  qrCodeUrl: string;
}

/** 启用 2FA 验证请求 */
export interface Enable2FAVerifyRequest {
  /** 6位 TOTP 验证码 */
  code: string;
}

/** 启用 2FA 验证响应 */
export interface Enable2FAVerifyResponse {
  /** 备份码列表 (明文，仅展示一次) */
  backupCodes: string[];
}

/** 禁用 2FA 请求 */
export interface Disable2FARequest {
  /** 当前登录密码 */
  password: string;
  /** 6位 TOTP 验证码 */
  code: string;
}

/** 查看备份码请求 */
export interface ViewBackupCodesRequest {
  /** 当前登录密码 */
  password: string;
}

/** 查看备份码响应 */
export interface ViewBackupCodesResponse {
  /** 备份码列表 */
  backupCodes: string[];
}

/** 重新生成备份码请求 */
export interface RegenerateBackupCodesRequest {
  /** 当前登录密码 */
  password: string;
  /** 6位 TOTP 验证码 */
  code: string;
}

/** 重新生成备份码响应 */
export interface RegenerateBackupCodesResponse {
  /** 新的备份码列表 */
  backupCodes: string[];
}

/** 2FA 登录请求 */
export interface TwoFactorLoginRequest {
  /** 6位验证码或备份码 */
  code: string;
  /** 是否使用备份码 */
  useBackupCode?: boolean;
  /** 是否记住设备 */
  rememberDevice?: boolean;
}

/** 2FA 验证错误类型 */
export type TwoFactorErrorType =
  | "INVALID_CODE"
  | "CODE_EXPIRED"
  | "BACKUP_CODE_USED"
  | "INVALID_PASSWORD"
  | "TOO_MANY_ATTEMPTS"
  | "NOT_ENABLED";

/** 2FA 验证错误 */
export interface TwoFactorError {
  type: TwoFactorErrorType;
  message: string;
  /** 剩余尝试次数 */
  remainingAttempts?: number;
  /** 锁定剩余秒数 */
  lockoutSeconds?: number;
}
