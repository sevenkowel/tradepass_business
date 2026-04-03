/**
 * 角色权限管理系统类型定义
 * Role & Permission Management Types
 */

import type { PermissionAction } from './common';

// ============================================================
// 权限模块定义
// ============================================================

export type PermissionModule = 
  | 'dashboard'
  | 'accounts'
  | 'trading'
  | 'funds'
  | 'compliance'
  | 'risk'
  | 'system'
  | 'marketing'
  | 'reports'
  | 'ib'
  | 'copy_trading'
  | 'ai_signals';

// 权限模块配置
export interface PermissionModuleConfig {
  id: PermissionModule;
  name: string;
  icon: string;
  description: string;
  actions: PermissionActionDefinition[];
}

// 权限动作定义
export interface PermissionActionDefinition {
  action: PermissionAction;
  name: string;
  description: string;
}

// ============================================================
// 角色相关类型
// ============================================================

export interface Permission {
  module: PermissionModule;
  actions: PermissionAction[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  userCount: number;
  isSystem: boolean;  // 系统预设角色，不可删除
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 创建角色请求
export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: Permission[];
}

// 更新角色请求
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: Permission[];
  status?: 'active' | 'inactive';
}

// 角色列表筛选
export interface RoleFilter {
  keyword?: string;
  status?: 'active' | 'inactive' | 'all';
  isSystem?: boolean;
}

// ============================================================
// 管理员账号相关类型
// ============================================================

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  phone?: string;
  realName?: string;
  avatar?: string;
  role: Role;
  lastLoginAt: string;
  lastLoginIp?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// 创建管理员请求
export interface CreateAdminRequest {
  username: string;
  email: string;
  phone?: string;
  realName?: string;
  password: string;
  roleId: string;
}

// 更新管理员请求
export interface UpdateAdminRequest {
  email?: string;
  phone?: string;
  realName?: string;
  roleId?: string;
  status?: 'active' | 'inactive';
}

// 重置密码请求
export interface ResetPasswordRequest {
  userId: string;
  newPassword: string;
}

// 管理员列表筛选
export interface AdminFilter {
  keyword?: string;
  roleId?: string;
  status?: 'active' | 'inactive' | 'all';
}

// ============================================================
// 权限树相关类型
// ============================================================

export interface PermissionTreeNode {
  module: PermissionModule;
  name: string;
  icon: string;
  description: string;
  actions: PermissionTreeAction[];
  checked: boolean;
  indeterminate: boolean;
}

export interface PermissionTreeAction {
  action: PermissionAction;
  name: string;
  description: string;
  checked: boolean;
}

// ============================================================
// API 响应类型
// ============================================================

export interface RoleListResponse {
  roles: Role[];
  total: number;
}

export interface AdminListResponse {
  users: AdminUser[];
  total: number;
}

export interface PermissionModulesResponse {
  modules: PermissionModuleConfig[];
}
