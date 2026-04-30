/**
 * Mock 数据类型定义
 * 纯前端 Demo 模式，数据存储在 LocalStorage
 */

export interface MockTenant {
  id: string;
  name: string;
  subdomain: string;
  logo?: string;
  primaryColor?: string;
  createdAt: string;
  status: 'active' | 'suspended' | 'trial';
  ownerId: string;
  subscription?: {
    plan: 'starter' | 'professional' | 'enterprise';
    expiresAt: string;
  };
}

export interface MockUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'platform_admin' | 'tenant_owner' | 'tenant_admin' | 'user';
  tenantId?: string;
  createdAt: string;
  lastLoginAt?: string;
  kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
  kycLevel?: 'basic' | 'standard' | 'enhanced';
}

export interface MockKYCRecord {
  id: string;
  userId: string;
  tenantId: string;
  status: 'not_started' | 'document_uploaded' | 'ocr_processing' | 'ocr_completed' | 
          'liveness_pending' | 'liveness_completed' | 'personal_info_pending' | 
          'personal_info_completed' | 'agreement_pending' | 'submitted' | 
          'under_review' | 'approved' | 'rejected';
  level: 'basic' | 'standard' | 'enhanced';
  documents: {
    type: string;
    url: string;
    uploadedAt: string;
  }[];
  ocrData?: Record<string, string>;
  personalInfo?: Record<string, string>;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  region: string;
}

export interface MockDeposit {
  id: string;
  userId: string;
  tenantId: string;
  amount: number;
  currency: string;
  method: 'bank_transfer' | 'credit_card' | 'crypto' | 'ewallet';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: string;
  completedAt?: string;
}

export interface MockWithdrawal {
  id: string;
  userId: string;
  tenantId: string;
  amount: number;
  currency: string;
  method: 'bank_transfer' | 'crypto';
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: string;
  completedAt?: string;
}

export interface MockTradingAccount {
  id: string;
  userId: string;
  tenantId: string;
  accountNumber: string;
  balance: number;
  currency: string;
  leverage: number;
  status: 'active' | 'suspended' | 'closed';
  createdAt: string;
}

export interface MockNotification {
  id: string;
  userId: string;
  type: 'kyc' | 'deposit' | 'withdrawal' | 'system' | 'marketing';
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface MockDatabase {
  tenants: MockTenant[];
  users: MockUser[];
  kycRecords: MockKYCRecord[];
  deposits: MockDeposit[];
  withdrawals: MockWithdrawal[];
  tradingAccounts: MockTradingAccount[];
  notifications: MockNotification[];
  currentUserId?: string;
  sessions: Record<string, { userId: string; expiresAt: string }>;
}

export type MockEntity = 
  | MockTenant 
  | MockUser 
  | MockKYCRecord 
  | MockDeposit 
  | MockWithdrawal 
  | MockTradingAccount 
  | MockNotification;
