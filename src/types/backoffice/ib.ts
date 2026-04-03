// Backoffice IB/Referral Types
export type IBStatus = 'active' | 'inactive' | 'suspended';
export type IBLevel = 'ib' | 'sub_ib' | 'manager';

export interface IBPartner {
  id: string;
  ibId: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  level: IBLevel;
  parentId?: string;
  parentName?: string;
  status: IBStatus;
  totalClients: number;
  activeClients: number;
  totalDeposit: number;
  totalWithdrawal: number;
  totalVolume: number;
  pendingCommission: number;
  totalCommission: number;
  referralCode: string;
  createdAt: string;
  lastActiveAt?: string;
}

export interface IBClient {
  id: string;
  clientId: string;
  ibId: string;
  ibName: string;
  name: string;
  email: string;
  totalDeposit: number;
  totalVolume: number;
  registeredAt: string;
  lastTradeAt?: string;
}

export interface CommissionRecord {
  id: string;
  commissionId: string;
  ibId: string;
  ibName: string;
  clientId: string;
  clientName: string;
  accountId: string;
  volume: number;
  commissionRate: number;
  commissionAmount: number;
  currency: string;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  createdAt: string;
  paidAt?: string;
}

export interface CommissionSetting {
  id: string;
  name: string;
  level: IBLevel;
  minVolume: number;
  maxVolume: number;
  commissionType: 'per_lot' | 'percentage';
  commissionValue: number;
  isActive: boolean;
}

export interface ReferralTreeNode {
  id: string;
  ibId: string;
  name: string;
  level: IBLevel;
  totalClients: number;
  totalCommission: number;
  children: ReferralTreeNode[];
}
