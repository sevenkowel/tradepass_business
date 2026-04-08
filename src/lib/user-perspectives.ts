/**
 * Dashboard V3.0 - 用户视角系统
 * 
 * 用于开发和演示：切换不同用户阶段查看 Dashboard 展示差异
 */

import { UserStage, TradingAccount, BalanceInfo, KYCStatus, UserPerspective, AccountOpeningStatus } from "@/types/user";

// 预设交易账户数据
const mockAccounts: Record<string, TradingAccount[]> = {
  none: [],
  single: [
    {
      id: "ACC-12345",
      type: "live",
      balance: 5230,
      equity: 5450,
      freeMargin: 3200,
      leverage: 500,
      currency: "USD",
    },
  ],
  multiple: [
    {
      id: "ACC-12345",
      type: "live",
      balance: 15230,
      equity: 15450,
      freeMargin: 8200,
      leverage: 500,
      currency: "USD",
    },
    {
      id: "ACC-67890",
      type: "live",
      balance: 12850,
      equity: 13120,
      freeMargin: 6200,
      leverage: 200,
      currency: "EUR",
    },
    {
      id: "ACC-54321",
      type: "live",
      balance: 1850000,
      equity: 1820000,
      freeMargin: 1200000,
      leverage: 100,
      currency: "JPY",
    },
  ],
};

// 预设余额数据
const mockBalances: Record<string, BalanceInfo> = {
  zero: {
    total: 0,
    available: 0,
    floatingPnL: 0,
    currency: "USD",
  },
  small: {
    total: 5230,
    available: 3200,
    floatingPnL: 220,
    currency: "USD",
  },
  medium: {
    total: 23730,
    available: 12400,
    floatingPnL: 450,
    currency: "USD",
  },
  large: {
    total: 125300,
    available: 82000,
    floatingPnL: 3200,
    currency: "USD",
  },
};

// 预设用户视角
export const USER_PERSPECTIVES: UserPerspective[] = [
  {
    id: "new",
    name: "新注册用户",
    stage: "registered",
    accounts: mockAccounts.none,
    balance: mockBalances.zero,
    kycStatus: "pending",
    accountOpeningStatus: "none",
    hasDeposit: false,
    hasTraded: false,
    vipLevel: 0,
  },
  {
    id: "kyc-pending",
    name: "KYC审核中",
    stage: "kyc_pending",
    accounts: mockAccounts.none,
    balance: mockBalances.zero,
    kycStatus: "pending",
    accountOpeningStatus: "none",
    hasDeposit: false,
    hasTraded: false,
    vipLevel: 0,
  },
  {
    id: "kyc-done",
    name: "KYC完成，未开户",
    stage: "kyc_done",
    accounts: mockAccounts.none,
    balance: mockBalances.zero,
    kycStatus: "verified",
    accountOpeningStatus: "none",
    hasDeposit: false,
    hasTraded: false,
    vipLevel: 0,
  },
  {
    id: "account-opening-failed",
    name: "开户中断",
    stage: "account_opening_failed",
    accounts: mockAccounts.none,
    balance: mockBalances.zero,
    kycStatus: "verified",
    accountOpeningStatus: "failed",
    hasDeposit: false,
    hasTraded: false,
    vipLevel: 0,
  },
  {
    id: "account-rejected",
    name: "开户被拒绝",
    stage: "account_rejected",
    accounts: mockAccounts.none,
    balance: mockBalances.zero,
    kycStatus: "verified",
    accountOpeningStatus: "rejected",
    hasDeposit: false,
    hasTraded: false,
    vipLevel: 0,
    rejectionReason: "地址证明文件不清晰，请重新上传",
  },
  {
    id: "no-deposit",
    name: "已开户，未入金",
    stage: "account_opened",
    accounts: mockAccounts.single,
    balance: mockBalances.zero,
    kycStatus: "verified",
    accountOpeningStatus: "created",
    hasDeposit: false,
    hasTraded: false,
    vipLevel: 0,
  },
  {
    id: "first-deposit",
    name: "首次入金，未交易",
    stage: "first_deposit",
    accounts: mockAccounts.single,
    balance: mockBalances.small,
    kycStatus: "verified",
    accountOpeningStatus: "created",
    hasDeposit: true,
    hasTraded: false,
    vipLevel: 1,
  },
  {
    id: "active",
    name: "活跃用户",
    stage: "active_trader",
    accounts: mockAccounts.multiple,
    balance: mockBalances.medium,
    kycStatus: "verified",
    accountOpeningStatus: "created",
    hasDeposit: true,
    hasTraded: true,
    vipLevel: 2,
  },
  {
    id: "vip",
    name: "VIP用户",
    stage: "vip",
    accounts: mockAccounts.multiple,
    balance: mockBalances.large,
    kycStatus: "verified",
    accountOpeningStatus: "created",
    hasDeposit: true,
    hasTraded: true,
    vipLevel: 5,
  },
];

// 获取用户视角
export function getUserPerspective(id: string): UserPerspective {
  return USER_PERSPECTIVES.find((p) => p.id === id) || USER_PERSPECTIVES[0];
}

// 获取 Onboarding 步骤状态
export function getOnboardingSteps(perspective: UserPerspective) {
  // 判断当前处于哪个步骤
  const getCurrentStepId = () => {
    if (perspective.kycStatus !== "verified") return "kyc";
    if (perspective.accountOpeningStatus === "failed") return "account_failed";
    if (perspective.accountOpeningStatus === "rejected") return "account_rejected";
    if (perspective.accounts.length === 0) return "account";
    if (!perspective.hasDeposit) return "deposit";
    if (!perspective.hasTraded) return "trade";
    return null; // 全部完成
  };

  const currentStepId = getCurrentStepId();

  return [
    {
      id: "register",
      label: "注册",
      completed: true,
      current: false,
      action: null,
    },
    {
      id: "kyc",
      label: "身份认证",
      completed: perspective.kycStatus === "verified",
      current: currentStepId === "kyc",
      action: perspective.kycStatus !== "verified" ? "/portal/kyc" : null,
      cta: perspective.kycStatus === "pending" ? "View Status" : "Verify Now",
    },
    {
      id: "account",
      label: "创建账户",
      completed: perspective.accounts.length > 0 && 
                perspective.accountOpeningStatus !== "failed" && 
                perspective.accountOpeningStatus !== "rejected",
      current: currentStepId === "account" || currentStepId === "account_failed" || currentStepId === "account_rejected",
      action: perspective.accounts.length === 0 ? "/portal/trading/open-account" : null,
      cta: "Open Account",
      // 特殊状态信息
      status: perspective.accountOpeningStatus === "failed" ? "interrupted" :
              perspective.accountOpeningStatus === "rejected" ? "rejected" : null,
    },
    {
      id: "deposit",
      label: "入金",
      completed: perspective.hasDeposit,
      current: currentStepId === "deposit",
      action: !perspective.hasDeposit ? "/portal/wallet/deposit" : null,
      cta: "Deposit Now",
    },
    {
      id: "trade",
      label: "交易",
      completed: perspective.hasTraded,
      current: currentStepId === "trade",
      action: perspective.hasDeposit && !perspective.hasTraded ? "/portal/trading" : null,
      cta: "Trade Now",
    },
  ];
}

// 获取当前主要 CTA
export function getPrimaryCTA(perspective: UserPerspective) {
  // 根据用户阶段返回对应的CTA
  const stage = perspective.stage;

  // 新注册用户 - 引导KYC
  if (stage === "registered") {
    return {
      text: "Verify Now",
      href: "/portal/kyc",
      variant: "primary" as const,
    };
  }

  // KYC审核中 - 查看状态
  if (stage === "kyc_pending") {
    return {
      text: "View Status",
      href: "/portal/kyc",
      variant: "secondary" as const,
    };
  }

  // KYC完成未开户 - 开户
  if (stage === "kyc_done") {
    return {
      text: "Open Account",
      href: "/portal/trading/open-account",
      variant: "primary" as const,
    };
  }

  // 开户中断 - 继续开户
  if (stage === "account_opening_failed") {
    return {
      text: "Continue Opening",
      href: "/portal/trading/open-account?resume=true",
      variant: "primary" as const,
      secondaryAction: {
        text: "Restart",
        href: "/portal/trading/open-account",
      },
    };
  }

  // 开户被拒绝 - 重新提交
  if (stage === "account_rejected") {
    return {
      text: "Resubmit Application",
      href: "/portal/trading/open-account?resubmit=true",
      variant: "primary" as const,
    };
  }

  // 已开户未入金 - 入金
  if (stage === "account_opened") {
    return {
      text: "Deposit Now",
      href: "/portal/wallet/deposit",
      variant: "primary" as const,
    };
  }

  // 首次入金未交易 - 交易
  if (stage === "first_deposit") {
    return {
      text: "Trade Now",
      href: "/portal/trading",
      variant: "primary" as const,
    };
  }

  // 活跃用户/VIP - 继续交易
  return {
    text: "Trade Now",
    href: "/portal/trading",
    variant: "primary" as const,
  };
}

// 获取 Dashboard 模块配置（基于用户阶段）
export function getDashboardConfig(perspective: UserPerspective) {
  const configs: Record<UserStage, DashboardConfig> = {
    registered: {
      showOnboarding: true,
      showQuickActions: false,
      showAccounts: false,
      showPromotions: true,
      showMarketOpportunities: false,
      modulePriority: ["onboarding", "promotions", "tools", "trust"],
    },
    kyc_pending: {
      showOnboarding: true,
      showQuickActions: false,
      showAccounts: false,
      showPromotions: true,
      showMarketOpportunities: false,
      modulePriority: ["onboarding", "announcements", "promotions", "trust"],
    },
    kyc_done: {
      showOnboarding: true,
      showQuickActions: false,
      showAccounts: false,
      showPromotions: false,
      showMarketOpportunities: false,
      modulePriority: ["onboarding", "tools", "trust"],
    },
    account_opening_failed: {
      showOnboarding: true,
      showQuickActions: false,
      showAccounts: false,
      showPromotions: false,
      showMarketOpportunities: false,
      modulePriority: ["onboarding", "trust"],
    },
    account_rejected: {
      showOnboarding: true,
      showQuickActions: false,
      showAccounts: false,
      showPromotions: false,
      showMarketOpportunities: false,
      modulePriority: ["onboarding", "trust"],
    },
    account_opened: {
      showOnboarding: true,
      showQuickActions: true,
      showAccounts: true,
      showPromotions: true,
      showMarketOpportunities: true,
      modulePriority: ["onboarding", "accounts", "promotions", "market", "tools"],
    },
    first_deposit: {
      showOnboarding: true,
      showQuickActions: true,
      showAccounts: true,
      showPromotions: true,
      showMarketOpportunities: true,
      modulePriority: ["market", "accounts", "onboarding", "promotions", "tools"],
    },
    active_trader: {
      showOnboarding: false,
      showQuickActions: true,
      showAccounts: true,
      showPromotions: true,
      showMarketOpportunities: true,
      modulePriority: ["market", "accounts", "promotions", "tools", "announcements"],
    },
    vip: {
      showOnboarding: false,
      showQuickActions: true,
      showAccounts: true,
      showPromotions: true,
      showMarketOpportunities: true,
      modulePriority: ["market", "accounts", "promotions", "tools", "trust"],
    },
  };

  return configs[perspective.stage];
}

// 类型定义补充
interface DashboardConfig {
  showOnboarding: boolean;
  showQuickActions: boolean;
  showAccounts: boolean;
  showPromotions: boolean;
  showMarketOpportunities: boolean;
  modulePriority: string[];
}

// 当前使用的视角（开发时可切换）
export const CURRENT_PERSPECTIVE_ID = "no-deposit";

// 获取当前视角
export function getCurrentPerspective(): UserPerspective {
  return getUserPerspective(CURRENT_PERSPECTIVE_ID);
}
