# Dashboard V3.0 PRD - 转化导向设计

> **核心目标**: 不是展示数据，而是推动用户完成 **入金 + 交易**

---

## 一、页面结构（按转化优先级排序）

```
--------------------------------------------------
[ 1. Onboarding Funnel ⭐ 核心 ]  
   用户引导: KYC → 开户 → 入金
--------------------------------------------------
[ 2. 账户概览 + 快捷操作 ]
   Total Balance | Deposit CTA
   Quick Actions: [Deposit] [Trade] [Transfer] [Open Account]
--------------------------------------------------
[ 3. 我的交易账户 ]
   Account Cards (多账户展示)
--------------------------------------------------
[ 4. 热门活动 Promotions ⭐ ]
   入金活动 / 交易奖励
--------------------------------------------------
[ 5. 市场机会 / AI Signals ⭐ ]
   促交易模块
--------------------------------------------------
[ 6. 交易工具下载 ]
   MT5 / WebTrader / App
--------------------------------------------------
[ 7. 公告通知 ]
   系统公告 / 活动通知
--------------------------------------------------
[ 8. 监管 & 安全背书 ]
   FCA / ASIC / 资金隔离
--------------------------------------------------
```

---

## 二、模块详细定义

### 1️⃣ Onboarding Funnel（用户引导）⭐最重要

**功能定义**
引导用户完成关键转化路径：
```
注册 → KYC → 开户 → 首次入金
```

**展示形式**
步骤进度卡片（Step Progress）：
```
[✔ 注册完成]  [→ 身份认证]  [→ 创建交易账户]  [→ 首次存款]
```

**状态规则**
| 状态 | 展示行为 |
|------|----------|
| 未完成任一步骤 | 显示模块（默认展开） |
| 全部完成 | 默认隐藏（可配置强制展示） |
| 有运营配置 | 可强制展示特定步骤 |

**每步动作**
| 步骤 | CTA | 跳转 |
|------|-----|------|
| KYC | Verify Now | /portal/settings/verification |
| 开户 | Open Account | /portal/trading/open-account |
| 入金 | Deposit Now | /portal/wallet/deposit |

**后台控制配置**
```typescript
interface OnboardingConfig {
  forceShow: boolean;           // 是否强制展示
  steps: OnboardingStep[];      // 步骤配置
  insertPromoTasks: boolean;    // 是否插入活动任务
}
```

---

### 2️⃣ 账户概览（Account Overview）

**资产层**
- Total Balance（总资产）
- Available Balance（可用余额）
- Floating PnL（浮动盈亏）

**账户层（多账户卡片）**
```
┌─────────────────────────────┐
│ Account #12345          [Live]  │
│ Balance: $5,230                 │
│ Equity: $5,450                  │
│ Free Margin: $3,200             │
│ Leverage: 1:500                 │
│                                 │
│ [Deposit] [Withdraw] [Trade]    │
└─────────────────────────────┘
```

**设计原则**
- 卡片直接操作，减少页面跳转
- 每个账户独立展示操作入口

---

### 3️⃣ 快捷操作（Quick Actions）

**强转化入口（必须明显）**
```
[ Deposit ]  [ Open Account ]  [ Transfer ]  [ Trade Now ]
```

**设计建议**
- 固定在资产下方或顶部
- 始终可见
- Deposit 按钮至少出现 3 次

---

### 4️⃣ 热门活动（Promotions）

**卡片信息**
```
┌─────────────────────────────┐
│ 🎁 存款送彩金 50%               │
│ 奖励: $100 Bonus               │
│ 状态: 可参与                    │
│ [立即参与]                      │
│ ⏰ 倒计时: 02:12:33            │
└─────────────────────────────┘
```

**后台控制**
- 活动排序
- 地区可见
- 用户分层（未入金用户优先展示入金活动）

---

### 5️⃣ 市场机会（Market Opportunities）

**内容融合**
- AI Signals
- 热门品种
- 趋势推荐

**展示内容**
```
┌─────────────────────────────┐
│ 🤖 EURUSD - BUY               │
│ Confidence: 82%               │
│ Entry: 1.0820                 │
│ TP: 1.0900  |  SL: 1.0780     │
│                               │
│ [查看信号]  [立即交易]         │
└─────────────────────────────┘
```

**定位**: 促交易模块

---

### 6️⃣ 交易工具下载（Tools）

**内容**
- MT5 (iOS / Android / PC / Mac)
- WebTrader（无需下载）
- TradePass App

**行为**
- 自动识别设备（移动端 → 引导 App）
- Download / Open Web

---

### 7️⃣ 公告（Announcements）

**类型**
- 系统公告
- 交易时间变更
- 活动公告

**展示**
- 标题 + 时间 + 重要标识（置顶）

**可扩展**
- 弹窗（重大公告）

---

### 8️⃣ 监管 / 安全（Trust）

**内容**
- 监管牌照（FCA / ASIC / SVG）
- 奖项（Best Forex Broker 2025）
- 安全说明（资金隔离账户）

**展示形式**
- Logo + 简短说明
- 底部展示，不占主要空间

---

## 三、用户状态与视角

### 用户阶段定义

```typescript
type UserStage = 
  | "registered"      // 刚注册，未KYC
  | "kyc_pending"     // KYC提交中
  | "kyc_done"        // KYC完成，未开户
  | "account_opened"  // 已开户，未入金
  | "first_deposit"   // 首次入金，未交易
  | "active_trader"   // 活跃交易者
  | "vip";            // VIP用户
```

### 各阶段 Dashboard 展示

| 用户阶段 | Onboarding 显示 | 主要 CTA | 模块优先级 |
|----------|-----------------|----------|------------|
| registered | KYC 步骤 | Verify Now | Onboarding > Promotions |
| kyc_pending | 等待审核 | 查看状态 | 公告 > Promotions |
| kyc_done | 开户步骤 | Open Account | Onboarding > Tools |
| account_opened | 入金步骤 | Deposit Now | Onboarding > Promotions > Signals |
| first_deposit | 交易步骤 | Trade Now | Signals > Promotions > Tools |
| active_trader | 隐藏 | Trade Now | Signals > Accounts > Promotions |
| vip | 隐藏 | Deposit/Trade | Signals > Accounts > VIP Offers |

---

## 四、设计原则

### 1️⃣ 引导模块必须在最上面
👉 否则用户不会完成 KYC / 入金

### 2️⃣ Deposit 按钮必须出现 ≥ 3 次
👉 首页至少：
- Onboarding 模块
- Quick Actions
- Account 卡片

### 3️⃣ 信息密度控制
👉 不要一上来全塞：
- 默认展示核心
- 次要内容折叠

### 4️⃣ 所有模块支持后台配置
👉 包括：
- 是否展示
- 排序
- 用户分层

---

## 五、技术实现要点

### 用户视角切换器（开发调试）

```typescript
// 用于开发和演示的用户状态切换
interface UserPerspective {
  id: string;
  name: string;
  stage: UserStage;
  accounts: TradingAccount[];
  balance: BalanceInfo;
  kycStatus: "pending" | "verified" | "rejected";
}

// 预设视角
const PERSPECTIVES: UserPerspective[] = [
  { id: "new", name: "新注册用户", stage: "registered", ... },
  { id: "kyc", name: "KYC审核中", stage: "kyc_pending", ... },
  { id: "no-account", name: "未开户", stage: "kyc_done", ... },
  { id: "no-deposit", name: "未入金", stage: "account_opened", ... },
  { id: "first-trade", name: "首单用户", stage: "first_deposit", ... },
  { id: "active", name: "活跃用户", stage: "active_trader", ... },
  { id: "vip", name: "VIP用户", stage: "vip", ... },
];
```

### 模块显示控制

```typescript
interface DashboardConfig {
  // 模块显示控制
  modules: {
    onboarding: boolean;
    accountOverview: boolean;
    quickActions: boolean;
    accounts: boolean;
    promotions: boolean;
    marketOpportunities: boolean;
    tools: boolean;
    announcements: boolean;
    trust: boolean;
  };
  
  // 排序（数字越小越靠前）
  moduleOrder: Record<string, number>;
  
  // 用户分层配置
  userSegmentation: {
    showDepositPromoTo: UserStage[];
    showSignalsTo: UserStage[];
  };
}
```

---

## 六、交付清单

- [ ] OnboardingFunnel 组件（步骤进度 + CTA）
- [ ] AccountOverview 组件（总资产 + 快捷操作）
- [ ] TradingAccounts 组件（多账户卡片）
- [ ] Promotions 组件（活动卡片）
- [ ] MarketOpportunities 组件（AI信号）
- [ ] ToolsDownload 组件（交易工具）
- [ ] Announcements 组件（公告列表）
- [ ] TrustSection 组件（监管背书）
- [ ] UserPerspectiveSwitcher（开发调试工具）
- [ ] Dashboard 页面重构（按新结构排序）
- [ ] 用户状态驱动逻辑

---

## 七、一句话总结

> **这个 Dashboard = "引导用户赚钱的操作系统"**
> 
> 不是页面，是一个 **转化引擎**
