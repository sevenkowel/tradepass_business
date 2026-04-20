import { create } from "zustand";

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

  activeMenu: "dashboard",
  setActiveMenu: (menu) => set({ activeMenu: menu }),
}));
