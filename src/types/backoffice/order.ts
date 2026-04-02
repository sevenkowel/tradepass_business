// Backoffice Order Types
export type OrderType = 'buy' | 'sell';
export type OrderStatus = 'open' | 'pending' | 'closed' | 'cancelled';
export type PositionStatus = 'open' | 'closed' | 'partial';

export interface Order {
  id: string;
  orderId: string;
  accountId: string;
  symbol: string;
  type: OrderType;
  volume: number;
  openPrice: number;
  currentPrice: number;
  closePrice?: number;
  profit: number;
  status: OrderStatus;
  createdAt: string;
  closedAt?: string;
  tp?: number;
  sl?: number;
}

export interface Position {
  id: string;
  ticket: string;
  accountId: string;
  symbol: string;
  type: OrderType;
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  margin: number;
  status: PositionStatus;
  openTime: string;
  tp?: number;
  sl?: number;
}

export interface Instrument {
  id: string;
  symbol: string;
  name: string;
  category: string;
  spread: number;
  spreadType: 'fixed' | 'variable';
  minVolume: number;
  maxVolume: number;
  tradingHours: string;
  marginRequirement: number;
  swapLong: number;
  swapShort: number;
  isActive: boolean;
}
