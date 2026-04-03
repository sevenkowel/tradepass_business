/**
 * 个人中心 Mock API
 */

import type { UserProfile, LoginHistory, UpdateProfileRequest, ChangePasswordRequest, TwoFactorStatus } from "@/types/backoffice/profile";

// Mock 当前用户资料
export const mockCurrentUser: UserProfile = {
  id: "staff-001",
  username: "admin",
  email: "admin@tradepass.com",
  fullName: "系统管理员",
  phone: "+86 138 **** 8888",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  role: {
    id: "role-001",
    name: "超级管理员",
  },
  department: "技术部",
  twoFactorEnabled: true,
  lastLoginAt: "2026-04-03T10:30:00Z",
  createdAt: "2024-01-01T00:00:00Z",
};

// Mock 登录历史
export const mockLoginHistory: LoginHistory[] = [
  {
    id: "log-001",
    ip: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    browser: "Chrome 123.0",
    os: "macOS 14.0",
    location: "上海市, 中国",
    status: "success",
    createdAt: "2026-04-03T10:30:00Z",
  },
  {
    id: "log-002",
    ip: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    browser: "Chrome 123.0",
    os: "macOS 14.0",
    location: "上海市, 中国",
    status: "success",
    createdAt: "2026-04-03T08:15:00Z",
  },
  {
    id: "log-003",
    ip: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    browser: "Chrome 123.0",
    os: "macOS 14.0",
    location: "上海市, 中国",
    status: "success",
    createdAt: "2026-04-02T18:30:00Z",
  },
  {
    id: "log-004",
    ip: "203.0.113.45",
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    browser: "Safari Mobile",
    os: "iOS 17.0",
    location: "北京市, 中国",
    status: "failed",
    failReason: "密码错误",
    createdAt: "2026-04-02T09:00:00Z",
  },
  {
    id: "log-005",
    ip: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    browser: "Chrome 123.0",
    os: "macOS 14.0",
    location: "上海市, 中国",
    status: "success",
    createdAt: "2026-04-01T16:45:00Z",
  },
  {
    id: "log-006",
    ip: "198.51.100.25",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    browser: "Edge 122.0",
    os: "Windows 11",
    location: "广州市, 中国",
    status: "failed",
    failReason: "IP 不在白名单",
    createdAt: "2026-03-28T14:20:00Z",
  },
  {
    id: "log-007",
    ip: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    browser: "Chrome 123.0",
    os: "macOS 14.0",
    location: "上海市, 中国",
    status: "success",
    createdAt: "2026-03-28T09:00:00Z",
  },
];

// Mock 2FA 状态
export const mockTwoFactorStatus: TwoFactorStatus = {
  enabled: true,
  method: "totp",
  setupAt: "2024-06-15T00:00:00Z",
};

// 模拟延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API 方法
export const profileApi = {
  // 获取当前用户资料
  getCurrentUser: async (): Promise<UserProfile> => {
    await delay(500);
    return { ...mockCurrentUser };
  },

  // 更新用户资料
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    await delay(800);
    mockCurrentUser.fullName = data.fullName || mockCurrentUser.fullName;
    mockCurrentUser.phone = data.phone || mockCurrentUser.phone;
    mockCurrentUser.avatar = data.avatar || mockCurrentUser.avatar;
    return { ...mockCurrentUser };
  },

  // 修改密码
  changePassword: async (data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> => {
    await delay(1000);
    
    // 模拟当前密码验证
    if (data.currentPassword !== "admin123") {
      return { success: false, message: "当前密码不正确" };
    }
    
    // 模拟密码修改成功
    return { success: true, message: "密码修改成功，请使用新密码重新登录" };
  },

  // 获取登录历史
  getLoginHistory: async (limit: number = 10): Promise<LoginHistory[]> => {
    await delay(600);
    return mockLoginHistory.slice(0, limit);
  },

  // 获取 2FA 状态
  getTwoFactorStatus: async (): Promise<TwoFactorStatus> => {
    await delay(400);
    return { ...mockTwoFactorStatus };
  },

  // 上传头像
  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    await delay(1500);
    // 模拟上传成功，返回新的头像 URL
    const newAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
    mockCurrentUser.avatar = newAvatarUrl;
    return { url: newAvatarUrl };
  },
};
