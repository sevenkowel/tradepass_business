import { create } from "zustand";
import type { TradingAccount } from "@/lib/types";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  kycStatus: "unverified" | "pending" | "verified";
  kycLevel: "basic" | "standard" | "enhanced";
  region: "VN" | "TH" | "IN" | "AE" | "KR" | "JP" | "FR" | "ES" | "BR";
  level: "standard" | "vip" | "platinum";
  addressProof?: boolean;
}

interface WalletBalance {
  total: number;
  equity: number;
  available: number;
  frozen: number;
  currency: string;
}

interface PortalState {
  // Sidebar
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  toggleSidebar: () => void;
  setMobileSidebarOpen: (open: boolean) => void;

  // User
  user: User | null;
  setUser: (user: User) => void;

  // Wallet
  wallet: WalletBalance;
  setWallet: (wallet: WalletBalance) => void;

  // Trading Accounts
  tradingAccounts: TradingAccount[];
  setTradingAccounts: (accounts: TradingAccount[]) => void;

  // Active nav
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
}

export const usePortalStore = create<PortalState>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),

  // Mock user
  user: {
    id: "u_001",
    name: "Alex Chen",
    email: "alex@tradepass.io",
    kycStatus: "verified",
    kycLevel: "standard" as const,
    region: "VN" as const,
    level: "vip",
    addressProof: true,
  },
  setUser: (user) => set({ user }),

  // Mock wallet
  wallet: {
    total: 52840.5,
    equity: 54120.3,
    available: 48200.0,
    frozen: 4640.5,
    currency: "USD",
  },
  setWallet: (wallet) => set({ wallet }),

  // Mock trading accounts (multi-currency, multi-type)
  tradingAccounts: [
    {
      id: "ta_001",
      userId: "u_001",
      accountNumber: "MT5-899999",
      type: "Real",
      server: "TradePass-Pro",
      leverage: 500,
      balance: 1500000,
      equity: 1500000,
      margin: 0,
      freeMargin: 1500000,
      marginLevel: 0,
      currency: "JPY",
      profit: 0,
      isActive: true,
      createdAt: "2026-01-15T00:00:00Z",
    },
    {
      id: "ta_002",
      userId: "u_001",
      accountNumber: "MT5-888888",
      type: "Real",
      server: "TradePass-Standard",
      leverage: 200,
      balance: 52840.5,
      equity: 54120.3,
      margin: 1279.8,
      freeMargin: 52840.5,
      marginLevel: 4232,
      currency: "USD",
      profit: 1279.8,
      isActive: true,
      createdAt: "2026-02-20T00:00:00Z",
      lastTradeAt: "2026-04-18T14:30:00Z",
    },
    {
      id: "ta_003",
      userId: "u_001",
      accountNumber: "MT5-877777",
      type: "Real",
      server: "TradePass-ECN",
      leverage: 100,
      balance: 0,
      equity: 0,
      margin: 0,
      freeMargin: 0,
      marginLevel: 0,
      currency: "EUR",
      profit: 0,
      isActive: true,
      createdAt: "2026-04-10T00:00:00Z",
    },
    {
      id: "ta_004",
      userId: "u_001",
      accountNumber: "MT5-866666",
      type: "Demo",
      server: "TradePass-Demo",
      leverage: 500,
      balance: 100000,
      equity: 100000,
      margin: 0,
      freeMargin: 100000,
      marginLevel: 0,
      currency: "USC",
      profit: 0,
      isActive: true,
      createdAt: "2026-03-01T00:00:00Z",
    },
  ],
  setTradingAccounts: (accounts) => set({ tradingAccounts: accounts }),

  activeMenu: "dashboard",
  setActiveMenu: (menu) => set({ activeMenu: menu }),
}));
