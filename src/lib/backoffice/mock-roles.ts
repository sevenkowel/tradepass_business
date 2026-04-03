/**
 * 角色权限管理 Mock 数据
 * Role & Permission Management Mock Data
 */

import type {
  Role,
  AdminUser,
  PermissionModuleConfig,
  Permission,
} from '@/types/backoffice/role';

// ============================================================
// 权限模块配置
// ============================================================

export const permissionModules: PermissionModuleConfig[] = [
  {
    id: 'dashboard',
    name: '仪表盘',
    icon: 'LayoutDashboard',
    description: '系统数据概览',
    actions: [
      { action: 'view', name: '查看', description: '查看仪表盘数据' },
    ],
  },
  {
    id: 'accounts',
    name: '客户管理',
    icon: 'Users',
    description: '客户账号管理',
    actions: [
      { action: 'view', name: '查看', description: '查看客户列表和详情' },
      { action: 'create', name: '创建', description: '创建新客户账号' },
      { action: 'edit', name: '编辑', description: '编辑客户信息' },
      { action: 'delete', name: '删除', description: '删除客户账号' },
      { action: 'export', name: '导出', description: '导出客户数据' },
    ],
  },
  {
    id: 'trading',
    name: '交易管理',
    icon: 'BarChart3',
    description: '交易订单管理',
    actions: [
      { action: 'view', name: '查看', description: '查看交易记录' },
      { action: 'edit', name: '编辑', description: '修改交易信息' },
      { action: 'approve', name: '审批', description: '审批特殊交易' },
      { action: 'export', name: '导出', description: '导出交易数据' },
    ],
  },
  {
    id: 'funds',
    name: '资金管理',
    icon: 'Wallet',
    description: '出入金管理',
    actions: [
      { action: 'view', name: '查看', description: '查看资金流水' },
      { action: 'approve', name: '审批出入金', description: '审批入金和出金申请' },
      { action: 'export', name: '导出', description: '导出资金记录' },
    ],
  },
  {
    id: 'compliance',
    name: 'KYC审核',
    icon: 'ShieldCheck',
    description: '身份认证审核',
    actions: [
      { action: 'view', name: '查看', description: '查看KYC申请' },
      { action: 'edit', name: '审核', description: '审核KYC申请' },
      { action: 'export', name: '导出', description: '导出KYC数据' },
    ],
  },
  {
    id: 'risk',
    name: '风控管理',
    icon: 'AlertTriangle',
    description: '风险控制管理',
    actions: [
      { action: 'view', name: '查看', description: '查看风控数据' },
      { action: 'edit', name: '配置', description: '配置风控规则' },
      { action: 'approve', name: '处理警报', description: '处理风险警报' },
    ],
  },
  {
    id: 'system',
    name: '系统管理',
    icon: 'Settings',
    description: '系统配置管理',
    actions: [
      { action: 'view', name: '查看', description: '查看系统配置' },
      { action: 'create', name: '创建', description: '创建配置项' },
      { action: 'edit', name: '编辑', description: '编辑系统配置' },
      { action: 'delete', name: '删除', description: '删除配置项' },
      { action: 'admin', name: '管理员权限', description: '角色和管理员管理' },
    ],
  },
  {
    id: 'marketing',
    name: '营销工具',
    icon: 'Megaphone',
    description: '营销活动管理',
    actions: [
      { action: 'view', name: '查看', description: '查看营销活动' },
      { action: 'create', name: '创建', description: '创建营销活动' },
      { action: 'edit', name: '编辑', description: '编辑营销活动' },
      { action: 'delete', name: '删除', description: '删除营销活动' },
    ],
  },
  {
    id: 'reports',
    name: '报表中心',
    icon: 'FileText',
    description: '数据报表管理',
    actions: [
      { action: 'view', name: '查看', description: '查看报表' },
      { action: 'export', name: '导出', description: '导出报表' },
    ],
  },
  {
    id: 'ib',
    name: 'IB代理',
    icon: 'Network',
    description: '代理管理',
    actions: [
      { action: 'view', name: '查看', description: '查看代理数据' },
      { action: 'edit', name: '编辑', description: '编辑代理信息' },
      { action: 'approve', name: '审批', description: '审批代理申请' },
    ],
  },
  {
    id: 'copy_trading',
    name: '跟单交易',
    icon: 'Copy',
    description: '跟单系统管理',
    actions: [
      { action: 'view', name: '查看', description: '查看跟单数据' },
      { action: 'edit', name: '管理', description: '管理交易员' },
    ],
  },
  {
    id: 'ai_signals',
    name: 'AI信号',
    icon: 'Brain',
    description: 'AI交易信号管理',
    actions: [
      { action: 'view', name: '查看', description: '查看AI信号' },
      { action: 'edit', name: '配置', description: '配置信号策略' },
    ],
  },
];

// ============================================================
// 预设角色
// ============================================================

// 超级管理员 - 拥有所有权限
const superAdminPermissions: Permission[] = [
  { module: 'dashboard', actions: ['view'] },
  { module: 'accounts', actions: ['view', 'create', 'edit', 'delete', 'export'] },
  { module: 'trading', actions: ['view', 'edit', 'approve', 'export'] },
  { module: 'funds', actions: ['view', 'approve', 'export'] },
  { module: 'compliance', actions: ['view', 'edit', 'export'] },
  { module: 'risk', actions: ['view', 'edit', 'approve'] },
  { module: 'system', actions: ['view', 'create', 'edit', 'delete', 'admin'] },
  { module: 'marketing', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'reports', actions: ['view', 'export'] },
  { module: 'ib', actions: ['view', 'edit', 'approve'] },
  { module: 'copy_trading', actions: ['view', 'edit'] },
  { module: 'ai_signals', actions: ['view', 'edit'] },
];

// 运营管理员 - 日常运营管理
const operationPermissions: Permission[] = [
  { module: 'dashboard', actions: ['view'] },
  { module: 'accounts', actions: ['view', 'create', 'edit', 'export'] },
  { module: 'trading', actions: ['view', 'export'] },
  { module: 'funds', actions: ['view', 'export'] },
  { module: 'compliance', actions: ['view', 'export'] },
  { module: 'marketing', actions: ['view', 'create', 'edit', 'delete'] },
  { module: 'reports', actions: ['view', 'export'] },
  { module: 'ib', actions: ['view', 'edit'] },
];

// 客服 - 客户服务
const supportPermissions: Permission[] = [
  { module: 'dashboard', actions: ['view'] },
  { module: 'accounts', actions: ['view', 'edit'] },
  { module: 'trading', actions: ['view'] },
  { module: 'funds', actions: ['view'] },
  { module: 'compliance', actions: ['view', 'edit'] },
];

// 风控专员 - 风险控制
const riskPermissions: Permission[] = [
  { module: 'dashboard', actions: ['view'] },
  { module: 'accounts', actions: ['view'] },
  { module: 'trading', actions: ['view', 'approve'] },
  { module: 'funds', actions: ['view', 'approve'] },
  { module: 'risk', actions: ['view', 'edit', 'approve'] },
  { module: 'reports', actions: ['view', 'export'] },
];

// 财务 - 资金管理
const financePermissions: Permission[] = [
  { module: 'dashboard', actions: ['view'] },
  { module: 'accounts', actions: ['view'] },
  { module: 'funds', actions: ['view', 'approve', 'export'] },
  { module: 'reports', actions: ['view', 'export'] },
];

export const mockRoles: Role[] = [
  {
    id: 'super_admin',
    name: '超级管理员',
    description: '拥有系统全部权限，可进行所有操作',
    permissions: superAdminPermissions,
    userCount: 1,
    isSystem: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'operation_manager',
    name: '运营管理员',
    description: '负责日常运营管理，客户管理和营销活动',
    permissions: operationPermissions,
    userCount: 3,
    isSystem: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-15T10:30:00Z',
  },
  {
    id: 'support',
    name: '客服专员',
    description: '负责客户服务和KYC审核',
    permissions: supportPermissions,
    userCount: 8,
    isSystem: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-10T14:20:00Z',
  },
  {
    id: 'risk_officer',
    name: '风控专员',
    description: '负责风险控制和异常交易处理',
    permissions: riskPermissions,
    userCount: 2,
    isSystem: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-28T09:15:00Z',
  },
  {
    id: 'finance',
    name: '财务人员',
    description: '负责资金审核和财务报表',
    permissions: financePermissions,
    userCount: 2,
    isSystem: true,
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-01T16:45:00Z',
  },
];

// ============================================================
// Mock 管理员用户
// ============================================================

export const mockAdminUsers: AdminUser[] = [
  {
    id: 'admin-001',
    username: 'admin',
    email: 'admin@tradepass.com',
    phone: '+86 138****8888',
    realName: '系统管理员',
    role: mockRoles[0],
    lastLoginAt: '2024-04-03T08:30:00Z',
    lastLoginIp: '192.168.1.100',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-04-03T08:30:00Z',
  },
  {
    id: 'admin-002',
    username: 'operator1',
    email: 'operator1@tradepass.com',
    phone: '+86 139****1111',
    realName: '张运营',
    role: mockRoles[1],
    lastLoginAt: '2024-04-02T17:45:00Z',
    lastLoginIp: '192.168.1.101',
    status: 'active',
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-04-02T17:45:00Z',
  },
  {
    id: 'admin-003',
    username: 'support1',
    email: 'support1@tradepass.com',
    phone: '+86 137****2222',
    realName: '李客服',
    role: mockRoles[2],
    lastLoginAt: '2024-04-03T09:15:00Z',
    lastLoginIp: '192.168.1.102',
    status: 'active',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-04-03T09:15:00Z',
  },
  {
    id: 'admin-004',
    username: 'risk1',
    email: 'risk1@tradepass.com',
    phone: '+86 136****3333',
    realName: '王风控',
    role: mockRoles[3],
    lastLoginAt: '2024-04-01T14:20:00Z',
    lastLoginIp: '192.168.1.103',
    status: 'active',
    createdAt: '2024-02-15T11:30:00Z',
    updatedAt: '2024-04-01T14:20:00Z',
  },
  {
    id: 'admin-005',
    username: 'finance1',
    email: 'finance1@tradepass.com',
    phone: '+86 135****4444',
    realName: '赵财务',
    role: mockRoles[4],
    lastLoginAt: '2024-03-30T16:00:00Z',
    lastLoginIp: '192.168.1.104',
    status: 'inactive',
    createdAt: '2024-03-01T08:00:00Z',
    updatedAt: '2024-03-30T16:00:00Z',
  },
];

// ============================================================
// Mock API 函数
// ============================================================

let roles = [...mockRoles];
let admins = [...mockAdminUsers];

// 获取角色列表
export function getMockRoles(keyword?: string, status?: string): Role[] {
  let result = [...roles];
  
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    result = result.filter(
      r =>
        r.name.toLowerCase().includes(lowerKeyword) ||
        r.description?.toLowerCase().includes(lowerKeyword)
    );
  }
  
  if (status && status !== 'all') {
    result = result.filter(r => r.status === status);
  }
  
  return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

// 获取单个角色
export function getMockRoleById(id: string): Role | undefined {
  return roles.find(r => r.id === id);
}

// 创建角色
export function createMockRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Role {
  const newRole: Role = {
    ...role,
    id: `role-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  roles.push(newRole);
  return newRole;
}

// 更新角色
export function updateMockRole(id: string, updates: Partial<Role>): Role | undefined {
  const index = roles.findIndex(r => r.id === id);
  if (index === -1) return undefined;
  
  // 系统角色不能修改isSystem属性
  if (roles[index].isSystem && updates.isSystem !== undefined) {
    delete updates.isSystem;
  }
  
  roles[index] = {
    ...roles[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return roles[index];
}

// 删除角色
export function deleteMockRole(id: string): boolean {
  const role = roles.find(r => r.id === id);
  if (!role || role.isSystem) return false;
  if (role.userCount > 0) return false;
  
  roles = roles.filter(r => r.id !== id);
  return true;
}

// 获取管理员列表
export function getMockAdmins(keyword?: string, roleId?: string, status?: string): AdminUser[] {
  let result = [...admins];
  
  if (keyword) {
    const lowerKeyword = keyword.toLowerCase();
    result = result.filter(
      a =>
        a.username.toLowerCase().includes(lowerKeyword) ||
        a.email.toLowerCase().includes(lowerKeyword) ||
        a.realName?.toLowerCase().includes(lowerKeyword)
    );
  }
  
  if (roleId) {
    result = result.filter(a => a.role.id === roleId);
  }
  
  if (status && status !== 'all') {
    result = result.filter(a => a.status === status);
  }
  
  return result.sort((a, b) => new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime());
}

// 获取单个管理员
export function getMockAdminById(id: string): AdminUser | undefined {
  return admins.find(a => a.id === id);
}

// 创建管理员
export function createMockAdmin(admin: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'lastLoginIp'>): AdminUser {
  const newAdmin: AdminUser = {
    ...admin,
    id: `admin-${Date.now()}`,
    lastLoginAt: '',
    lastLoginIp: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  admins.push(newAdmin);
  
  // 更新角色用户计数
  const roleIndex = roles.findIndex(r => r.id === admin.role.id);
  if (roleIndex !== -1) {
    roles[roleIndex].userCount += 1;
  }
  
  return newAdmin;
}

// 更新管理员
export function updateMockAdmin(id: string, updates: Partial<AdminUser>): AdminUser | undefined {
  const index = admins.findIndex(a => a.id === id);
  if (index === -1) return undefined;
  
  const oldRoleId = admins[index].role.id;
  const newRoleId = updates.role?.id;
  
  admins[index] = {
    ...admins[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  // 更新角色用户计数
  if (newRoleId && oldRoleId !== newRoleId) {
    const oldRoleIndex = roles.findIndex(r => r.id === oldRoleId);
    const newRoleIndex = roles.findIndex(r => r.id === newRoleId);
    if (oldRoleIndex !== -1) roles[oldRoleIndex].userCount -= 1;
    if (newRoleIndex !== -1) roles[newRoleIndex].userCount += 1;
  }
  
  return admins[index];
}

// 删除管理员
export function deleteMockAdmin(id: string): boolean {
  const admin = admins.find(a => a.id === id);
  if (!admin) return false;
  
  // 不能删除超级管理员
  if (admin.role.id === 'super_admin') return false;
  
  admins = admins.filter(a => a.id !== id);
  
  // 更新角色用户计数
  const roleIndex = roles.findIndex(r => r.id === admin.role.id);
  if (roleIndex !== -1) {
    roles[roleIndex].userCount -= 1;
  }
  
  return true;
}

// 重置密码
export function resetMockAdminPassword(id: string, newPassword: string): boolean {
  const index = admins.findIndex(a => a.id === id);
  if (index === -1) return false;
  
  admins[index].updatedAt = new Date().toISOString();
  // 实际应用中这里会更新密码哈希
  return true;
}
