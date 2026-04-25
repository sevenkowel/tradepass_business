# TradePass 后端 API 与数据层审计报告

> 审计日期：2026-04-25  
> 审计范围：`src/app/api/`、`src/lib/`、`public/data/`、Prisma Schema  
> 审计者：backend-audit

---

## 一、执行摘要

| 维度 | 评分 | 说明 |
|------|------|------|
| API 健康度（整体） | **C+ / 68分** | 约 42% 为真实 Prisma 实现，36% 为 Mock/内存实现，22% 为文件配置驱动 |
| 数据层完整性 | **D+ / 55分** | Prisma Schema 严重缺失核心业务模型，大量业务依赖 Mock 数据 |
| 安全与权限 | **C / 62分** | 基础认证存在，但权限粒度过粗，敏感路由缺乏保护 |
| KYC 系统架构 | **B / 78分** | 配置系统设计较完善，但存在双系统并存和内存存储问题 |
| Mock 迁移 readiness | **D / 50分** | Mock 数据量大（~89KB），且深度耦合在 UI 逻辑中 |

---

## 二、API 健康度评分（按模块）

### 2.1 API 路由全景

项目共发现 **36 个实际业务 API 路由文件**（排除 `.next/dev/types/` 下的自动生成文件），覆盖 11 个模块：

| 模块 | 路由数 | 真实 API | Mock API | 文件配置 | 健康度 |
|------|--------|----------|----------|----------|--------|
| `auth/` | 6 | 6 | 0 | 0 | A (90) |
| `console/` | 7 | 7 | 0 | 0 | A (88) |
| `admin/` | 3 | 3 | 0 | 0 | B+ (82) |
| `apps/` | 3 | 3 | 0 | 0 | A (85) |
| `tenant/` | 1 | 1 | 0 | 0 | A (85) |
| `onboarding/` | 2 | 2 | 0 | 0 | A (85) |
| `products/` | 1 | 1 | 0 | 0 | A (90) |
| `config/` | 8 | 0 | 0 | 8 | B (75) |
| `kyc/` | 5 | 0 | 5 | 0 | F (35) |
| `portal/kyc/` | 3 | 0 | 3 | 0 | F (30) |
| `backoffice/` | 5 | 1 | 4 | 0 | D (45) |

**汇总**：真实 Prisma 实现 15 个（42%），纯 Mock 12 个（33%），文件配置驱动 8 个（22%），混合/代理 1 个（3%）。

### 2.2 各模块详细分析

#### A 级模块：Auth / Console / Admin / Apps
- **Auth**：登录、注册、登出、Me、邮箱验证、租户访问验证、邀请接受 —— 全部使用 `prisma.user` 操作，含 `bcrypt` 密码哈希和 JWT Token
- **Console**：租户管理、订阅、功能配置、计费、支付 —— 全部使用 Prisma，含 `zod` 输入校验
- **Admin**：用户列表/更新、指标、许可证、审计日志 —— 全部使用 Prisma
- **问题**：Admin 的权限检查注释写明 "for MVP, allow all authenticated users"，生产环境需收紧

#### B 级模块：Config（KYC 配置）
- **设计亮点**：统一配置系统（`kyc-config-unified.json`）具备完整的验证、版本历史、差异对比、回滚功能
- **问题**：
  - 旧系统 `/api/config/kyc` 与新系统 `/api/config/kyc-system` 并存，旧系统已标记 deprecated 但仍在运行
  - 配置数据存储在 `public/data/` 目录下，存在被公开访问的风险
  - 版本号生成逻辑使用 `Math.floor(now.getTime() / 1000) % 10000`，patch 号可能重复

#### F 级模块：KYC / Portal KYC
- **kyc/ocr**：完全 Mock，仅模拟延迟和随机置信度
- **kyc/liveness**：完全 Mock，90% 概率通过
- **kyc/status**：硬编码返回 `not_started`
- **kyc/submit**：调用 `mockKYCReview`，无真实审核流程
- **portal/kyc/check-permission**：从 header 中读取 `x-user-id` 作为用户标识，极度不安全
- **portal/kyc/complete-supplemental / supplemental-requirements**：依赖内存存储的 `SupplementalKYCService`

#### D 级模块：Backoffice
- **backoffice/dashboard**：真实 Prisma 实现（聚合用户/租户/许可证/发票数据）
- **backoffice/kyc/review**：完全 Mock，28 条硬编码审核记录，adminId 写死为 `"admin_current"`
- **backoffice/kyc/supplemental**：依赖内存存储
- **backoffice/kyc/document-expiry**：依赖内存存储
- **backoffice/users/[id]/kyc**：仅返回补充认证状态，无真实 KYC 数据

---

## 三、Mock 数据依赖清单

### 3.1 Mock 文件统计

| 文件 | 大小 | 用途 | 影响范围 |
|------|------|------|----------|
| `src/lib/backoffice/mock-data.ts` | 30.4 KB | MT账户、交易订单、持仓、品种、IB伙伴/客户、佣金记录、风控告警/规则、保证金告警、跟单交易员/跟随者、收益记录、AI信号/用量/模型 | Backoffice 6+ 页面 |
| `src/lib/backoffice/mock-staff.ts` | 13.8 KB | 员工账户、登录历史、审计日志 | Backoffice 员工管理页 |
| `src/lib/backoffice/mock-roles.ts` | 15.5 KB | 角色与权限矩阵 | Backoffice 权限管理页 |
| `src/lib/backoffice/mock-twofa.ts` | 10.2 KB | 2FA 设置、备份码、设备记录 | Backoffice 安全中心 |
| `src/lib/backoffice/mock-security.ts` | 5.8 KB | IP 黑名单、登录锁定策略 | Backoffice 安全设置 |
| `src/lib/backoffice/mock-profile.ts` | 4.6 KB | 员工个人资料 | Backoffice 个人设置 |
| `src/lib/backoffice/mock-settings.ts` | 2.9 KB | 系统设置项 | Backoffice 系统设置 |
| `src/lib/kyc/mock-service.ts` | 5.5 KB | OCR、活体检测、审核决策、地址证明、AML筛查 | KYC 全流程 |
| **合计** | **~88.7 KB** | — | **~25+ 页面/组件** |

### 3.2 迁移优先级矩阵

| 优先级 | 模块 | 工作量 | 阻塞性 | 建议方案 |
|--------|------|--------|--------|----------|
| **P0** | KYC 审核（backoffice/kyc/review） | 中 | 高（监管合规） | 新增 `KYCApplication` Prisma 模型 + 审核工作流 |
| **P0** | KYC OCR / 活体检测 | 高 | 高 | 接入第三方 eKYC 服务商（如 Onfido、Jumio） |
| **P1** | 用户 KYC 状态（kyc/status, portal/kyc/*） | 中 | 高 | 关联 `User.kycStatus` + 新增 `KYCRecord` 表 |
| **P1** | 补充认证（SupplementalKYC） | 中 | 中 | 将内存 Map 迁移到 Prisma `SupplementalKYCRequest` 表 |
| **P2** | MT 账户 / 交易数据 | 高 | 中 | 对接 MT4/MT5 Manager API 或交易桥接服务 |
| **P2** | IB / 佣金系统 | 高 | 中 | 新增 `IBPartner`、`CommissionRecord` 等 Prisma 模型 |
| **P3** | 风控告警 / 规则 | 中 | 低 | 新增 `RiskAlert`、`RiskRule` 模型 + 实时计算引擎 |
| **P3** | 跟单交易 / AI 信号 | 高 | 低 | 接入信号提供商或自研模型服务 |
| **P4** | Backoffice 员工/角色管理 | 低 | 低 | 新增 `Staff`、`Role` 模型（已有 Prisma `User` 可复用） |

---

## 四、数据层问题清单

### 4.1 Prisma Schema 缺失模型（严重）

当前 Prisma Schema 仅包含 **13 个模型**，全部为 SaaS 平台基础模型（User/Tenant/Product 等），**完全缺失经纪商核心业务模型**：

```
❌ 缺失：KYCRecord / KYCApplication       → 影响 KYC 全流程
❌ 缺失：MTAccount / TradingAccount       → 影响账户管理
❌ 缺失：Order / Position / TradeHistory  → 影响交易模块
❌ 缺失：Wallet / Transaction             → 影响资金管理
❌ 缺失：IBPartner / CommissionRecord     → 影响返佣系统
❌ 缺失：RiskAlert / RiskRule             → 影响风控系统
❌ 缺失：CopyTrader / CopyFollower        → 影响跟单系统
❌ 缺失：AISignal / SignalUsage           → 影响信号系统
❌ 缺失：Staff / Role / Permission        → 影响 Backoffice RBAC
```

**风险评估**：Prisma Schema 与前端类型定义严重脱节，前端类型（`src/lib/types.ts`、`src/types/backoffice`）定义了完整的业务模型，但后端数据库层面不存在对应表。这意味着当前所有业务数据均为 Mock/内存状态，无法持久化。

### 4.2 类型一致性问题

| 问题 | 位置 | 严重程度 |
|------|------|----------|
| `Order` 类型前后端定义不一致 | `src/lib/types.ts` vs `src/lib/backoffice/mock-data.ts` | 中 |
| `Position` 类型字段差异（`ticket` 为 number vs string） | `src/lib/types.ts` vs mock-data | 中 |
| `Signal` / `AISignal` 为两个独立类型定义 | `src/lib/types.ts` vs `src/types/backoffice` | 低 |
| `User.kycStatus` Prisma 为 String，前端为 union type | `prisma/schema.prisma` vs `src/lib/types.ts` | 低 |
| `KYCReviewRecord` 仅在 API 路由中定义，无共享类型 | `src/app/api/backoffice/kyc/review/route.ts` | 中 |

### 4.3 数据持久化问题

| 系统 | 存储方式 | 风险 |
|------|----------|------|
| KYC 统一配置 | `public/data/kyc-config-unified.json` | 文件公开可访问；无并发控制；部署后丢失 |
| KYC 旧配置 | `public/data/kyc-config.json` | 同上，且已 deprecated |
| 补充认证请求 | 内存 `Map<string, SupplementalKYCRequest>` | **服务重启后数据全部丢失** |
| KYC 审核队列 | 内存数组 `mockKYCQueue` | 同上 |
| Backoffice 所有业务数据 | 内存 Mock 对象 | 同上 |

---

## 五、权限与安全审查

### 5.1 认证机制

| 机制 | 状态 | 说明 |
|------|------|------|
| JWT Token | 存在 | Cookie 存储，`httpOnly`，`sameSite: lax`，7 天有效期 |
| Password Hash | 存在 | `bcryptjs`，salt rounds = 10 |
| Session 获取 | 存在 | `getCurrentUser()` 从 Cookie 解析 Token 并查库 |

### 5.2 安全问题清单

| # | 问题 | 位置 | 严重程度 |
|---|------|------|----------|
| 1 | **JWT_SECRET 硬编码回退值** | `src/lib/auth.ts:4` | 🔴 严重 |
| 2 | **Backoffice KYC 审核无权限检查** | `src/app/api/backoffice/kyc/review/route.ts` | 🔴 严重 |
| 3 | **Portal 权限检查使用可伪造 Header** | `src/app/api/portal/kyc/check-permission/route.ts:44` | 🔴 严重 |
| 4 | **Admin 权限检查注释为 "MVP 允许所有认证用户"** | `src/app/api/admin/users/route.ts:9` | 🟡 高 |
| 5 | **KYC 审核 adminId 硬编码** | `src/app/api/backoffice/kyc/review/route.ts:315` | 🟡 高 |
| 6 | **KYC 提交 API 无用户认证** | `src/app/api/kyc/submit/route.ts` | 🟡 高 |
| 7 | **KYC 状态 API 无用户认证** | `src/app/api/kyc/status/route.ts` | 🟡 高 |
| 8 | **配置数据存储在 public 目录** | `public/data/kyc-config*.json` | 🟡 高 |
| 9 | **API Client 从 localStorage 读取 Token** | `src/lib/api/client.ts:38` | 🟡 中 |
| 10 | **无 Rate Limiting** | 全局 | 🟡 中 |
| 11 | **无 CORS 配置审查** | 全局 | 🟢 低 |

### 5.3 权限矩阵缺口

当前系统仅区分 "已认证用户" 和 "未认证用户"，缺少：
- 角色基础访问控制（RBAC）：`superadmin` / `admin` / `operator` / `viewer`
- 资源级权限：如 "只能查看自己租户的数据"
- 操作级权限：如 "可以审核 KYC 但不能修改系统配置"
- API 路由级中间件：无统一的权限校验中间件

---

## 六、KYC 系统深度分析

### 6.1 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                     KYC 配置双轨制                           │
├─────────────────────────────┬───────────────────────────────┤
│   Legacy System (Deprecated) │   Unified System (Active)     │
│   /api/config/kyc            │   /api/config/kyc-system      │
│   public/data/kyc-config.json│   public/data/kyc-config-unified.json │
│   AccountOpeningConfig       │   UnifiedKYCConfig            │
│   src/lib/config/service.ts  │   src/lib/kyc/unified-config-service.ts │
└─────────────────────────────┴───────────────────────────────┘
```

**问题**：双系统并存增加了维护负担。旧系统虽已标记 deprecated，但 `/api/config/kyc` 的 GET 端点仍在被调用（兼容层），PUT 端点返回 410。

### 6.2 地区配置复杂度

统一配置系统管理 **9 个地区**：VN、TH、IN、AE、KR、JP、FR、ES、BR

每个地区包含：
- 开户流程配置（steps、formFields、features）
- KYC 升级路径（upgradePaths）
- 补充认证规则（supplementalRules：大额提款、证件过期）
- 联系验证方式（contactVerification）
- 证件号码正则（idNumberPattern）

**维护性评估**：配置通过 JSON 文件管理，编辑体验依赖 Backoffice UI。JSON 文件约 **15-20 KB**，结构嵌套较深（4-5 层），人工编辑易出错。配置服务提供了验证函数 `validateConfig()`，但只在写入时校验，前端无预校验。

### 6.3 配置联动机制

| 联动方向 | 机制 | 可靠性 |
|----------|------|--------|
| Backoffice → Portal | Portal 通过 30 秒轮询 `GET /api/config/kyc-system` | 中（有延迟） |
| Config 变更 → 历史记录 | 文件系统写入 `kyc-config-history/` | 低（无原子性） |
| Config 变更 → 缓存失效 | `invalidateCache()` + 5 秒 TTL | 中 |
| 地区开关 → 开户流程 | 实时读取 `region.enabled` | 高 |

**关键缺陷**：
1. Portal 的 30 秒轮询在高并发下会对文件系统造成压力
2. 无分布式缓存（如 Redis），多实例部署时缓存不一致
3. 配置回滚功能未完整实现（`rollbackToVersion` 仅标记版本号）

### 6.4 KYC 状态流转

设计的状态流转（来自工作记忆）：
```
not_started → document_uploaded → ocr_processing → ocr_completed → 
liveness_pending → liveness_completed → personal_info_pending → 
personal_info_completed → agreement_pending → submitted → 
under_review → approved / rejected
```

**现实**：当前没有任何 API 实现该状态机。所有状态为硬编码或 Mock。

---

## 七、后端架构改进建议

### 7.1 短期（1-2 周）

1. **修复安全漏洞**
   - [ ] 移除 `JWT_SECRET` 硬编码回退，强制从环境变量读取
   - [ ] 为所有 Backoffice API 添加管理员权限中间件
   - [ ] 修复 Portal KYC 权限检查，从 Session/Cookie 获取 userId
   - [ ] 将 `public/data/` 移到 `src/data/` 或 `data/`（项目根目录），禁止公开访问

2. **统一配置系统**
   - [ ] 删除 `/api/config/kyc` 的兼容层（已 deprecated）
   - [ ] 清理 `public/data/kyc-config.json` 和 `kyc-config-migration-report.json`

3. **补充认证持久化**
   - [ ] 新增 `SupplementalKYCRequest` Prisma 模型
   - [ ] 将 `SupplementalKYCService` 的内存 Map 替换为数据库查询

### 7.2 中期（1-2 月）

4. **KYC 核心数据模型**
   - [ ] 新增 Prisma 模型：`KYCRecord`、`KYCApplication`、`KYCReviewLog`、`KYCDocument`
   - [ ] 实现真实的 KYC 状态机 API（status、submit、ocr、liveness）
   - [ ] 接入真实 eKYC 服务商（OCR + 活体检测 + AML）

5. **Backoffice RBAC**
   - [ ] 新增 `Role`、`Permission`、`Staff` Prisma 模型
   - [ ] 实现统一的权限中间件 `requirePermission(...)`
   - [ ] 替换所有 Mock 数据为数据库查询

6. **API 标准化**
   - [ ] 统一响应格式（目前部分返回 `{ success, data }`，部分返回 `{ users, total }`）
   - [ ] 统一错误处理（目前部分用 `zod` 校验，部分手写）
   - [ ] 添加全局 Rate Limiting（`@upstash/ratelimit` 或 `next-rate-limit`）

### 7.3 长期（3-6 月）

7. **数据库迁移**
   - [ ] 评估从 SQLite 迁移到 PostgreSQL（生产环境必需）
   - [ ] 设计完整的经纪商业务模型（TradingAccount、Order、Position、Wallet、Transaction）
   - [ ] 对接 MT4/MT5 Manager API 或桥接服务

8. **缓存与性能**
   - [ ] 引入 Redis 作为配置缓存和分布式锁
   - [ ] KYC 配置使用发布/订阅机制替代轮询
   - [ ] 添加 API 响应缓存（如 `unstable_cache`）

9. **可观测性**
   - [ ] 添加结构化日志（Winston / Pino）
   - [ ] API 性能监控（Vercel Analytics 或自建）
   - [ ] 错误追踪（Sentry）

---

## 八、附录

### 8.1 API 路由完整清单

| # | 路由 | 方法 | 类型 | 认证 | 说明 |
|---|------|------|------|------|------|
| 1 | `/api/auth/login` | POST | 真实 | 否 | JWT Cookie |
| 2 | `/api/auth/register` | POST | 真实 | 否 | zod 校验 |
| 3 | `/api/auth/logout` | POST | 真实 | 否 | 清除 Cookie |
| 4 | `/api/auth/me` | GET | 真实 | Cookie | 当前用户 |
| 5 | `/api/auth/verify-email` | POST | 真实 | Token | 邮箱验证 |
| 6 | `/api/auth/invite/accept` | POST | 真实 | Token | 接受邀请 |
| 7 | `/api/auth/validate-tenant-access` | POST | 真实 | Cookie | 租户访问验证 |
| 8 | `/api/products` | GET | 真实 | 否 | 产品列表 |
| 9 | `/api/apps` | GET | 真实 | Cookie | 应用市场 |
| 10 | `/api/apps/[id]/install` | POST | 真实 | Cookie | 安装应用 |
| 11 | `/api/apps/[id]/uninstall` | POST | 真实 | Cookie | 卸载应用 |
| 12 | `/api/tenant/apps` | GET | 真实 | Cookie | 租户应用 |
| 13 | `/api/onboarding` | GET/POST | 真实 | Cookie | 租户入驻流程 |
| 14 | `/api/onboarding/complete` | POST | 真实 | Cookie | 完成入驻 |
| 15 | `/api/console/tenants` | GET/POST | 真实 | Cookie | 租户管理 |
| 16 | `/api/console/tenants/[id]` | GET/PATCH/DELETE | 真实 | Cookie | 租户详情 |
| 17 | `/api/console/tenants/[id]/features` | GET/PUT | 真实 | Cookie | 租户功能 |
| 18 | `/api/console/tenants/[id]/invite` | POST | 真实 | Cookie | 邀请成员 |
| 19 | `/api/console/tenants/[id]/subscribe` | POST | 真实 | Cookie | 订阅产品 |
| 20 | `/api/console/billing` | GET | 真实 | Cookie | 账单 |
| 21 | `/api/console/billing/pay` | POST | 真实 | Cookie | 支付 |
| 22 | `/api/console/products` | GET | 真实 | Cookie | 控制台产品 |
| 23 | `/api/admin/users` | GET/PATCH | 真实 | Cookie | 用户管理 |
| 24 | `/api/admin/metrics` | GET | 真实 | Cookie | 平台指标 |
| 25 | `/api/admin/licenses` | GET | 真实 | Cookie | 许可证 |
| 26 | `/api/admin/audit-logs` | GET | 真实 | Cookie | 审计日志 |
| 27 | `/api/backoffice/dashboard` | GET | 真实 | Cookie | 仪表盘 |
| 28 | `/api/backoffice/kyc/review` | GET/POST | **Mock** | **无** | KYC 审核 |
| 29 | `/api/backoffice/kyc/supplemental` | GET/POST | **Mock** | **无** | 补充认证审核 |
| 30 | `/api/backoffice/kyc/supplemental/[id]` | GET | **Mock** | **无** | 补充认证详情 |
| 31 | `/api/backoffice/kyc/document-expiry` | GET/POST | **Mock** | **无** | 证件过期检查 |
| 32 | `/api/backoffice/users/[id]/kyc` | GET | **Mock** | **无** | 用户 KYC 详情 |
| 33 | `/api/kyc/config` | GET | 配置 | 否 | KYC 配置（旧） |
| 34 | `/api/kyc/ocr` | POST | **Mock** | **无** | OCR 识别 |
| 35 | `/api/kyc/ocr/confirm` | POST | **Mock** | **无** | OCR 确认 |
| 36 | `/api/kyc/liveness` | POST | **Mock** | **无** | 活体检测 |
| 37 | `/api/kyc/status` | GET | **Mock** | **无** | KYC 状态 |
| 38 | `/api/kyc/submit` | POST | **Mock** | **无** | KYC 提交 |
| 39 | `/api/portal/kyc/check-permission` | GET | **Mock** | **Header** | 权限检查 |
| 40 | `/api/portal/kyc/complete-supplemental` | POST | **Mock** | **无** | 完成补充认证 |
| 41 | `/api/portal/kyc/supplemental-requirements` | GET | **Mock** | **无** | 补充要求 |
| 42 | `/api/config/kyc` | GET/PUT | 配置 | 否 | KYC 配置兼容层 |
| 43 | `/api/config/kyc/toggle` | POST | 配置 | 否 | 切换开关 |
| 44 | `/api/config/kyc/history` | GET | 配置 | 否 | 配置历史 |
| 45 | `/api/config/kyc-system` | GET/PUT/POST | 配置 | 否 | 统一配置 |
| 46 | `/api/config/kyc-system/toggle` | POST | 配置 | 否 | 切换开关 |
| 47 | `/api/config/kyc-system/history` | GET | 配置 | 否 | 历史版本 |
| 48 | `/api/config/kyc-system/regions/[code]` | GET/PUT/PATCH/DELETE | 配置 | 否 | 地区配置 |

### 8.2 文件哈希（用于基线对比）

```
# 关键文件 SHA-256（供后续审计对比）
# 可使用以下命令生成：
# find src/app/api src/lib backoffice prisma -name "*.ts" -o -name "*.prisma" | sort | xargs shasum -a 256
```

---

*报告结束。建议团队优先处理 P0 安全问题和 KYC 核心数据持久化，再逐步推进 Mock 数据迁移。*
