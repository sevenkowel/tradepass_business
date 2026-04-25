# TradePass 前端架构审计报告

> 审计日期：2026-04-25
> 审计范围：`src/components/` (145 文件)、`src/app/` (166 page.tsx)、`src/lib/` (52 文件)、`src/store/` (11 文件)、`src/hooks/`、`src/types/` (17 文件)、`src/middleware.ts`
> 审计人：frontend-audit

---

## 一、执行摘要

项目整体功能覆盖完整（营销站 + Portal + Backoffice + Console + Admin），但前端代码存在**严重的架构债务**：

- **两套并行的 UI 组件体系**（Backoffice 自建 vs Portal/UI shadcn）导致样式不统一、维护成本高
- **50+ 页面文件直接硬编码 Mock 数据**，生产化程度低
- **大量页面组件超过 500 行**，内联子组件、内联类型、内联数据混在一起
- **`as any` 和 `as never` 类型逃逸**广泛存在
- **113+ 处 `console.log/debugger`** 残留于生产代码
- **6+ 个完全重复的 "Coming Soon" 占位页面**未组件化

---

## 二、问题清单（按严重程度分级）

### P0 — 阻塞性/高风险

| # | 问题 | 影响 | 涉及文件数 |
|---|------|------|-----------|
| P0-1 | **两套 UI 组件体系并存** — Backoffice 在 `components/backoffice/ui/` 自建了 Button、Card、PageHeader、EmptyState，与 `components/ui/` 的 shadcn/ui 组件功能重叠但样式/ API 不一致 | 样式分裂、维护双倍成本、主题切换困难 | 10+ |
| P0-2 | **50+ 页面文件硬编码 Mock 数据** — `mockOrders`、`mockUsers`、`MOCK_CAMPAIGNS` 等直接写在 page.tsx 中，未通过 API 层或环境开关隔离 | 无法直接投产，Mock 与真实逻辑混排，数据层污染 | 50+ |
| P0-3 | **超大型页面组件** — `backoffice/system/kyc-config/page.tsx` (57.6KB)、`portal/fund/deposit/page.tsx` (54.9KB)、`portal/settings/page.tsx` (18.6KB) 等将类型、数据、子组件、业务逻辑全部内联 | 不可测试、不可复用、代码 review 困难、编译慢 | 15+ |
| P0-4 | **`backoffice/ui/index.ts` 错误聚合导出** — 从 `PageHeader.tsx` 中一并导出 `Button`、`Card`、`EmptyState`，模块职责严重混乱 | 误导开发者、破坏单一职责、循环依赖隐患 | 1 |
| P0-5 | **占位页面代码完全重复** — 6+ 个 `page.tsx`（如 `portal/ai-signals/generate`、`portal/ib/tools`、`portal/support/tickets` 等，均约 779B）代码逐字相同 | 任何变更需改 N 处，违反 DRY | 6+ |
| P0-6 | **`"use client"` 泛滥** — 166 个 page.tsx 中至少 93+ 个（约 56%）标记为 Client Component，大量纯展示页面无需此标记 | 破坏 SSR、首屏性能、SEO | 93+ |
| P0-7 | **StatusBadge 配置字典硬编码中文** — `statusConfig` 中包含 `"初审通过"`、`"复审通过"` 等中文 key | 国际化阻断、类型不可推导、维护困难 | 1 |

### P1 — 重要/中等风险

| # | 问题 | 影响 | 涉及文件数 |
|---|------|------|-----------|
| P1-1 | **`as any` 类型逃逸** — 28 处，涵盖状态映射、表单字段、API 参数等 | 丧失 TS 类型保护，运行时错误难以提前发现 | 28 |
| P1-2 | **`as never` 类型欺骗** — `roleStore.ts` 中对权限 action 使用 `as never` 强制通过编译 | 完全绕过类型检查，权限系统存在隐患 | 2 |
| P1-3 | **113+ 处 `console.log/warn/error/debugger`** 残留 | 污染浏览器控制台、可能泄露敏感信息、调试代码进生产 | 113+ |
| P1-4 | **两套 DataTable 实现** — `EnhancedDataTable` (backoffice, 438 行) 与 `DataTable` (portal, 240 行) 核心逻辑（搜索、排序、分页、骨架屏）高度重复 | 功能重复、样式不一致、bug 修复需改两处 | 2 |
| P1-5 | **Store 中混编 Mock 数据与业务逻辑** — `portalStore.ts`、`authStore.ts` 等直接在初始状态里写死 Mock 用户/账户/钱包数据 | 真实环境切换困难、状态污染 | 11 |
| P1-6 | **Hardcoded 颜色与主题 Token 混用** — 大量 `bg-gray-50`、`text-gray-900`、`border-gray-200` 等 Tailwind 硬编码色值，与 CSS 变量 `--tp-surface`、`--tp-fg` 并存 | 暗色模式/主题切换不彻底、视觉不一致 | 133+ 文件 |
| P1-7 | **KYC DevPanel 使用 `as any`** — `KYCDevPanel.tsx` 第 365 行将对象强制 `as any` 后 setState | 状态类型不可推导 | 1 |
| P1-8 | **Portal Settings 页面内联 6+ 子组件** — `ProfileSection`、`SecuritySection`、`VerificationSection` 等全部内联在同一个 page.tsx 中 | 不可复用、不可测试、文件体积过大 | 1 |

### P2 — 低优先级/优化建议

| # | 问题 | 影响 | 涉及文件数 |
|---|------|------|-----------|
| P2-1 | `PlaceholderPage` 组件存在但**未被任何页面实际使用** | 死代码 | 1 |
| P2-2 | `hooks/` 目录严重匮乏 — 仅 `useUser.ts` (816B) 一个 hook | 大量重复逻辑未抽象 | 1 |
| P2-3 | `types/` 与 `lib/types.ts` 并存 — 类型定义分散在两个地方 | 查找类型困难、重复定义隐患 | 2 |
| P2-4 | `lib/backoffice/` 中 7 个 `mock-*.ts` 文件与 `lib/kyc/mock-service.ts` 等 Mock 层分散 | Mock 数据未统一治理 | 8 |
| P2-5 | **form 组件重复** — Portal 有 `FormInput`、`FormSelect`、`AmountInput`，Backoffice 直接在页面内写原生 `<input>` | 表单体验不一致 | 3+ |
| P2-6 | `lib/utils.ts` 仅含 50 行，但 `cn`、`formatCurrency`、`formatNumber`、`formatPercent`、`shortenAddress` 等基础函数未按领域拆分 | 随着项目增长会变臃肿 | 1 |
| P2-7 | `lib/api/` 与 `lib/kyc/` 等目录组织不一致 — 部分按领域分、部分按技术分层 | 目录结构认知负担 | N/A |
| P2-8 | `middleware.ts` 中 `PUBLIC_PATHS` 未覆盖 `/auth/forgot-password` 等可能存在的公共路径 | 路由守卫不完整 | 1 |

---

## 三、代码异味列表（精确位置）

### 3.1 `as any` 逃逸（完整清单）

| 文件 | 行号 | 代码片段 | 建议 |
|------|------|----------|------|
| `src/components/dev-tools/KYCDevPanel.tsx` | 365 | `} as any);` | 定义准确的 Partial 类型 |
| `src/components/backoffice/risk/RiskAlertDrawer.tsx` | 57 | `type={(levelColors[alert.level] \|\| "default") as any}` | 扩展 Badge type 定义或使用满足类型 |
| `src/components/backoffice/ib/IBDrawer.tsx` | 53 | `type={(levelColors[ib.level] \|\| "default") as any}` | 同上 |
| `src/components/kyc/forms/DeclarationsForm.tsx` | 110 | `value as any` (setValue) | 使用 react-hook-form 的 Path 泛型 |
| `src/components/kyc/forms/InvestmentExperienceForm.tsx` | 65, 86, 127 | 3 处 `value as any` | 声明枚举类型 |
| `src/components/kyc/forms/FinancialStatusForm.tsx` | 58, 79 | 2 处 `value as any` | 声明枚举类型 |
| `src/components/kyc/forms/EducationForm.tsx` | 32 | `value as any` | 声明枚举类型 |
| `src/components/kyc/OCRResultEditor.tsx` | 104, 106 | `value as any` | 使用 OCRResult 的 key 泛型约束 |
| `src/app/api/backoffice/kyc/supplemental/route.ts` | 116 | `regionCode as any` | 使用 RegionCode 联合类型 |
| `src/app/backoffice/risk/page.tsx` | 130 | `type={levelColors[row.level] as any}` | 扩展 StatusBadge 的 type props |
| `src/app/backoffice/trading/orders/page.tsx` | 129 | `type={statusColors[row.status] as any}` | 同上 |
| `src/app/backoffice/ib/page.tsx` | 79, 142 | 2 处 `as any` | 同上 |
| `src/app/backoffice/system/security/logs/page.tsx` | 57 | `type: selectedType as any` | 使用满足类型的值 |
| `src/app/backoffice/system/kyc-config/page.tsx` | 714, 743 | 2 处 `as any` | 声明 Provider 枚举 |
| `src/app/backoffice/ai-signals/pool/page.tsx` | 98 | `type={... "warning" as any}` | 扩展 StatusBadge type |
| `src/app/backoffice/ai-signals/page.tsx` | 103 | `type={statusColors[...] as any}` | 同上 |
| `src/app/backoffice/ai-signals/usage/page.tsx` | 54 | `type={planColors[...] as any}` | 同上 |
| `src/app/backoffice/accounts/page.tsx` | 121 | `type={statusColors[...] as any}` | 同上 |
| `src/app/backoffice/copy-trading/traders/page.tsx` | 95 | `type={riskColors[...] as any}` | 同上 |
| `src/app/backoffice/copy-trading/profits/page.tsx` | 92 | `type={statusColors[...] as any}` | 同上 |
| `src/app/backoffice/copy-trading/settings/page.tsx` | 72 | `e.target.value as any` | 声明 followMode 类型 |
| `src/app/portal/support/page.tsx` | 84 | `id as any` | 声明 tab ID 联合类型 |

### 3.2 `as never` 类型欺骗

| 文件 | 行号 | 代码片段 |
|------|------|----------|
| `src/store/backoffice/roleStore.ts` | 95 | `modulePermission.actions.includes('*' as never)` |
| `src/store/backoffice/roleStore.ts` | 96 | `modulePermission.actions.includes(action as never)` |

### 3.3 重复占位页面（代码完全一致）

以下 6+ 个文件内容几乎完全相同（~17 行），均使用内联 `motion.div` + emoji + 相同文案：

- `src/app/portal/ai-signals/generate/page.tsx`
- `src/app/portal/ai-signals/my-signals/page.tsx`
- `src/app/portal/ib/tools/page.tsx`
- `src/app/portal/support/tickets/page.tsx`
- `src/app/portal/support/help/page.tsx`
- `src/app/portal/support/status/page.tsx`

**共同代码模式：**
```tsx
"use client";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/portal/widgets/PageHeader";
export default function Page() {
  return (
    <div>
      <PageHeader title="Coming Soon" description="This module is under development." />
      <motion.div ...>
        <span className="text-2xl">🚧</span>
        <p ...>This page is being built.</p>
      </motion.div>
    </div>
  );
}
```

### 3.4 超大型页面文件（>500 行 或 >10KB）

| 文件 | 大小 | 主要问题 |
|------|------|----------|
| `backoffice/system/kyc-config/page.tsx` | 57.6 KB | 内联大量配置表单、类型、状态逻辑 |
| `portal/fund/deposit/page.tsx` | 54.9 KB | 内联支付方式、账户数据、计算逻辑、子组件 |
| `backoffice/compliance/kyc-review/page.tsx` | 33.8 KB | 审核工作流逻辑全内联 |
| `backoffice/compliance/supplemental-review/page.tsx` | 32.6 KB | 补充审核逻辑全内联 |
| `console/onboarding/page.tsx` | 22.5 KB | 多步骤 onboarding 未拆分为独立 step 组件 |
| `backoffice/ui-showcase/page.tsx` | 20.9 KB | 组件展示页，可接受但建议文档化 |
| `portal/fund/transfer/page.tsx` | 15.1 KB | 转账逻辑内联 |
| `portal/trading/open-account/page.tsx` | 19.6 KB | 开户流程未拆分 |
| `portal/settings/page.tsx` | 18.6 KB | 6+ 内联 Section 子组件 |
| `backoffice/crm/tickets/page.tsx` | 27.1 KB | 工单管理逻辑内联 |
| `backoffice/marketing/messages/page.tsx` | 21.9 KB | 消息管理逻辑内联 |
| `backoffice/marketing/news/page.tsx` | 22.4 KB | 新闻管理逻辑内联 |
| `backoffice/marketing/banners/page.tsx` | 21.2 KB | Banner 管理逻辑内联 |
| `backoffice/funds/channels/page.tsx` | 23.7 KB | 支付渠道管理内联 |
| `backoffice/funds/deposits/page.tsx` | 23.7 KB | 入金审核内联 |
| `backoffice/funds/withdrawal-review/page.tsx` | 24.7 KB | 出金审核内联 |
| `backoffice/system/config/page.tsx` | 40.1 KB | 系统配置全内联 |

### 3.5 `console.log` / `debugger` 残留（高频文件）

| 文件 | 数量 | 说明 |
|------|------|------|
| `store/backoffice/roleStore.ts` | 9 处 | `console.error` 在 catch 块 |
| `lib/kyc/supplemental-service.ts` | 5+ 处 | `console.log` / `console.error` |
| `app/backoffice/funds/deposits/page.tsx` | 4 处 | 按钮 onClick 中直接 `console.log` |
| `app/backoffice/funds/withdrawal-review/page.tsx` | 4 处 | 同上 |
| `app/backoffice/ib/page.tsx` | 3 处 | 操作回调中 `console.log` |
| `app/backoffice/trading/orders/page.tsx` | 2 处 | Export / Refresh 回调 |
| `app/backoffice/trading/positions/page.tsx` | 2 处 | 同上 |
| `app/backoffice/risk/margin/page.tsx` | 1 处 | row action 回调 |
| `app/backoffice/risk/nbp/page.tsx` | 2 处 | row action 回调 |
| `app/api/console/tenants/[id]/invite/route.ts` | 1 处 | API 路由中 `console.log` |

---

## 四、架构改进建议

### 4.1 组件层：统一为一套 UI 体系（优先级最高）

**现状：** Backoffice 自建了一套 `Button`、`Card`、`PageHeader`、`EmptyState`、`EnhancedDataTable`，与 Portal 使用的 shadcn/ui + `components/ui/` 完全割裂。

**建议：**
1. **废弃 `components/backoffice/ui/PageHeader.tsx` 中的 Button/Card/EmptyState**，统一使用 `components/ui/` 下的 shadcn/ui 组件
2. **保留 Backoffice 特有的业务组件**（`StatusBadge`、`LevelBadge`、`EnhancedDataTable`、`FilterBar`、`Drawer`）但将它们迁移到 `components/backoffice/` 根目录，不再伪装成通用 UI
3. **修复 `components/backoffice/ui/index.ts`** — 停止从 `PageHeader.tsx` 导出 `Button`、`Card`、`EmptyState`
4. **将 `EnhancedDataTable` 与 `DataTable` 合并**为一个通用 `DataTable` 组件，放在 `components/ui/data-table.tsx`，通过 props 控制功能开关（selectable、rowActions、exportable）

### 4.2 数据层：Mock 数据治理（优先级最高）

**现状：** 50+ 页面直接 `const mockUsers = [...]` 写死数据。

**建议：**
1. **引入环境开关** — `NEXT_PUBLIC_USE_MOCK=true` 时走 Mock Service Worker 或统一 Mock API 层
2. **所有 Mock 数据迁移到 `lib/mocks/`** 目录，按领域模块（`users.ts`、`orders.ts`、`funds.ts` 等）组织
3. **页面中只保留类型定义和业务逻辑**，数据通过 `useSWR` / `React Query` 从 API hooks 获取
4. **API Route** (`app/api/`) 中已存在部分 Mock，建议将分散的 Mock 统一收口到 API 层

### 4.3 页面层：拆分大型页面组件

**建议拆分为以下模式：**

```
app/backoffice/system/kyc-config/
├── page.tsx              # 仅负责数据获取和布局编排（<100 行）
├── KYCConfigForm.tsx     # 表单容器
├── ProviderSettings.tsx  # 服务商配置子组件
├── RegionSettings.tsx    # 地区配置子组件
└── types.ts              # 页面专属类型
```

对 `portal/fund/deposit/page.tsx`、`portal/settings/page.tsx` 等同样适用。

### 4.4 类型安全：消除 `as any` 和 `as never`

1. **为所有颜色/状态映射表声明联合类型**：
   ```ts
   type StatusType = "success" | "warning" | "error" | "info" | "pending" | "default";
   type LevelType = "standard" | "vip" | "premium" | "enterprise";
   ```
2. **StatusBadge 的 `type` prop 应支持上述联合类型**，外部使用时无需 `as any`
3. **react-hook-form 的 `setValue`** 使用 `Path<FormValues>` 泛型，避免 `value as any`
4. **roleStore 的 `actions.includes`** 将 `actions` 声明为 `string[]` 而非 `never[]`

### 4.5 状态管理：Zustand Store 重组

**现状：** 11 个 store，其中 8 个在 `store/backoffice/` 中。

**建议：**
1. **按领域而非按页面拆分** — 当前 `staffStore.ts`、`twoFAStore.ts`、`userSettingsStore.ts` 等按页面拆分，导致同领域数据分散
2. **合并同类 store**：
   - `authStore` + `userProfileStore` → `authStore`（认证与用户信息天然一体）
   - `securityStore` + `twoFAStore` → `securityStore`
3. **Store 中禁止直接写 Mock 初始数据**，通过初始化函数注入
4. **引入 `useSWR` 或 `React Query`** 替代部分只读 store，减少全局状态数量

### 4.6 样式一致性：主题 Token 全面落地

**现状：** `card.tsx` 使用 `--tp-surface`、`--tp-fg` 等 CSS 变量，但大量页面仍使用 `bg-gray-50`、`text-gray-900`。

**建议：**
1. **制定 Token 替换规则**：
   - `bg-gray-50` → `bg-[var(--tp-surface)]`
   - `text-gray-900` → `text-[var(--tp-fg)]`
   - `border-gray-200` → `border-[var(--tp-border)]`
2. **在 `globals.css` 中定义语义化工具类**：
   ```css
   @utility surface { background-color: var(--tp-surface); }
   @utility fg { color: var(--tp-fg); }
   ```
3. **一次性批量替换**（可用 codemod）Backoffice 页面中的硬编码颜色

### 4.7 工程规范：清理 `console` 和 `use client`

1. **ESLint 规则**：启用 `no-console`（允许 `warn`/`error` 但需审查）
2. **逐个审查 `"use client"`**：纯展示页面（如 marketing 首页 sections、backoffice 列表页）应尽可能使用 Server Component
3. **统一占位页面**：提取为 `components/common/ComingSoonPage.tsx`，所有未开发页面直接引用

---

## 五、优先级排序的整改清单

### Phase 1（立即执行，1-2 周）

- [ ] **P0-4** 修复 `backoffice/ui/index.ts` 的混乱导出，将 Button/Card/EmptyState 的引用迁移到 `components/ui/`
- [ ] **P0-5** 提取统一 `ComingSoonPage` 组件，替换 6+ 个重复占位页面
- [ ] **P1-3** 全局搜索并移除/替换 `console.log`（保留必要的 `console.error` 但需替换为错误上报）
- [ ] **P1-1** 修复 28 处 `as any`（优先处理 backoffice 页面中的状态颜色映射）
- [ ] **P0-7** 将 StatusBadge 中的中文 key 迁移到国际化 key 或英文标识

### Phase 2（短期，2-4 周）

- [ ] **P0-1** 统一 UI 组件体系：废弃 backoffice 自建 Button/Card/PageHeader/EmptyState，全量迁移到 `components/ui/`
- [ ] **P1-4** 合并 `EnhancedDataTable` 与 `DataTable` 为一个通用组件
- [ ] **P0-6** 审查并移除不必要的 `"use client"`，将纯展示页面改为 Server Component
- [ ] **P0-2** 建立 Mock 数据治理规范：所有 Mock 迁移到 `lib/mocks/` 并通过环境开关控制
- [ ] **P1-5** 从 Store 中移除硬编码 Mock 初始数据，改为工厂函数注入
- [ ] **P1-2** 修复 `roleStore.ts` 中的 `as never`

### Phase 3（中期，1-2 个月）

- [ ] **P0-3** 拆分超大型页面组件（>500 行）为独立子组件 + 类型文件
- [ ] **P1-6** 全面替换硬编码 Tailwind 颜色为 CSS 变量 Token
- [ ] **P1-8** 拆分 `portal/settings/page.tsx` 内联 Section 组件到 `components/portal/settings/`
- [ ] **P2-2** 建立 `hooks/` 目录规范，提取常用逻辑（如 `usePagination`、`useFilter`、`useDebounce`）
- [ ] **P2-3** 合并 `types/` 与 `lib/types.ts`，统一类型定义入口

### Phase 4（长期，持续）

- [ ] **P2-7** 重构 `lib/` 目录为按领域模块组织（`lib/user/`、`lib/funds/`、`lib/trading/` 等）
- [ ] **P1-5** 引入 `React Query` / `SWR` 替代部分只读 Zustand store
- [ ] **P2-1** 移除未使用的 `PlaceholderPage` 组件
- [ ] 建立前端 Code Review Checklist，防止新问题回潮

---

## 六、数据附录

### 文件规模分布

| 范围 | page.tsx 数量 | 说明 |
|------|--------------|------|
| < 5 KB | ~60 | 小型页面，正常 |
| 5-15 KB | ~55 | 中等页面，建议检查 |
| 15-30 KB | ~35 | 大型页面，**需要拆分** |
| > 30 KB | ~6 | 超大型页面，**必须拆分** |

### 组件规模分布

| 范围 | 组件数量 | 说明 |
|------|---------|------|
| < 100 行 | ~80 | 健康 |
| 100-300 行 | ~45 | 可接受 |
| 300-500 行 | ~15 | 关注 |
| > 500 行 | ~8 | **需要拆分**（KYCDevPanel 35KB、Sidebar 23.7KB 等） |

### 技术栈统计

| 技术 | 使用范围 | 评价 |
|------|---------|------|
| Next.js 16 App Router | 全站 | 正确使用 |
| Tailwind CSS v4 | 全站 | 注意 Token 一致性 |
| shadcn/ui (Radix) | `components/ui/` | Backoffice 未充分使用 |
| Framer Motion | Portal + Backoffice | 合理使用 |
| Zustand | `store/` | 数量偏多，建议合并 |
| lucide-react | 全站 | 统一，良好 |

---

*报告结束。如有需要，可针对任何具体模块展开深度审计。*
