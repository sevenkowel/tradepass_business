/**
 * 员工账户管理类型定义
 */

// 员工状态
export type StaffStatus = "active" | "inactive" | "suspended";

// 员工账户
export interface Staff {
  id: string;
  username: string;
  email: string;
  phone?: string;
  fullName: string;
  avatar?: string;
  roleId: string;
  roleName: string;
  department?: string;
  status: StaffStatus;
  lastLoginAt?: string;
  lastLoginIp?: string;
  loginFailCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  twoFactorEnabled: boolean;
}

// 创建员工请求
export interface CreateStaffRequest {
  username: string;
  email: string;
  phone?: string;
  fullName: string;
  roleId: string;
  department?: string;
  sendWelcomeEmail: boolean;
}

// 更新员工请求
export interface UpdateStaffRequest {
  fullName?: string;
  phone?: string;
  roleId?: string;
  department?: string;
  status?: StaffStatus;
}

// 登录历史
export interface StaffLoginLog {
  id: string;
  staffId: string;
  staffName: string;
  ip: string;
  userAgent: string;
  browser?: string;
  os?: string;
  location?: string;
  status: "success" | "failed" | "blocked";
  failReason?: string;
  createdAt: string;
}

// 操作审计日志
export interface StaffAuditLog {
  id: string;
  staffId: string;
  staffName: string;
  action: string;
  module: string;
  description: string;
  details: Record<string, unknown>;
  ip: string;
  createdAt: string;
}

// 员工筛选条件
export interface StaffFilter {
  keyword?: string;
  status?: StaffStatus | "all";
  roleId?: string;
  department?: string;
}

// 登录日志筛选
export interface LoginLogFilter {
  staffId?: string;
  status?: "success" | "failed" | "blocked" | "all";
  startDate?: string;
  endDate?: string;
}

// 审计日志筛选
export interface AuditLogFilter {
  staffId?: string;
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}
