/**
 * 安全管理 Mock 数据
 */

import type {
  SecuritySettings,
  IpRule,
  SecurityEvent,
  LoginSecurityStats,
} from "@/types/backoffice/security";

// Mock 安全设置
export const mockSecuritySettings: SecuritySettings = {
  id: "security-001",
  enforceOtp: false,
  enforceTwoFactor: false,
  maxLoginFailures: 5,
  lockoutDurationMinutes: 30,
  sessionTimeoutMinutes: 120,
  passwordMinLength: 8,
  passwordRequireUppercase: true,
  passwordRequireLowercase: true,
  passwordRequireNumbers: true,
  passwordRequireSymbols: false,
  passwordExpiryDays: 90,
  passwordHistoryCount: 5,
  ipWhitelistEnabled: false,
  ipBlacklistEnabled: true,
  geoRestrictionEnabled: false,
  allowedCountries: ["CN", "US", "SG", "JP"],
  updatedAt: "2026-04-01T10:00:00Z",
  updatedBy: "staff-001",
};

// Mock IP 规则
export const mockIpRules: IpRule[] = [
  {
    id: "ip-001",
    type: "blacklist",
    ipRange: "198.51.100.0/24",
    description: "可疑攻击源 IP 段",
    createdAt: "2026-03-15T08:00:00Z",
    createdBy: "staff-001",
  },
  {
    id: "ip-002",
    type: "blacklist",
    ipRange: "203.0.113.45/32",
    description: "暴力破解尝试",
    createdAt: "2026-03-20T14:30:00Z",
    createdBy: "staff-001",
  },
  {
    id: "ip-003",
    type: "whitelist",
    ipRange: "192.168.0.0/16",
    description: "公司内部网络",
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "staff-001",
  },
  {
    id: "ip-004",
    type: "whitelist",
    ipRange: "10.0.0.0/8",
    description: "VPN 网络",
    createdAt: "2024-01-01T00:00:00Z",
    createdBy: "staff-001",
  },
];

// Mock 安全事件
export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "evt-001",
    type: "login_failed",
    staffId: "staff-003",
    staffName: "李四",
    ip: "203.0.113.45",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    location: "广州市, 中国",
    details: { reason: "密码错误", attemptCount: 3 },
    severity: "medium",
    resolved: true,
    resolvedAt: "2026-04-02T20:35:00Z",
    resolvedBy: "staff-001",
    createdAt: "2026-04-02T20:30:00Z",
  },
  {
    id: "evt-002",
    type: "ip_blocked",
    ip: "198.51.100.25",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    location: "深圳市, 中国",
    details: { reason: "IP 在黑名单中", blockedRuleId: "ip-001" },
    severity: "high",
    resolved: false,
    createdAt: "2026-04-01T10:00:00Z",
  },
  {
    id: "evt-003",
    type: "brute_force_attempt",
    ip: "192.0.2.100",
    location: "未知",
    details: { attemptCount: 50, targetAccounts: ["admin", "root", "test"] },
    severity: "critical",
    resolved: true,
    resolvedAt: "2026-03-28T09:00:00Z",
    resolvedBy: "staff-001",
    createdAt: "2026-03-28T08:30:00Z",
  },
  {
    id: "evt-004",
    type: "suspicious_activity",
    staffId: "staff-006",
    staffName: "陈七",
    ip: "198.51.100.30",
    location: "香港",
    details: { activity: "凌晨3点登录", usualLocation: "深圳市" },
    severity: "medium",
    resolved: false,
    createdAt: "2026-03-25T03:15:00Z",
  },
  {
    id: "evt-005",
    type: "2fa_enabled",
    staffId: "staff-002",
    staffName: "张三",
    ip: "192.168.1.101",
    location: "北京市, 中国",
    details: { method: "TOTP" },
    severity: "low",
    resolved: true,
    resolvedAt: "2026-03-20T10:00:00Z",
    createdAt: "2026-03-20T10:00:00Z",
  },
  {
    id: "evt-006",
    type: "password_changed",
    staffId: "staff-004",
    staffName: "王五",
    ip: "192.168.1.103",
    location: "杭州市, 中国",
    details: { reason: "定期更换" },
    severity: "low",
    resolved: true,
    resolvedAt: "2026-03-18T14:00:00Z",
    createdAt: "2026-03-18T14:00:00Z",
  },
  {
    id: "evt-007",
    type: "login_blocked",
    staffId: "staff-006",
    staffName: "陈七",
    ip: "198.51.100.30",
    location: "深圳市, 中国",
    details: { reason: "登录失败次数过多", lockoutDuration: 30 },
    severity: "high",
    resolved: true,
    resolvedAt: "2026-04-01T10:30:00Z",
    resolvedBy: "staff-001",
    createdAt: "2026-04-01T10:00:00Z",
  },
  {
    id: "evt-008",
    type: "unusual_location",
    staffId: "staff-001",
    staffName: "系统管理员",
    ip: "185.220.101.50",
    location: "俄罗斯, 莫斯科",
    details: { usualLocation: "上海市, 中国", device: "Unknown Device" },
    severity: "critical",
    resolved: false,
    createdAt: "2026-03-10T02:00:00Z",
  },
];

// Mock 登录安全统计
export const mockLoginSecurityStats: LoginSecurityStats = {
  totalLoginsToday: 156,
  failedLoginsToday: 12,
  blockedAttemptsToday: 3,
  uniqueIpsToday: 45,
  suspiciousEventsToday: 2,
};

// 国家列表
export const countries = [
  { code: "CN", name: "中国" },
  { code: "US", name: "美国" },
  { code: "SG", name: "新加坡" },
  { code: "JP", name: "日本" },
  { code: "HK", name: "中国香港" },
  { code: "TW", name: "中国台湾" },
  { code: "GB", name: "英国" },
  { code: "DE", name: "德国" },
  { code: "AU", name: "澳大利亚" },
  { code: "CA", name: "加拿大" },
];

// 安全事件类型标签
export const securityEventTypeLabels: Record<string, string> = {
  login_failed: "登录失败",
  login_blocked: "登录被拦截",
  ip_blocked: "IP 被拦截",
  password_changed: "密码修改",
  "2fa_enabled": "启用 2FA",
  "2fa_disabled": "禁用 2FA",
  suspicious_activity: "可疑活动",
  brute_force_attempt: "暴力破解",
  unusual_location: "异地登录",
};

// 严重级别标签
export const severityLabels: Record<string, { label: string; color: string }> = {
  low: { label: "低", color: "bg-slate-100 text-slate-700" },
  medium: { label: "中", color: "bg-amber-100 text-amber-700" },
  high: { label: "高", color: "bg-orange-100 text-orange-700" },
  critical: { label: "严重", color: "bg-red-100 text-red-700" },
};
