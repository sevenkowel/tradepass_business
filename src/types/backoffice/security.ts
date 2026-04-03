/**
 * 安全管理类型定义
 */

// 安全事件类型
export type SecurityEventType =
  | "login_failed"
  | "login_blocked"
  | "ip_blocked"
  | "password_changed"
  | "2fa_enabled"
  | "2fa_disabled"
  | "suspicious_activity"
  | "brute_force_attempt"
  | "unusual_location";

// 安全事件严重级别
export type SecuritySeverity = "low" | "medium" | "high" | "critical";

// 安全设置
export interface SecuritySettings {
  id: string;

  // 登录安全
  enforceOtp: boolean;
  enforceTwoFactor: boolean;
  maxLoginFailures: number;
  lockoutDurationMinutes: number;
  sessionTimeoutMinutes: number;

  // 密码策略
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  passwordExpiryDays: number;
  passwordHistoryCount: number;

  // IP 围栏
  ipWhitelistEnabled: boolean;
  ipBlacklistEnabled: boolean;
  geoRestrictionEnabled: boolean;
  allowedCountries: string[];

  updatedAt: string;
  updatedBy: string;
}

// IP 规则
export interface IpRule {
  id: string;
  type: "whitelist" | "blacklist";
  ipRange: string; // CIDR 格式，如 192.168.1.0/24
  description?: string;
  createdAt: string;
  createdBy: string;
}

// 安全事件
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  staffId?: string;
  staffName?: string;
  ip: string;
  userAgent?: string;
  location?: string;
  details: Record<string, unknown>;
  severity: SecuritySeverity;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  createdAt: string;
}

// 更新安全设置请求
export interface UpdateSecuritySettingsRequest {
  enforceOtp?: boolean;
  enforceTwoFactor?: boolean;
  maxLoginFailures?: number;
  lockoutDurationMinutes?: number;
  sessionTimeoutMinutes?: number;
  passwordMinLength?: number;
  passwordRequireUppercase?: boolean;
  passwordRequireLowercase?: boolean;
  passwordRequireNumbers?: boolean;
  passwordRequireSymbols?: boolean;
  passwordExpiryDays?: number;
  passwordHistoryCount?: number;
  ipWhitelistEnabled?: boolean;
  ipBlacklistEnabled?: boolean;
  geoRestrictionEnabled?: boolean;
  allowedCountries?: string[];
}

// 创建 IP 规则请求
export interface CreateIpRuleRequest {
  type: "whitelist" | "blacklist";
  ipRange: string;
  description?: string;
}

// 安全事件筛选
export interface SecurityEventFilter {
  type?: SecurityEventType;
  severity?: SecuritySeverity | "all";
  staffId?: string;
  startDate?: string;
  endDate?: string;
  resolved?: boolean | "all";
}

// 密码强度要求
export interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
}

// 登录安全统计
export interface LoginSecurityStats {
  totalLoginsToday: number;
  failedLoginsToday: number;
  blockedAttemptsToday: number;
  uniqueIpsToday: number;
  suspiciousEventsToday: number;
}
