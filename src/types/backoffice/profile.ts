/**
 * 个人中心类型定义
 */

// 用户个人资料
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: {
    id: string;
    name: string;
  };
  department?: string;
  twoFactorEnabled: boolean;
  lastLoginAt: string;
  createdAt: string;
}

// 登录历史记录
export interface LoginHistory {
  id: string;
  ip: string;
  userAgent: string;
  browser: string;
  os: string;
  location?: string;
  status: 'success' | 'failed';
  failReason?: string;
  createdAt: string;
}

// 个人资料更新请求
export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
  avatar?: string;
}

// 修改密码请求
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 2FA 状态
export interface TwoFactorStatus {
  enabled: boolean;
  method?: 'totp' | 'sms' | 'email';
  setupAt?: string;
  backupCodesRemaining?: number;
}
