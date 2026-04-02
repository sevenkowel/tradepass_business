# TradePass Back Office 技术实施计划

**版本**: v1.0
**日期**: 2026-04-02
**状态**: 待评审

---

## 一、项目结构规划

### 1.1 目录结构

```
tradepass/
├── src/
│   ├── app/
│   │   ├── (backoffice)/              # Backoffice路由组
│   │   │   ├── layout.tsx             # Backoffice布局(含Sidebar/TopBar)
│   │   │   ├── page.tsx               # Dashboard首页
│   │   │   │
│   │   │   ├── dashboard/             # 仪表盘
│   │   │   │   ├── overview/
│   │   │   │   ├── monitor/
│   │   │   │   └── funnel/
│   │   │   │
│   │   │   ├── users/                 # 用户管理
│   │   │   │   ├── list/
│   │   │   │   ├── [id]/
│   │   │   │   ├── tags/
│   │   │   │   └── levels/
│   │   │   │
│   │   │   ├── compliance/            # 合规管理
│   │   │   │   ├── kyc/
│   │   │   │   ├── risk-control/
│   │   │   │   ├── blacklist/
│   │   │   │   └── audit-logs/
│   │   │   │
│   │   │   ├── accounts/              # 账户管理
│   │   │   │   ├── mt-accounts/
│   │   │   │   ├── groups/
│   │   │   │   └── leverage/
│   │   │   │
│   │   │   ├── funds/                 # 资金管理
│   │   │   │   ├── deposits/
│   │   │   │   ├── withdrawals/
│   │   │   │   ├── transactions/
│   │   │   │   └── channels/
│   │   │   │
│   │   │   ├── trading/               # 交易管理
│   │   │   │   ├── orders/
│   │   │   │   ├── positions/
│   │   │   │   ├── instruments/
│   │   │   │   └── settings/
│   │   │   │
│   │   │   ├── ib/                    # IB/推荐
│   │   │   │   ├── ib-list/
│   │   │   │   ├── referral-tree/
│   │   │   │   ├── commissions/
│   │   │   │   └── commission-settings/
│   │   │   │
│   │   │   ├── copy-trading/          # 跟单管理
│   │   │   │   ├── traders/
│   │   │   │   ├── followers/
│   │   │   │   ├── copy-settings/
│   │   │   │   └── profit-sharing/
│   │   │   │
│   │   │   ├── ai-signals/            # AI信号
│   │   │   │   ├── signal-list/
│   │   │   │   ├── usage-control/
│   │   │   │   └── signal-pool/
│   │   │   │
│   │   │   ├── risk/                  # 风险管理
│   │   │   │   ├── risk-dashboard/
│   │   │   │   ├── risk-rules/
│   │   │   │   ├── margin-alerts/
│   │   │   │   └── nbp/
│   │   │   │
│   │   │   ├── crm/                   # 客服支持
│   │   │   │   ├── tickets/
│   │   │   │   ├── interaction-logs/
│   │   │   │   └── feedback/
│   │   │   │
│   │   │   ├── marketing/             # 营销管理
│   │   │   │   ├── campaigns/
│   │   │   │   ├── messages/
│   │   │   │   ├── banners/
│   │   │   │   └── news/
│   │   │   │
│   │   │   ├── reports/               # 报表中心
│   │   │   │   ├── financial/
│   │   │   │   ├── trading/
│   │   │   │   └── user-reports/
│   │   │   │
│   │   │   └── system/                # 系统设置
│   │   │       ├── roles/
│   │   │       ├── config/
│   │   │       ├── api/
│   │   │       └── operation-logs/
│   │   │
│   │   └── api/                       # API Routes (如需要)
│   │       └── backoffice/
│   │
│   ├── components/
│   │   ├── backoffice/                # Backoffice通用组件
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TopBar.tsx
│   │   │   │   ├── MobileMenu.tsx
│   │   │   │   └── Breadcrumb.tsx
│   │   │   │
│   │   │   ├── ui/                    # UI组件
│   │   │   │   ├── DataTable.tsx      # 增强版表格
│   │   │   │   ├── StatCard.tsx       # 统计卡片
│   │   │   │   ├── PageHeader.tsx     # 页面头部
│   │   │   │   ├── Drawer.tsx         # 抽屉
│   │   │   │   ├── Modal.tsx          # 模态框
│   │   │   │   ├── Tabs.tsx           # 标签页
│   │   │   │   ├── Badge.tsx          # 状态徽章
│   │   │   │   ├── Button.tsx         # 按钮
│   │   │   │   ├── Select.tsx         # 下拉选择
│   │   │   │   ├── DatePicker.tsx     # 日期选择
│   │   │   │   └── Form/              # 表单组件
│   │   │   │
│   │   │   ├── charts/                # 图表组件
│   │   │   │   ├── LineChart.tsx
│   │   │   │   ├── BarChart.tsx
│   │   │   │   ├── PieChart.tsx
│   │   │   │   ├── AreaChart.tsx
│   │   │   │   └── FunnelChart.tsx
│   │   │   │
│   │   │   └── filters/               # 筛选组件
│   │   │       ├── FilterBar.tsx
│   │   │       ├── StatusFilter.tsx
│   │   │       └── DateRangeFilter.tsx
│   │
│   ├── hooks/                         # 自定义Hooks
│   │   ├── useAuth.ts
│   │   ├── usePermission.ts
│   │   ├── useTable.ts
│   │   └── useToast.ts
│   │
│   ├── lib/
│   │   ├── api/                      # API调用
│   │   │   ├── client.ts             # API客户端
│   │   │   ├── users.ts
│   │   │   ├── accounts.ts
│   │   │   ├── orders.ts
│   │   │   └── ...
│   │   │
│   │   ├── store/                    # 状态管理
│   │   │   ├── authStore.ts
│   │   │   ├── sidebarStore.ts
│   │   │   └── themeStore.ts
│   │   │
│   │   └── utils/                    # 工具函数
│   │       ├── format.ts             # 格式化(金额/日期)
│   │       ├── validation.ts          # 验证规则
│   │       └── permission.ts         # 权限判断
│   │
│   ├── types/                        # 类型定义
│   │   ├── user.ts
│   │   ├── account.ts
│   │   ├── order.ts
│   │   ├── common.ts
│   │   └── api.ts
│   │
│   └── store/                        # Zustand Store
│       ├── authStore.ts
│       └── uiStore.ts
│
├── docs/
│   └── backoffice/
│       ├── SPEC.md                   # 需求规格
│       ├── TEST-CASES.md             # 测试用例
│       ├── TECH-PLAN.md              # 本文档
│       └── API.md                    # API文档(待创建)
│
└── public/
    └── backoffice/                   # 静态资源
        └── images/
```

---

## 二、技术实现方案

### 2.1 布局架构

#### Backoffice Layout (布局组件)

```tsx
// src/app/(backoffice)/layout.tsx
import { Sidebar } from "@/components/backoffice/layout/Sidebar";
import { TopBar } from "@/components/backoffice/layout/TopBar";

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

#### Sidebar 组件规格

```tsx
// 规格:
// - 宽度: 260px (展开) / 72px (折叠)
// - 支持多级菜单
// - 当前页面高亮
// - 折叠状态持久化 (localStorage)
```

#### TopBar 组件规格

```tsx
// 规格:
// - 高度: 64px
// - 环境标识 (Live/Demo)
// - 全局搜索 (Cmd+K)
// - 通知中心
// - 用户下拉菜单
```

### 2.2 通用组件实现

#### 增强版 DataTable

基于现有 `portal/tables/DataTable.tsx` 增强:

```tsx
// 新增功能:
// 1. 列宽拖拽
// 2. 列显示/隐藏
// 3. 批量选择
// 4. 行操作菜单
// 5. 固定列
// 6. 导出功能

interface EnhancedDataTableProps<T> extends DataTableProps<T> {
  selectable?: boolean;
  exportable?: boolean;
  fixedColumns?: { left?: string[]; right?: string[] };
  rowActions?: (row: T) => ActionItem[];
}
```

#### Drawer 抽屉组件

```tsx
// 使用 Framer Motion 实现动画
// 规格:
// - 宽度: 480px (标准) / 640px (详情)
// - 从右滑入
// - 遮罩层点击关闭
// - ESC键关闭
```

#### 表单组件 (React Hook Form + Zod)

```tsx
// 统一使用:
// - React Hook Form 管理表单状态
// - Zod 定义验证规则
// - 统一的错误提示样式
```

### 2.3 图表组件

基于 Recharts 实现:

| 组件 | 类型 | 用途 |
|------|------|------|
| LineChart | 折线图 | 趋势展示 |
| BarChart | 柱状图 | 对比展示 |
| PieChart | 饼图 | 占比展示 |
| AreaChart | 面积图 | 趋势+对比 |
| FunnelChart | 漏斗图 | 转化展示 |

### 2.4 状态管理

#### Auth Store (Zustand)

```tsx
// 认证状态管理
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  permissions: string[];
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}
```

#### UI Store (Zustand)

```tsx
// UI状态管理
interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: Theme) => void;
}
```

### 2.5 API 层设计

#### API 客户端

```tsx
// src/lib/api/client.ts
const apiClient = createClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
});

// 请求拦截器: 添加Token
// 响应拦截器: 处理错误
```

#### API 模块化

```tsx
// src/lib/api/users.ts
export const usersApi = {
  list: (params: UserListParams) => apiClient.get('/users', { params }),
  detail: (id: string) => apiClient.get(`/users/${id}`),
  update: (id: string, data: UserUpdate) => apiClient.patch(`/users/${id}`, data),
  freeze: (id: string, reason: string) => apiClient.post(`/users/${id}/freeze`, { reason }),
};
```

---

## 三、权限系统设计

### 3.1 权限模型 (RBAC)

```typescript
// 权限结构
interface Permission {
  module: string;      // 模块: users, funds, trading...
  action: string;       // 操作: view, create, edit, delete, approve
  resource?: string;    // 资源: 可选，特定资源ID
}

// 示例权限
const permissions = [
  { module: 'users', action: 'view' },
  { module: 'users', action: 'edit' },
  { module: 'funds', action: 'approve' },
  { module: 'system', action: 'admin' },
];
```

### 3.2 角色定义

```typescript
// 预置角色
const roles = {
  super_admin: {
    name: '超级管理员',
    permissions: ['*'], // 全部权限
  },
  ops_director: {
    name: '运营总监',
    permissions: [
      { module: 'dashboard', action: '*' },
      { module: 'users', action: '*' },
      { module: 'funds', action: '*' },
      { module: 'compliance', action: '*' },
      // ...
    ],
  },
  finance: {
    name: '财务专员',
    permissions: [
      { module: 'funds', action: '*' },
      { module: 'reports', action: 'view' },
    ],
  },
  // ...
};
```

### 3.3 权限守卫

```tsx
// 路由守卫
<PermissionGuard permissions={['users', 'view']}>
  <UserListPage />
</PermissionGuard>

// 或者Hook方式
const { hasPermission } = usePermission();
if (!hasPermission('funds', 'approve')) {
  // 禁用按钮或隐藏
}
```

---

## 四、分阶段实施计划

### Phase 1: 基础设施 (第1-2周)

#### Week 1: 项目搭建

| 任务 | 负责人 | 交付物 | 完成标准 |
|------|--------|--------|----------|
| 创建backoffice路由结构 | - | 目录结构 | 路由可访问 |
| 搭建layout组件 | - | Sidebar/TopBar | 布局稳定 |
| 配置全局样式 | - | globals.css更新 | 设计规范落地 |
| 配置路由守卫 | - | Auth检查 | 权限控制 |
| 配置Zustand Store | - | AuthStore/UIStore | 状态管理 |

#### Week 2: 通用组件

| 任务 | 负责人 | 交付物 | 完成标准 |
|------|--------|--------|----------|
| 增强DataTable组件 | - | EnhancedDataTable | 功能完整 |
| 封装Drawer组件 | - | Drawer组件 | 动画流畅 |
| 封装Modal组件 | - | Modal组件 | 交互正常 |
| 封装Form组件 | - | FormInput/Select等 | 验证正常 |
| 封装Badge/Button | - | UI组件 | 样式统一 |
| 封装图表组件 | - | 5种图表 | 数据正确 |

**Phase 1 里程碑**: 具备开发页面的基础能力

---

### Phase 2: 核心功能 (第3-6周)

#### Week 3: Dashboard

| 任务 | 负责人 | 交付物 | 完成标准 |
|------|--------|--------|----------|
| Dashboard页面框架 | - | 页面结构 | 布局正确 |
| KPI卡片组件 | - | 6个StatCard | 数据正确 |
| 交易量趋势图 | - | LineChart | 数据正确 |
| 用户趋势图 | - | BarChart | 数据正确 |
| 实时动态列表 | - | 动态列表 | 刷新正常 |

#### Week 4: Users模块

| 任务 | 负责人 | 交付物 | 完成标准 |
|------|--------|--------|----------|
| 用户列表页 | - | 列表页 | 筛选/搜索正常 |
| 用户详情页 | - | 详情页 | Tab切换正常 |
| 冻结/解冻功能 | - | API集成 | 操作正常 |
| 余额调整功能 | - | API集成 | 记录正确 |

#### Week 5: Compliance模块

| 任务 | 负责人 | 交付物 | 完成标准 |
|------|--------|--------|----------|
| KYC审核列表 | - | 列表页 | 状态正确 |
| KYC审核抽屉 | - | 审核抽屉 | 审核流程完整 |
| 黑名单管理 | - | 黑名单页 | 添加/移除正常 |
| 审计日志 | - | 日志页 | 筛选正常 |

#### Week 6: Funds模块

| 任务 | 负责人 | 交付物 | 完成标准 |
|------|--------|--------|----------|
| 入金订单列表 | - | 列表页 | 筛选/详情正常 |
| 出金审核列表 | - | 列表页 | 审核流程完整 |
| 出金审核抽屉 | - | 审核抽屉 | 初审/复审正常 |
| 资金流水 | - | 流水页 | 筛选/导出正常 |

**Phase 2 里程碑**: 核心运营模块可用

---

### Phase 3: 扩展功能 (第7-10周)

#### Week 7-8: Accounts & Trading

| 模块 | 任务 | 交付物 |
|------|------|--------|
| Accounts | MT账户列表/详情 | 账户管理页 |
| Accounts | 账户创建/修改 | CRUD功能 |
| Accounts | 杠杆设置 | 配置页 |
| Trading | 订单/持仓列表 | 列表页 |
| Trading | 交易统计 | 图表+数据 |

#### Week 9-10: IB & Risk

| 模块 | 任务 | 交付物 |
|------|------|--------|
| IB | IB列表/推荐树 | IB管理页 |
| IB | 佣金配置/记录 | 佣金管理 |
| Risk | 风控仪表盘 | 风险概览 |
| Risk | 风控规则配置 | 规则管理 |
| Risk | 保证金预警 | 预警列表 |

**Phase 3 里程碑**: 交易和风控模块可用

---

### Phase 4: 辅助功能 (第11-14周)

#### Week 11-12: CRM & Reports

| 模块 | 任务 | 交付物 |
|------|------|--------|
| CRM | 工单列表/详情 | 工单管理 |
| CRM | 工单回复/升级 | 完整流程 |
| Reports | 财务报表 | 报表生成 |
| Reports | 交易报表 | 报表生成 |
| Reports | 用户报表 | 报表生成 |

#### Week 13-14: Marketing & System

| 模块 | 任务 | 交付物 |
|------|------|--------|
| Marketing | 活动管理 | 活动CRUD |
| Marketing | 消息推送 | 推送功能 |
| System | 角色权限 | 权限管理 |
| System | 配置中心 | 参数配置 |
| System | 操作日志 | 日志审计 |

**Phase 4 里程碑**: 全部模块开发完成

---

### Phase 5: 优化与上线 (第15-16周)

#### Week 15: 测试与修复

| 任务 | 负责人 | 交付物 |
|------|--------|--------|
| 功能测试 | - | 测试报告 |
| UI验收 | - | 验收清单 |
| Bug修复 | - | 修复记录 |
| 性能优化 | - | 优化报告 |

#### Week 16: 部署上线

| 任务 | 负责人 | 交付物 |
|------|--------|--------|
| 环境部署 | - | 部署文档 |
| 数据迁移 | - | 迁移脚本 |
| 用户培训 | - | 培训材料 |
| 上线确认 | - | 上线报告 |

**Phase 5 里程碑**: 系统正式上线

---

## 五、里程碑汇总

| 里程碑 | 目标日期 | 交付内容 |
|--------|----------|----------|
| M1: 基础设施完成 | Week 2 末 | 布局/组件就绪 |
| M2: 核心功能完成 | Week 6 末 | Dashboard/Users/Compliance/Funds |
| M3: 交易风控完成 | Week 10 末 | Accounts/Trading/IB/Risk |
| M4: 全部功能完成 | Week 14 末 | CRM/Reports/Marketing/System |
| M5: 正式上线 | Week 16 末 | 稳定运行 |

---

## 六、技术规范

### 6.1 代码规范

- **TypeScript**: 严格模式开启
- **命名规范**: 遵循 Next.js 约定
  - 组件: PascalCase (UserList.tsx)
  - Hooks: camelCase (useUserList.ts)
  - 工具函数: camelCase (formatCurrency.ts)
- **组件规范**:
  - 使用 Server Components (默认)
  - 仅在需要交互时添加 'use client'
  - Props 类型必须定义

### 6.2 Git 规范

- **分支命名**: `feature/backoffice-{模块名}`
- **Commit Message**: `feat|fix|docs|style|refactor|test: {描述}`
- **PR 要求**: 至少1人 Review 通过

### 6.3 代码审查清单

- [ ] TypeScript 类型完整
- [ ] 错误处理完善
- [ ] 加载状态处理
- [ ] 空状态处理
- [ ] 响应式适配
- [ ] 权限检查
- [ ] 日志记录

---

## 七、质量保证

### 7.1 测试策略

| 测试类型 | 覆盖要求 | 执行时机 |
|---------|---------|----------|
| 单元测试 | 工具函数/Hooks | PR时 |
| 集成测试 | API调用 | PR时 |
| E2E测试 | 核心流程 | 发布前 |

### 7.2 性能指标

| 指标 | 目标值 |
|------|--------|
| Lighthouse Score | ≥90 |
| FCP | <2s |
| LCP | <2.5s |
| TTI | <3s |
| CLS | <0.1 |

### 7.3 代码覆盖率

- 核心业务逻辑: ≥80%
- 工具函数: ≥90%
- 组件: ≥70%

---

## 八、风险与对策

| 风险 | 影响 | 概率 | 对策 |
|------|------|------|------|
| API接口延期 | 高 | 中 | Mock数据先行 |
| 需求变更 | 中 | 高 | 敏捷迭代,快速响应 |
| 性能问题 | 中 | 低 | 性能测试提前介入 |
| 人员变动 | 高 | 低 | 文档完善,知识共享 |
| 安全漏洞 | 高 | 低 | 安全审查,代码扫描 |

---

## 九、依赖资源

### 9.1 内部依赖

| 依赖项 | 负责方 | 交付时间 |
|--------|--------|----------|
| API接口文档 | 后端团队 | Week 2 |
| Mock数据 | 后端团队 | Week 1 |
| 设计稿 | 设计团队 | Week 3 |
| 测试账号 | 运维团队 | Week 1 |

### 9.2 第三方依赖

| 依赖项 | 用途 | 备注 |
|--------|------|------|
| recharts | 图表 | 已有的 |
| framer-motion | 动画 | 已有的 |
| lucide-react | 图标 | 已有的 |
| react-hook-form | 表单 | 已有的 |
| zod | 验证 | 已有的 |
| zustand | 状态管理 | 已有的 |
| tanstack-query | 数据请求 | 已有的 |

---

## 十、沟通计划

| 会议 | 频率 | 参与方 | 内容 |
|------|------|--------|------|
| 每日站会 | 每日 | 开发团队 | 进度/阻塞 |
| 周评审 | 每周 | 产品+开发 | 迭代评审 |
| 设计评审 | 按需 | 设计+开发 | UI验收 |
| 技术方案评审 | 按需 | 技术团队 | 方案讨论 |

---

## 十一、文档交付清单

| 文档 | 负责人 | 状态 |
|------|--------|------|
| SPEC.md | PM | 已完成 |
| TEST-CASES.md | QA | 待完成 |
| TECH-PLAN.md | Dev | 已完成 |
| API.md | 后端 | 待完成 |
| 部署文档 | 运维 | 待完成 |
| 用户手册 | PM | 待完成 |
| 培训材料 | PM | 待完成 |

---

## 附录

### A. 关键技术参考

- [Next.js 16 文档](https://nextjs.org/docs)
- [Tailwind CSS v4 文档](https://tailwindcss.com/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod 验证](https://zod.dev/)
- [Recharts 图表](https://recharts.org/)

### B. 组件库参考

- [Radix UI](https://www.radix-ui.com/) - 无样式组件库
- [Headless UI](https://headlessui.com/) - Tailwind官方
- [shadcn/ui](https://ui.shadcn.com/) - 可参考实现模式

### C. 设计系统参考

- TradePass Portal 设计规范
- Ant Design Pro
- ByteDance Arco Design
