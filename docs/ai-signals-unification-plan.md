# Dashboard AI Signals 与 Feed 页面统一方案

## 一、现状分析

### Dashboard AI Signals (当前实现)
- 位置：`/portal/dashboard`
- 功能：展示3条推荐信号，快速交易入口
- 数据结构：`AISignal` interface
- 卡片设计：横向排列，胜率进度条，CTA按钮

### AI Signals Feed 页面 (现有)
- 位置：`/portal/ai-signals/feed`
- 功能：完整信号列表，收藏功能，筛选
- 数据结构：独立的 mockSignals 数组
- 卡片设计：圆形置信度环，Entry/SL/TP展示

### 问题
1. **数据结构不一致** - 两个地方定义了不同的信号格式
2. **组件不共享** - Dashboard 和 Feed 各自实现卡片
3. **样式不统一** - 视觉风格有差异
4. **逻辑重复** - 胜率计算、方向显示等逻辑分散

---

## 二、统一目标

1. **单一数据源** - 统一的信号类型定义和 mock 数据
2. **共享组件** - 提取可复用的信号卡片组件
3. **一致体验** - Dashboard 和 Feed 视觉风格统一
4. **功能打通** - Dashboard 点击信号可跳转到 Feed 详情

---

## 三、具体方案

### 3.1 统一数据层

创建共享类型和 mock 数据：

```
src/lib/ai-signals/
├── types.ts       # 统一类型定义
├── mock-data.ts   # 共享 mock 数据
└── utils.ts       # 共享工具函数（胜率颜色、收益计算等）
```

**统一后的 Signal 类型：**
```typescript
interface AISignal {
  id: string;
  symbol: string;
  direction: "buy" | "sell";
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;        // 胜率/置信度 0-100
  timeframe: string;         // H1, H4, D1 等
  timestamp: Date;
  status: "active" | "closed" | "expired";
  tags: string[];            // ["Trend", "Breakout", "AI-High"]
  rrr?: string;              // 风险收益比 "1:1.6"
}
```

### 3.2 共享组件层

提取可复用组件：

```
src/components/ai-signals/
├── SignalCard.tsx           # 基础信号卡片（可配置样式）
├── SignalConfidence.tsx     # 置信度/胜率显示（环形或进度条）
├── SignalDirection.tsx      # 方向标签（做多/做空）
├── SignalMeta.tsx           # 时间、时间周期等元信息
├── TradeButton.tsx          # 交易CTA按钮（状态驱动）
└── TradeModal.tsx           # 交易弹窗（已存在，需迁移）
```

**SignalCard 设计（支持两种模式）：**

```typescript
interface SignalCardProps {
  signal: AISignal;
  variant: "compact" | "detailed";  // compact=Dashboard, detailed=Feed
  showTradeButton?: boolean;
  showSaveButton?: boolean;
  onTrade?: (signal: AISignal) => void;
  onSave?: (signal: AISignal) => void;
  onClick?: (signal: AISignal) => void;
}
```

### 3.3 Dashboard 改造

**变更内容：**
1. 使用共享的 `SignalCard` 组件（variant="compact"）
2. 数据从共享 `mock-data.ts` 获取（取前3条 active）
3. 保留交易弹窗功能
4. 点击卡片跳转到 Feed 页面详情

**新的 Dashboard AISignals 结构：**
```
src/components/dashboard/AISignals/
├── index.tsx           # 简化，主要做数据获取和布局
└── README.md           # 说明：卡片组件已迁移到共享目录
```

### 3.4 Feed 页面改造

**变更内容：**
1. 使用共享的 `SignalCard` 组件（variant="detailed"）
2. 数据从共享 `mock-data.ts` 获取
3. 保留筛选、收藏功能
4. 点击卡片打开详情/交易弹窗

### 3.5 视觉统一规范

**颜色系统：**
| 元素 | 做多(Buy) | 做空(Sell) |
|------|-----------|------------|
| 主色 | emerald-500 | rose-500 |
| 背景 | emerald-50 | rose-50 |
| 边框 | emerald-200 | rose-200 |
| 文字 | emerald-700 | rose-700 |

**置信度/胜率颜色：**
| 范围 | 颜色 | 含义 |
|------|------|------|
| 85%+ | emerald | 高置信 |
| 70-84% | blue | 中等 |
| <70% | amber | 一般 |

**卡片样式：**
- Dashboard: 紧凑布局，横向排列，进度条胜率
- Feed: 详细布局，网格排列，环形置信度

### 3.6 交互流程统一

**Dashboard → Feed 流程：**
```
Dashboard 点击信号卡片
    ↓
跳转到 /portal/ai-signals/feed?highlight={signalId}
    ↓
Feed 页面高亮对应信号，自动滚动到位置
```

**交易流程（两处一致）：**
```
点击交易按钮
    ↓
检查用户状态（未认证/未入金/已就绪）
    ↓
未就绪 → 显示引导弹窗
已就绪 → 显示交易弹窗（预填参数）
    ↓
确认下单 → 成功提示
```

---

## 四、实施步骤

### Phase 1: 创建共享层
- [ ] 创建 `src/lib/ai-signals/types.ts` - 统一类型
- [ ] 创建 `src/lib/ai-signals/mock-data.ts` - 共享数据
- [ ] 创建 `src/lib/ai-signals/utils.ts` - 工具函数

### Phase 2: 创建共享组件
- [ ] 迁移 `TradeModal` 到共享目录
- [ ] 创建 `SignalConfidence` 组件（支持环形和进度条两种模式）
- [ ] 创建 `SignalDirection` 组件
- [ ] 创建 `SignalCard` 组件（支持 compact/detailed 两种变体）

### Phase 3: 改造 Dashboard
- [ ] 更新 `Dashboard/AISignals/index.tsx` 使用共享组件
- [ ] 更新 `Dashboard/AISignals/SignalCard.tsx` 使用共享卡片
- [ ] 添加跳转到 Feed 的功能

### Phase 4: 改造 Feed 页面
- [ ] 更新 `ai-signals/feed/page.tsx` 使用共享组件
- [ ] 统一卡片样式
- [ ] 添加高亮指定信号的功能（URL参数）

### Phase 5: 清理和测试
- [ ] 删除重复代码
- [ ] 统一导入路径
- [ ] 构建测试
- [ ] 功能验证

---

## 五、文件变更清单

### 新增文件
```
src/lib/ai-signals/
├── types.ts
├── mock-data.ts
└── utils.ts

src/components/ai-signals/
├── SignalCard.tsx
├── SignalConfidence.tsx
├── SignalDirection.tsx
├── SignalMeta.tsx
└── TradeModal.tsx
```

### 修改文件
```
src/components/dashboard/AISignals/index.tsx
src/components/dashboard/AISignals/SignalCard.tsx
src/app/portal/ai-signals/feed/page.tsx
src/components/dashboard/index.ts
```

### 删除文件
```
src/components/dashboard/AISignals/TradeModal.tsx  (迁移到共享目录)
```

---

## 六、数据结构对比与映射

### Dashboard 当前格式
```typescript
{
  id: "1",
  symbol: "XAU/USD",
  direction: "buy",
  entryPrice: 2030,
  targetPrice: 2050,
  stopLoss: 2020,
  winRate: 85,
  timestamp: Date,
  tags: ["hot", "high-winrate"],
  timeframe: "H1",
  confidence: "high"
}
```

### Feed 当前格式
```typescript
{
  id: 1,
  symbol: "XAUUSD",
  direction: "BUY",
  entry: 2334.5,
  sl: 2318.0,
  tp: 2360.0,
  confidence: 87,
  timeframe: "H4",
  time: "2h ago",
  rrr: "1:1.6",
  status: "active",
  tags: ["Trend", "Breakout"]
}
```

### 统一后格式
```typescript
{
  id: "1",
  symbol: "XAU/USD",        // 统一带斜杠格式
  direction: "buy",         // 统一小写
  entryPrice: 2334.5,       // 统一命名
  stopLoss: 2318.0,
  takeProfit: 2360.0,
  confidence: 87,           // 统一用数字
  timeframe: "H4",
  timestamp: Date,          // 统一用 Date
  status: "active",
  tags: ["trend", "breakout"], // 统一小写
  rrr: "1:1.6"
}
```

---

## 七、预期效果

1. **代码复用** - 信号相关逻辑只写一次
2. **维护简单** - 修改信号展示只需改一处
3. **体验一致** - 用户在 Dashboard 和 Feed 看到统一的信号信息
4. **功能打通** - 从 Dashboard 可以无缝跳转到 Feed 查看详情

---

## 八、风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 数据格式变更影响现有功能 | 中 | 保持兼容层，逐步迁移 |
| 视觉风格改变用户不适应 | 低 | 保持核心交互不变 |
| 开发时间较长 | 低 | 分 Phase 实施，每阶段可独立交付 |

---

确认方案后，可以开始实施。
