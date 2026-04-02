// Backoffice Account Types
export type AccountStatus = 'active' | 'frozen' | 'closed' | 'deleted';
export type AccountType = 'mt4' | 'mt5';

export interface MTAccount {
  id: string;
  accountId: string;
  userId: string;
  username: string;
  type: AccountType;
  status: AccountStatus;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  leverage: number;
  currency: string;
  createdAt: string;
  lastTradeAt?: string;
  group?: string;
}

export interface AccountGroup {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  accountCount: number;
  createdAt: string;
}

export interface LeverageSetting {
  id: string;
  name: string;
  minBalance: number;
  maxBalance: number;
  leverage: number;
  description?: string;
}
