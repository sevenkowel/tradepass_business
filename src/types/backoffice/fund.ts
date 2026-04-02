// Backoffice Fund Types
export type DepositStatus = 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
export type WithdrawalStatus = 'pending' | '初审通过' | '复审通过' | 'executing' | 'success' | 'failed' | 'cancelled' | 'suspended';
export type TransactionType = 'deposit' | 'withdrawal' | 'adjustment' | 'commission' | 'rebate' | 'transfer';

export interface DepositOrder {
  id: string;
  orderId: string;
  userId: string;
  username: string;
  amount: number;
  currency: string;
  channel: string;
  actualAmount: number;
  fee: number;
  status: DepositStatus;
  txHash?: string;
  createdAt: string;
  processedAt?: string;
  notes?: string;
}

export interface WithdrawalRequest {
  id: string;
  orderId: string;
  userId: string;
  username: string;
  amount: number;
  currency: string;
  channel: string;
  bankInfo?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  };
  cryptoInfo?: {
    network: string;
    address: string;
  };
  fee: number;
  actualAmount: number;
  status: WithdrawalStatus;
  riskFlag?: boolean;
  flagReason?: string;
 初审By?: string;
  初审At?: string;
  复审By?: string;
  复审At?: string;
  createdAt: string;
  processedAt?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  transactionId: string;
  userId: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
  operator?: string;
}

export interface PaymentChannel {
  id: string;
  name: string;
  type: 'bank' | 'crypto' | 'third_party';
  status: 'active' | 'inactive' | 'maintenance';
  fee: number;
  feeType: 'fixed' | 'percentage' | 'both';
  minAmount: number;
  maxAmount: number;
  description?: string;
  createdAt: string;
}
