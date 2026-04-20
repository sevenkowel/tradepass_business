/**
 * Dashboard V2.0 测试用户数据
 * 
 * 使用方式：
 * import { testUsers, getTestUser } from '@/lib/test-users';
 * const user = getTestUser('new'); // 获取新注册用户
 */

export interface Account {
  id: string;
  type: 'Real' | 'Demo';
  balance: number;
  equity?: number;
  server?: string;
  leverage?: string;
  currency?: string;
}

export interface OnboardingStatus {
  hasAccount: boolean;
  isKycVerified: boolean;
  hasDeposited: boolean;
  hasTraded: boolean;
}

export interface TestUser {
  userId: string;
  name: string;
  email: string;
  vipLevel: number;
  avatar?: string;
  onboardingStatus: OnboardingStatus;
  accounts: Account[];
  wallet: {
    total: number;
    equity?: number;
    available: number;
    frozen?: number;
  };
  positions?: number;
  floatingPnL?: number;
  aiSignalQuota: {
    dailyLimit: number;
    used: number;
  };
}

// 测试用户 1：新注册用户（未开户）
export const newUser: TestUser = {
  userId: "test-user-001",
  name: "Alex Chen",
  email: "alex.chen@example.com",
  vipLevel: 0,
  avatar: "AC",
  onboardingStatus: {
    hasAccount: false,
    isKycVerified: false,
    hasDeposited: false,
    hasTraded: false,
  },
  accounts: [],
  wallet: { 
    total: 0, 
    available: 0,
    frozen: 0,
  },
  positions: 0,
  floatingPnL: 0,
  aiSignalQuota: {
    dailyLimit: 3,
    used: 0,
  },
};

// 测试用户 2：已开户未认证
export const unverifiedUser: TestUser = {
  userId: "test-user-002",
  name: "Bob Wang",
  email: "bob.wang@example.com",
  vipLevel: 0,
  avatar: "BW",
  onboardingStatus: {
    hasAccount: true,
    isKycVerified: false,
    hasDeposited: false,
    hasTraded: false,
  },
  accounts: [
    { 
      id: "MT5-123456", 
      type: "Real", 
      balance: 0,
      equity: 0,
      server: "TradePass-Live",
      leverage: "1:100",
      currency: "USD",
    }
  ],
  wallet: { 
    total: 0, 
    available: 0,
    frozen: 0,
  },
  positions: 0,
  floatingPnL: 0,
  aiSignalQuota: {
    dailyLimit: 3,
    used: 1,
  },
};

// 测试用户 3：已认证未入金
export const noDepositUser: TestUser = {
  userId: "test-user-003",
  name: "Carol Liu",
  email: "carol.liu@example.com",
  vipLevel: 1,
  avatar: "CL",
  onboardingStatus: {
    hasAccount: true,
    isKycVerified: true,
    hasDeposited: false,
    hasTraded: false,
  },
  accounts: [
    { 
      id: "MT5-234567", 
      type: "Real", 
      balance: 0,
      equity: 0,
      server: "TradePass-Live",
      leverage: "1:100",
      currency: "USD",
    },
    { 
      id: "MT5-999888", 
      type: "Demo", 
      balance: 10000,
      equity: 10000,
      server: "TradePass-Demo",
      leverage: "1:500",
      currency: "USD",
    }
  ],
  wallet: { 
    total: 0, 
    available: 0,
    frozen: 0,
  },
  positions: 0,
  floatingPnL: 0,
  aiSignalQuota: {
    dailyLimit: 10,
    used: 3,
  },
};

// 测试用户 4：已入金活跃用户
export const activeUser: TestUser = {
  userId: "test-user-004",
  name: "David Zhang",
  email: "david.zhang@example.com",
  vipLevel: 3,
  avatar: "DZ",
  onboardingStatus: {
    hasAccount: true,
    isKycVerified: true,
    hasDeposited: true,
    hasTraded: true,
  },
  accounts: [
    { 
      id: "MT5-345678", 
      type: "Real", 
      balance: 5230,
      equity: 5450,
      server: "TradePass-Live",
      leverage: "1:200",
      currency: "USD",
    },
    { 
      id: "MT5-999777", 
      type: "Demo", 
      balance: 10000,
      equity: 10200,
      server: "TradePass-Demo",
      leverage: "1:500",
      currency: "USD",
    }
  ],
  wallet: { 
    total: 12530, 
    equity: 12850,
    available: 8200,
    frozen: 4330,
  },
  positions: 3,
  floatingPnL: 320,
  aiSignalQuota: {
    dailyLimit: 50,
    used: 12,
  },
};

// 测试用户 5：VIP 高净值用户
export const vipUser: TestUser = {
  userId: "test-user-005",
  name: "Emma Thompson",
  email: "emma.thompson@example.com",
  vipLevel: 5,
  avatar: "ET",
  onboardingStatus: {
    hasAccount: true,
    isKycVerified: true,
    hasDeposited: true,
    hasTraded: true,
  },
  accounts: [
    { 
      id: "MT5-888999", 
      type: "Real", 
      balance: 125000,
      equity: 128500,
      server: "TradePass-Live",
      leverage: "1:500",
      currency: "USD",
    },
    { 
      id: "MT5-888998", 
      type: "Real", 
      balance: 50000,
      equity: 51200,
      server: "TradePass-Live",
      leverage: "1:200",
      currency: "USD",
    },
    { 
      id: "MT5-999666", 
      type: "Demo", 
      balance: 100000,
      equity: 100000,
      server: "TradePass-Demo",
      leverage: "1:500",
      currency: "USD",
    }
  ],
  wallet: { 
    total: 228500, 
    equity: 234200,
    available: 180000,
    frozen: 48500,
  },
  positions: 12,
  floatingPnL: 5700,
  aiSignalQuota: {
    dailyLimit: 100,
    used: 45,
  },
};

// 所有测试用户
export const testUsers = {
  new: newUser,
  unverified: unverifiedUser,
  noDeposit: noDepositUser,
  active: activeUser,
  vip: vipUser,
};

// 获取测试用户
export function getTestUser(type: keyof typeof testUsers): TestUser {
  return testUsers[type];
}

// 获取当前 CTA 状态
export function getCurrentCTA(user: TestUser): {
  text: string;
  href: string;
  priority: 'account' | 'kyc' | 'deposit' | 'trade' | 'default';
} {
  const { onboardingStatus } = user;
  
  if (!onboardingStatus.hasAccount) {
    return { 
      text: "立即开户", 
      href: "/portal/trading/open-account",
      priority: "account"
    };
  }
  
  if (!onboardingStatus.isKycVerified) {
    return { 
      text: "完成认证", 
      href: "/portal/kyc",
      priority: "kyc"
    };
  }
  
  if (!onboardingStatus.hasDeposited) {
    return { 
      text: "去入金", 
      href: "/portal/fund/deposit",
      priority: "deposit"
    };
  }
  
  if (!onboardingStatus.hasTraded) {
    return { 
      text: "开始交易", 
      href: "/portal/trading/accounts",
      priority: "trade"
    };
  }
  
  return { 
    text: "去入金", 
    href: "/portal/fund/deposit",
    priority: "default"
  };
}

// 获取 Onboarding 步骤状态
// 流程：注册 → 身份认证 → 创建账户 → 入金 → 交易
export function getOnboardingSteps(user: TestUser) {
  const { onboardingStatus } = user;
  
  return [
    { 
      id: 'register', 
      title: '注册', 
      status: 'completed', // 用户已登录，注册默认完成
      actionText: '', 
      href: '' 
    },
    { 
      id: 'kyc', 
      title: '身份认证', 
      status: onboardingStatus.isKycVerified ? 'completed' : 'current',
      actionText: '立即认证', 
      href: '/portal/kyc' 
    },
    { 
      id: 'account', 
      title: '创建账户', 
      status: onboardingStatus.isKycVerified 
        ? (onboardingStatus.hasAccount ? 'completed' : 'current')
        : 'pending',
      actionText: '创建账户', 
      href: '/portal/trading/open-account' 
    },
    { 
      id: 'deposit', 
      title: '首次入金', 
      status: onboardingStatus.hasAccount 
        ? (onboardingStatus.hasDeposited ? 'completed' : 'current')
        : 'pending',
      actionText: '去入金', 
      href: '/portal/fund/deposit' 
    },
    { 
      id: 'trade', 
      title: '开始交易', 
      status: onboardingStatus.hasDeposited 
        ? (onboardingStatus.hasTraded ? 'completed' : 'current')
        : 'pending',
      actionText: '去交易', 
      href: '/portal/trading/accounts' 
    },
  ];
}

// 获取 AI 信号配额
export function getAISignalQuota(user: TestUser) {
  return {
    dailyLimit: user.aiSignalQuota.dailyLimit,
    used: user.aiSignalQuota.used,
    remaining: user.aiSignalQuota.dailyLimit - user.aiSignalQuota.used,
  };
}

// 获取用户阶段
export type UserStage = 'new' | 'unverified' | 'no_deposit' | 'active' | 'vip';

export function getUserStage(user: TestUser): UserStage {
  if (user.vipLevel >= 5) return 'vip';
  if (user.onboardingStatus.hasTraded) return 'active';
  if (user.onboardingStatus.hasDeposited) return 'active';
  if (user.onboardingStatus.isKycVerified) return 'no_deposit';
  if (user.onboardingStatus.hasAccount) return 'unverified';
  return 'new';
}

// 获取模块显示配置
export function getDashboardConfig(user: TestUser) {
  const stage = getUserStage(user);
  
  switch (stage) {
    case 'new':
    case 'unverified':
      return {
        showPromotions: true,
        showSignals: true,
        showOnboarding: true,
        ctaPriority: 'account' as const,
        emphasis: 'onboarding',
      };
    case 'no_deposit':
      return {
        showPromotions: true,
        showSignals: true,
        showOnboarding: true,
        ctaPriority: 'deposit' as const,
        emphasis: 'promotions',
      };
    case 'active':
    case 'vip':
      return {
        showPromotions: true,
        showSignals: true,
        showOnboarding: false,
        ctaPriority: 'trade' as const,
        emphasis: 'signals',
      };
    default:
      return {
        showPromotions: true,
        showSignals: true,
        showOnboarding: true,
        ctaPriority: 'default' as const,
        emphasis: 'onboarding',
      };
  }
}
