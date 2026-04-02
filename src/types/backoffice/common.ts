// Backoffice Common Types

// Pagination
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

// Status types
export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default' | 'pending';

// KYC Review
export interface KYCApplication {
  id: string;
  userId: string;
  username: string;
  phone: string;
  idCardType: 'id_card' | 'passport' | 'drivers_license';
  idCardNumber: string;
  idCardFront: string;
  idCardBack: string;
  addressProof?: string;
  additionalDocs?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'supplement_required';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  userId: string;
  operator: string;
  action: string;
  module: string;
  targetType: string;
  targetId: string;
  details: Record<string, unknown>;
  ip: string;
  userAgent: string;
  createdAt: string;
}

// Role & Permission
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'admin' | '*';

export interface Permission {
  module: string;
  actions: PermissionAction[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  userCount: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  lastLoginAt: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

// Notification
export interface Notification {
  id: string;
  type: 'kyc' | 'risk' | 'system' | 'deposit' | 'withdrawal';
  title: string;
  message: string;
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  deposits: { value: number; change: number };
  withdrawals: { value: number; change: number };
  netDeposit: { value: number; change: number };
  newUsers: { value: number; change: number };
  activeTraders: { value: number; change: number };
  pendingReviews: { value: number; change: number };
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}
