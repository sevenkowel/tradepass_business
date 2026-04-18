# TradePass SaaS - Development Plan

> Version: 1.0.0-draft  
> Status: 待确认  
> Last Updated: 2026-04-17

---

## 1. 总体策略

- **MVP 先行**：6 周内交付可注册、可创建租户、可订阅 Broker OS 的完整闭环。
- **API 先行**：所有模块开发前必须先定 API Spec（OpenAPI 3.0）。
- **适配而非重写**：现有 Broker OS 代码通过「多租户适配层」接入，不侵入核心交易逻辑。
- **增量迭代**：Phase 1 跑通后再接入 Growth Engine / Trade Engine / Trading Engine。

---

## 2. 技术架构草案

### 2.1 系统拓扑

```
                         ┌─────────────────┐
                         │   CDN / WAF     │
                         └────────┬────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
      ┌───────────────┐   ┌───────────────┐   ┌───────────────┐
      │  官网 Website  │   │   Console     │   │  Admin Portal │
      │   (Next.js)   │   │   (Next.js)   │   │   (Next.js)   │
      └───────────────┘   └───────┬───────┘   └───────────────┘
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼             ▼
            ┌───────────┐ ┌───────────┐ ┌───────────┐
            │  Auth API │ │ Tenant API│ │ Billing   │
            │ (OAuth2)  │ │ (CRUD)    │ │ API       │
            └─────┬─────┘ └─────┬─────┘ └─────┬─────┘
                  │             │             │
                  └─────────────┼─────────────┘
                                ▼
                    ┌───────────────────────┐
                    │   SaaS Core DB        │
                    │  (PostgreSQL)         │
                    │  - users              │
                    │  - tenants            │
                    │  - subscriptions      │
                    │  - licenses           │
                    │  - invoices           │
                    └───────────────────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
          ┌─────────────────┐     ┌─────────────────┐
          │  Tenant Adapter │     │  Broker OS DB   │
          │  (Middleware)   │     │  (Existing)     │
          └─────────────────┘     └─────────────────┘
```

### 2.2 关键技术选型

| 层级 | 选型 | 说明 |
|---|---|---|
| 前端框架 | Next.js 16 + TypeScript + Tailwind v4 | 与现有项目保持一致 |
| UI 组件 | shadcn/ui + 自定义组件 | 复用现有设计系统 |
| 后端 API | Next.js App Router API Routes | 快速开发，团队熟悉 |
| 数据库 | PostgreSQL + Prisma | SaaS Core 数据持久化 |
| 缓存 | Redis | Session、License 校验缓存、Rate Limit |
| 消息队列 | Redis / BullMQ | 账单异步生成、用量聚合 |
| 支付 | Stripe + 自研 Crypto Invoice | 信用卡自动扣款 + 加密货币手动支付 |
| 部署 | Vercel (Frontend) + AWS ECS/RDS (Backend) | 或沿用现有基础设施 |

### 2.3 多租户隔离策略（建议方案）

采用 **共享数据库 + Row-Level Security (RLS)** 模式：

- 所有 SaaS 核心表（users, tenants, subscriptions, licenses, invoices）增加 `tenant_id` 字段。
- 应用层中间件强制注入当前用户的 `tenant_id`。
- 数据库层配置 RLS Policy，防止跨租户数据泄露。
- 产品引擎侧（Broker OS）通过 Tenant Adapter 在请求头中携带 `x-tenant-id` 和 `x-license-key`，现有系统 minimal change。

---

## 3. 里程碑与排期

### Phase 1: MVP — SaaS 基础平台（Week 1-6）

**目标**：用户可以注册、创建租户、订阅 Broker OS 基础版、进入 Portal/Backoffice、收到第一张账单。

| 周 | 模块 | 任务 | 交付物 | 负责人 |
|---|---|---|---|---|
| W1 | **架构与认证** | 1. SaaS Core DB 设计（ERD + Prisma Schema）<br>2. 用户注册/登录/邮箱验证 API<br>3. JWT + Refresh Token 机制<br>4. 官网注册页 + 登录页 | `API-Spec.yaml`、Auth 页面、DB Migration | 架构师 / 开发 |
| W2 | **Console - 租户管理** | 1. Console 基础布局（Sidebar + Header）<br>2. 租户列表 / 创建租户 / 租户详情<br>3. 员工邀请 + 角色分配（RBAC）<br>4. 邮箱邀请链路 | Console 租户模块 | 开发 |
| W3 | **Console - 产品与 License** | 1. 产品列表 / 订阅 Broker OS 流程<br>2. License 生成与绑定服务<br>3. 租户开通后自动分配 Portal/Backoffice URL<br>4. License 校验中间件 | License API、产品订阅页面 | 开发 |
| W4 | **Console - 账单与支付** | 1. 账单生成服务（周期任务）<br>2. Stripe Checkout 集成<br>3. 加密货币支付单生成（USDT）<br>4. 账单列表 + 支付页 | Billing API、账单页面 | 开发 |
| W5 | **Admin 后台** | 1. User 管理（审核 / 冻结 / Impersonate）<br>2. License 管理（生成 / 续期 / 停用）<br>3. 计量计费看板（用量 / 收入 / 对账） | Admin 三模块页面 | 开发 |
| W6 | **集成测试与官网** | 1. E2E 测试（注册 → 创建租户 → 订阅 → 支付）<br>2. 官网首页 + 定价页 UI 优化<br>3. 文档补充（Quick Start）<br>4. Bug 修复与性能调优 | 完整 MVP、测试报告 | 开发 / QA |

### Phase 2: 产品矩阵扩展（Week 7-10）

**目标**：支持 Growth Engine / Trade Engine / Trading Engine 的订阅与配置。

| 周 | 任务 |
|---|---|
| W7 | Growth Engine 接入：功能开关、CDP 配置、Marketing Automation 配置 |
| W8 | Trade Engine 接入：Risk Engine 开关、LP 配置、Margin 配置 |
| W9 | Trading Engine 接入：Web Terminal / Social Copy Trading / API Integration 开关 |
| W10 | 用量计量引擎完善：跨产品用量聚合、定价策略灵活配置、用量告警 |

### Phase 3: 运营与增长（Week 11+）

- 14 天自助试用流程
- 优惠码系统（Promo Code）
- 多语言（EN / ZH / JP / ES）
- 多区域部署（新加坡 / 伦敦 / 纽约）
- API 开放平台与开发者文档

---

## 4. 接口里程碑

```
Week 1: Auth API      →  POST /api/auth/register
                        POST /api/auth/login
                        POST /api/auth/verify-email
                        POST /api/auth/refresh

Week 2: Tenant API    →  GET    /api/tenants
                        POST   /api/tenants
                        GET    /api/tenants/:id
                        PATCH  /api/tenants/:id
                        POST   /api/tenants/:id/invite
                        DELETE /api/tenants/:id/members/:userId

Week 3: Product API   →  GET    /api/products
                        POST   /api/tenants/:id/subscribe
                        GET    /api/tenants/:id/license
                        POST   /api/licenses/validate

Week 4: Billing API   →  GET    /api/invoices
                        POST   /api/invoices/:id/pay
                        POST   /api/billing/checkout-session
                        GET    /api/usage

Week 5: Admin API     →  GET    /api/admin/users
                        PATCH  /api/admin/users/:id/status
                        GET    /api/admin/licenses
                        POST   /api/admin/licenses/bulk-renew
                        GET    /api/admin/metrics
```

---

## 5. 风险与应对

| 风险 | 影响 | 应对 |
|---|---|---|
| 现有 Broker OS 代码耦合度高 | 高 | 采用 Adapter 模式隔离，不侵入核心业务 |
| 多租户数据隔离出现漏洞 | 高 | Prisma + PostgreSQL RLS 双重保护，安全审计在 W6 |
| Stripe 支付合规延迟 | 中 | 同步准备 Crypto Invoice 作为 fallback |
| 并发租户创建导致 License 重复 | 中 | Redis 分布式锁 + 唯一索引 |
| 团队对 Next.js App Router 不熟悉 | 低 | 复用现有技术栈，无需额外学习成本 |

---

## 6. 待确认事项

在正式启动开发前，请确认以下决策：

1. [ ] **租户隔离模式**：确认采用「共享数据库 + RLS」还是「独立数据库/Schema」？
2. [ ] **MVP 首发产品**：确认仅上架 Broker OS，还是四款产品同时接入？
3. [ ] **计费模式**：确认混合计费（Base + Per Seat）方案是否可行？
4. [ ] **基础设施**：确认部署在现有环境还是新增独立 SaaS 集群？
5. [ ] **团队人力**：确认 Phase 1 是否有足够前端/后端人力并行推进？

---

*文档状态：Draft，待产品负责人确认后进入 Frozen 状态并启动开发。*
