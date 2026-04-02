// Backoffice User Types
export type UserStatus = 'active' | 'frozen' | 'pending' | 'closed';
export type KYCStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';
export type UserLevel = 'standard' | 'vip' | 'premium' | 'enterprise';

export interface BackofficeUser {
  id: string;
  uid: string;
  name: string;
  username?: string; // 兼容旧字段
  email: string;
  phone: string;
  country?: string;
  avatar?: string;
  status: UserStatus;
  kycStatus: KYCStatus;
  level: UserLevel;
  balance: number;
  equity: number;
  createdAt: string;
  lastLoginAt: string;
  tags: string[];
  ibId?: string;
  notes?: string;
}

export interface UserListParams {
  page: number;
  pageSize: number;
  status?: UserStatus;
  kycStatus?: KYCStatus;
  level?: UserLevel;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface UserListResponse {
  data: BackofficeUser[];
  total: number;
  page: number;
  pageSize: number;
}
