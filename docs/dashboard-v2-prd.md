# Dashboard V2.0 产品需求文档 (PRD)

## 一、项目概述

### 目标
重构 Portal Dashboard 页面，从"信息展示页"升级为"引导用户赚钱的操作系统"，通过动态 CTA、任务引导、市场机会展示，提升用户转化率和活跃度。

### 核心指标
- 新用户完成首单转化率
- 功能入口点击率
- 页面停留时长

---

## 二、整体布局（页面骨架）

```
--------------------------------------------------------
Top Nav（Logo / 用户信息 / 通知 / 语言）
--------------------------------------------------------

[ 1. 用户状态 + 主CTA ]           ← Hero区，最突出

--------------------------------------------------------

[ 2. 关键任务引导（Onboarding Steps）]  ← 转化核心

--------------------------------------------------------

[ 3. 市场机会（AI信号 + 热门资讯）]     ← 价值展示

--------------------------------------------------------

[ 4. 活动 & 激励 Banner ]              ← 运营位

--------------------------------------------------------

[ 5. 快捷功能入口 ]                     ← 高频操作

--------------------------------------------------------

[ 6. 下载区（MT5 / App / WebTrader）]   ← 交易入口

--------------------------------------------------------

[ 7. 资产概览 ]                         ← 账户信息

--------------------------------------------------------

[ 8. 公司背书（底部）]                  ← 信任建立

--------------------------------------------------------
Footer
--------------------------------------------------------
```

---

## 三、模块详细设计

### 🟢 1️⃣ 用户状态 + 主CTA（Hero区）

**功能描述：**
页面最顶部的 Hero 区域，展示用户欢迎语、资产总览和动态主 CTA 按钮。

**UI 元素：**
- 左侧：👤 Welcome, [User Name] + VIP 等级标签
- 中部：账户总资产、可用保证金
- 右侧：主 CTA 按钮（唯一主按钮，颜色最突出）
- 底部：Real Account / Demo Account 快速切换标签

**CTA 动态逻辑：**
```typescript
if (未开户) → 显示"立即开户"
else if (未KYC) → 显示"完成认证"
else if (未入金) → 显示"去入金"
else if (未交易) → 显示"开始交易"
else → 显示"去入金"（默认）
```

**数据结构：**
```typescript
interface UserHeroData {
  name: string;
  vipLevel: number;
  totalAssets: number;
  availableMargin: number;
  realAccount: {
    balance: number;
    accountId: string;
  };
  demoAccount: {
    balance: number;
    accountId: string;
  };
  onboardingStatus: {
    hasAccount: boolean;
    isKycVerified: boolean;
    hasDeposited: boolean;
    hasTraded: boolean;
  };
}
```

---

### 🟡 2️⃣ 关键任务引导（Onboarding Steps）

**功能描述：**
横向 4 步任务流程，引导新用户完成核心转化路径。

**UI 元素：**
- 标题：🚀 开始你的交易之旅
- 4 个步骤卡片：
  1. [✓] 开立账户（已完成）
  2. [→] 完成认证 [去认证]
  3. [ ] 首次入金 [去入金]
  4. [ ] 开始交易 [去交易]
- 底部提示：（预计：2分钟完成）

**状态样式：**
- 已完成：绿色勾选图标 ✓
- 当前步骤：蓝色高亮边框 + 箭头 →
- 未开始：灰色空心圆圈

**数据结构：**
```typescript
interface OnboardingStep {
  id: string;
  title: string;
  status: 'completed' | 'current' | 'pending';
  actionText: string;
  href: string;
}

const steps: OnboardingStep[] = [
  { id: 'account', title: '开立账户', status: 'completed', actionText: '', href: '' },
  { id: 'kyc', title: '完成认证', status: 'current', actionText: '去认证', href: '/portal/settings/verification' },
  { id: 'deposit', title: '首次入金', status: 'pending', actionText: '去入金', href: '/portal/wallet/deposit' },
  { id: 'trade', title: '开始交易', status: 'pending', actionText: '去交易', href: '/portal/trading/accounts' },
];
```

---

### 🟣 3️⃣ 市场机会（AI信号 + 热门资讯）

**功能描述：**
Tab 切换展示 AI 交易信号和热门市场资讯，每条信号必须有 CTA。

**UI 元素：**
- Tab 切换：[AI信号] [热门资讯]
- AI信号卡片：
  - 方向标签（BUY/SELL）
  - 货币对名称
  - Entry / TP / SL 价格
  - 置信度百分比
  - 操作按钮：[一键交易] [查看详情]
- 热门资讯卡片：
  - 影响等级标签（High/Medium/Low）
  - 标题
  - [查看交易机会] 按钮

**AI信号权限控制：**
```typescript
if (未KYC) → 每日 3 次
else if (已KYC但未入金) → 每日 10 次
else (已入金) → 每日 50 次
```

**数据结构：**
```typescript
interface AISignal {
  id: string;
  symbol: string;
  direction: 'BUY' | 'SELL';
  entry: number;
  tp: number;
  sl: number;
  confidence: number;
  timeframe: string;
  createdAt: string;
}

interface MarketNews {
  id: string;
  title: string;
  impact: 'high' | 'medium' | 'low';
  summary: string;
  createdAt: string;
}
```

---

### 🟠 4️⃣ 活动 & 激励 Banner

**功能描述：**
横向滑动的活动 Banner 区域，展示当前进行中的促销和活动。

**UI 元素：**
- 标题：🎁 活动专区
- Banner 卡片（支持横向滑动）：
  - 活动标题
  - 倒计时（如适用）
  - CTA 按钮
- 指示器：小圆点指示当前 Banner

**示例 Banner：**
1. 存款送彩金 50%（倒计时 02:12:33）→ 立即参与
2. 邀请好友赚佣金 → 立即邀请

**数据结构：**
```typescript
interface PromotionBanner {
  id: string;
  title: string;
  subtitle?: string;
  countdown?: number; // 秒数
  bgGradient: string;
  ctaText: string;
  href: string;
}
```

---

### 🔵 5️⃣ 快捷功能入口

**功能描述：**
6 宫格快捷操作入口，覆盖最高频的功能。

**UI 元素：**
- 标题：⚡ 快速操作
- 6 个图标按钮（2行3列）：
  - 入金、出金、划转
  - 交易、跟单、记录

**数据结构：**
```typescript
interface QuickAction {
  id: string;
  icon: string;
  label: string;
  href: string;
  color: string;
}
```

---

### 🟤 6️⃣ 下载区（关键）

**功能描述：**
强化交易入口，引导用户下载 MT5 或使用 WebTrader。

**UI 元素：**
- 标题：📱 开始交易
- 左侧：MT5 下载（iOS / Android / PC / Mac 平台图标）
- 中部：WebTrader（无需下载）[立即交易]
- 右侧：扫码下载 App（二维码占位）

**设备识别逻辑：**
```typescript
// 自动识别用户设备，高亮对应下载按钮
const platform = detectPlatform(); // 'ios' | 'android' | 'windows' | 'mac'
```

---

### ⚪ 7️⃣ 资产概览（轻量）

**功能描述：**
简洁的账户资产概览，不占用过多空间。

**UI 元素：**
- 标题：📊 账户概览
- 关键数据：总资产、浮动盈亏、持仓数量
- [查看详情] 链接

---

### ⚫ 8️⃣ 公司背书（底部）

**功能描述：**
建立信任感，展示监管信息和奖项。

**UI 元素：**
- 三列布局：
  - 🏛 受监管机构：FCA / ASIC / SVG
  - 🏆 奖项：Best Forex Broker 2025
  - 🔐 资金安全：Segregated Accounts

---

## 四、模块显示控制逻辑

根据用户状态，动态调整模块展示优先级：

```typescript
interface DashboardConfig {
  // 未入金用户：强化活动 + 信号
  preDeposit: {
    showPromotions: true;
    showSignals: true;
    ctaPriority: 'deposit';
  };
  // 已入金用户：强化交易 + 信号
  postDeposit: {
    showTrading: true;
    showSignals: true;
    ctaPriority: 'trade';
  };
  // 活跃用户：强化AI信号
  activeUser: {
    showSignals: true;
    showAdvancedTools: true;
    ctaPriority: 'signals';
  };
}
```

---

## 五、组件拆分

```
src/components/dashboard/
├── UserHeroCard.tsx          # 用户状态 + 主CTA
├── OnboardingSteps.tsx       # 关键任务引导
├── MarketInsights.tsx        # 市场机会（信号+资讯）
├── PromotionBanner.tsx       # 活动 & 激励
├── QuickActionsGrid.tsx      # 快捷功能入口
├── DownloadSection.tsx       # 下载区
├── AccountSummary.tsx        # 资产概览
└── TrustSection.tsx          # 公司背书
```

---

## 六、响应式适配

### 移动端优先顺序（纵向堆叠）：
1. CTA（Hero区）
2. 关键任务
3. AI信号
4. 活动
5. 快捷入口
6. 下载
7. 资产
8. 背书

### 断点规则：
- Mobile: < 640px（单列堆叠）
- Tablet: 640px - 1024px（两列布局）
- Desktop: > 1024px（完整布局）

---

## 七、测试用户规范

### 测试用户 1：新注册用户（未开户）
```json
{
  "userId": "test-user-001",
  "name": "Alex Chen",
  "vipLevel": 0,
  "onboardingStatus": {
    "hasAccount": false,
    "isKycVerified": false,
    "hasDeposited": false,
    "hasTraded": false
  },
  "accounts": [],
  "wallet": { "total": 0, "available": 0 }
}
```
**预期表现：**
- CTA 显示"立即开户"
- Onboarding 第 1 步为 current
- 强调开户引导

---

### 测试用户 2：已开户未认证
```json
{
  "userId": "test-user-002",
  "name": "Bob Wang",
  "vipLevel": 0,
  "onboardingStatus": {
    "hasAccount": true,
    "isKycVerified": false,
    "hasDeposited": false,
    "hasTraded": false
  },
  "accounts": [
    { "id": "MT5-123456", "type": "Real", "balance": 0 }
  ],
  "wallet": { "total": 0, "available": 0 }
}
```
**预期表现：**
- CTA 显示"完成认证"
- Onboarding 第 2 步为 current
- AI 信号每日限制 3 次

---

### 测试用户 3：已认证未入金
```json
{
  "userId": "test-user-003",
  "name": "Carol Liu",
  "vipLevel": 1,
  "onboardingStatus": {
    "hasAccount": true,
    "isKycVerified": true,
    "hasDeposited": false,
    "hasTraded": false
  },
  "accounts": [
    { "id": "MT5-234567", "type": "Real", "balance": 0 },
    { "id": "MT5-999888", "type": "Demo", "balance": 10000 }
  ],
  "wallet": { "total": 0, "available": 0 }
}
```
**预期表现：**
- CTA 显示"去入金"
- Onboarding 第 3 步为 current
- AI 信号每日限制 10 次
- 显示 Demo 账户余额

---

### 测试用户 4：已入金活跃用户
```json
{
  "userId": "test-user-004",
  "name": "David Zhang",
  "vipLevel": 3,
  "onboardingStatus": {
    "hasAccount": true,
    "isKycVerified": true,
    "hasDeposited": true,
    "hasTraded": true
  },
  "accounts": [
    { "id": "MT5-345678", "type": "Real", "balance": 5230 },
    { "id": "MT5-999777", "type": "Demo", "balance": 10000 }
  ],
  "wallet": { "total": 12530, "equity": 12850, "available": 8200 },
  "positions": 3,
  "floatingPnL": 320
}
```
**预期表现：**
- CTA 显示"开始交易"或"去入金"
- Onboarding 全部完成 ✓
- AI 信号每日限制 50 次
- 显示完整资产概览
- 强调 AI 信号和交易功能

---

## 八、API 接口规范

### 获取 Dashboard 数据
```http
GET /api/dashboard
Response: {
  user: UserHeroData;
  onboarding: OnboardingStep[];
  signals: AISignal[];
  news: MarketNews[];
  promotions: PromotionBanner[];
  quickActions: QuickAction[];
  accountSummary: AccountSummaryData;
}
```

### 获取 AI 信号使用配额
```http
GET /api/ai-signals/quota
Response: {
  dailyLimit: number;
  used: number;
  remaining: number;
  resetsAt: string;
}
```

---

## 九、交付清单

- [ ] 8 个独立组件实现
- [ ] Dashboard 页面重构
- [ ] CTA 动态逻辑
- [ ] 模块显示控制
- [ ] 移动端适配
- [ ] 4 个测试用户数据
- [ ] 零 lint 错误

---

## 十、成功标准

1. **功能完整**：所有 8 个模块正常显示和交互
2. **逻辑正确**：CTA 根据用户状态动态变化
3. **响应式**：移动端和桌面端都有良好体验
4. **性能**：首屏加载 < 1.5s
5. **无障碍**：支持键盘导航和屏幕阅读器
