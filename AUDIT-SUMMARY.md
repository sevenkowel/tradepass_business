# TradePass 经纪商 SaaS 系统 — 综合审计报告

> 审计日期：2026-04-25
> 审计团队：5 人并行分析（前端 / 后端 / 业务 / 安全 / 工程化）
> 项目版本：v1.7.0
> 代码规模：449 个源文件（305 TSX + 144 TS）/ 167 个路由页面

---

## 一、总体评分雷达图

| 维度 | 评分 | 权重 | 加权 | 状态 |
|------|------|------|------|------|
| 前端 UI/UX | 7.0 / 10 | 20% | 1.40 | 🟡 良好 |
| 业务功能完整度 | 6.4 / 10 | 25% | 1.60 | 🟡 及格 |
| 后端 API / 数据层 | 5.5 / 10 | 20% | 1.10 | 🔴 薄弱 |
| 安全合规 | 5.0 / 10 | 20% | 1.00 | 🔴 薄弱 |
| 工程化 / DevOps | 5.1 / 10 | 15% | 0.76 | 🔴 薄弱 |
| **综合评分** | — | — | **5.86 / 10** | 🔴 **C 级** |

**一句话总结：UI 面子很足，里子（数据层、安全、交易核心）还很虚。**

---

## 二、五大维度核心发现

### 2.1 前端架构 — 7.0/10（良好，但有严重债务）

**优势：**
- 167 个页面全部有 UI 实现，无空白占位
- 组件库体系完整（Backoffice 自建 + Portal shadcn）
- KYC 配置联动系统（Backoffice ↔ Portal 30秒轮询）设计精巧
- 主题切换（亮/暗/系统）已落地

**致命问题：**
| 问题 | 影响 |
|------|------|
| **两套 UI 组件体系并存** | Backoffice 自建 Button/Card/PageHeader 与 Portal 的 shadcn 完全割裂，维护双倍成本 |
| **50+ 页面硬编码 Mock 数据** | 无法投产，数据与 UI 逻辑深度耦合 |
| **16 个超大型页面（>500行）** | kyc-config (57KB)、deposit (55KB)、kyc-review (34KB) 等，不可维护 |
| **28 处 `as any` + 2 处 `as never`** | 类型安全形同虚设 |
| **113+ 处 `console.log` 残留** | 调试代码进生产 |
| **93 个页面（56%）滥用 `"use client"`** | 纯展示页面无需客户端渲染，破坏 SSR 性能 |

### 2.2 后端 API — 5.5/10（数据层严重缺失）

**优势：**
- Auth / Console / Admin / Apps 等 SaaS 核心模块 API 全部真实（Prisma + SQLite）
- KYC 配置系统有完整的验证、版本历史、差异对比、回滚功能

**致命问题：**
| 问题 | 影响 |
|------|------|
| **Prisma Schema 仅 13 个模型，全部缺失经纪商核心业务模型** | KYCRecord、MTAccount、Order、Position、Wallet、Transaction、IBPartner 等均不存在 |
| **KYC / Portal KYC / Backoffice KYC 审核 全部 Mock** | 12 个 API 路由纯 Mock，含 OCR（随机置信度）、活体（90%通过）、审核（硬编码28条记录） |
| **Mock 数据总量 ~89KB，深度耦合在 UI 逻辑中** | 25+ 页面/组件依赖，迁移工作量巨大 |
| **补充认证使用内存 Map 存储** | 服务重启数据全丢 |
| **KYC 配置双系统并存** | 旧 `/api/config/kyc` 与新 `/api/config/kyc-system` 并存，增加维护负担 |

### 2.3 业务功能 — 6.4/10（UI 闭环，业务未闭环）

**功能覆盖度矩阵：**

| 模块 | 成熟度 | 核心问题 |
|------|--------|----------|
| **KYC** | 90% | 前端最完善，但审核 API 全 Mock |
| **系统管理** | 90% | 员工/角色/配置/日志全部真实 |
| **营销** | 85% | 活动/Banner/消息/新闻完整 |
| **CRM** | 75% | 工单/反馈/日志完整，缺销售漏斗 |
| **资金管理** | 55% | UI 完善，缺真实支付网关 |
| **风控** | 60% | 告警展示完善，缺自动触发 |
| **IB 管理** | 45% | 邀请完成，佣金计算+发放缺失 |
| **跟单交易** | 40% | 发现页完整，缺复制引擎 |
| **交易管理** | 30% | 仅 Mock 列表，无交易终端 |
| **报告** | 25% | 仅有骨架页面 |
| **MAM/PAMM** | 20% | 仅首页骨架 |

**四大未闭环业务：**
1. **交易执行** — 没有交易终端 = 不是券商
2. **资金通道** — 没有支付网关 = 无法产生收入
3. **佣金结算** — IB 体系无法产生价值
4. **真实数据层** — 70% Backoffice 页面为 Mock

### 2.4 安全合规 — 5.0/10（存在可被直接利用的漏洞）

**可被直接利用的漏洞（生产环境）：**

| 漏洞 | 利用方式 | 严重性 |
|------|----------|--------|
| **注册绕过邮箱验证** | `POST /api/auth/register` 传 `"skipVerification": true` | 🔴 严重 |
| **JWT 伪造（条件性）** | 若未配 `JWT_SECRET`，用硬编码密钥 `"tradepass-dev-secret-change-in-production"` 签发 Token | 🔴 严重 |
| **KYC 强制通过** | `POST /api/kyc/submit` 加 `X-Mock-Review-Force: approved` header | 🔴 严重 |
| **越权审核 KYC** | 任何登录用户均可调用 `POST /api/backoffice/kyc/review` | 🔴 严重 |
| **Portal 权限伪造** | `GET /api/portal/kyc/check-permission` 读取 `x-user-id` header | 🔴 严重 |

**合规重大缺口：**
- ❌ 无交易监控系统（TMS）— 受监管经纪商致命缺口
- ❌ 无 SAR/CTR 报告机制
- ❌ 无制裁名单实时筛查（OFAC/UN/EU）
- ❌ 无持续客户尽职调查（OCDD）
- ❌ Risk Lock 体系仅为设计概念，未落地代码

### 2.5 工程化 — 5.1/10（基础薄弱）

**关键缺口：**

| 项目 | 状态 |
|------|------|
| Dockerfile / docker-compose | ❌ 不存在 |
| CI/CD (GitHub Actions) | ❌ 不存在 |
| 单元测试 | ❌ 0 个 |
| 组件测试 | ❌ 0 个 |
| E2E 测试 | 🟡 7 个 Playwright spec |
| Bundle Analyzer | ❌ 未配置 |
| Git Hooks | ❌ 不存在 |
| `.env.example` | ❌ 不存在 |
| 多环境配置 | ❌ 不存在 |

**性能问题：**
- 最大路由 JS 1,370KB（未压缩），几乎所有路由 > 500KB
- 构建输出 834MB（异常庞大）
- 仅 9 处动态导入（`next/dynamic`），recharts/framer-motion 全量打包

---

## 三、问题优先级总览

### 🔴 P0 — 阻断上线（安全 + 核心功能）

| # | 问题 | 负责维度 | 修复建议 |
|---|------|----------|----------|
| 1 | 注册绕过邮箱验证 | 安全 | 删除 `skipVerification` 参数 |
| 2 | JWT_SECRET 硬编码回退 | 安全 | 启动时强制校验环境变量，为空则拒绝启动 |
| 3 | KYC Mock Header 可操纵审核结果 | 安全 | Middleware / 网关层丢弃所有 `X-Mock-*` headers |
| 4 | Backoffice API 无角色校验 | 安全 | 统一权限中间件 `requirePermission()` |
| 5 | Portal 权限检查用可伪造 Header | 安全 | 从 Session/Cookie 获取 userId |
| 6 | Prisma Schema 缺失核心业务模型 | 后端 | 设计 KYC/Account/Order/Wallet/Transaction 模型 |
| 7 | 交易执行终端缺失 | 业务 | 接入 MT5 Manager API 或第三方 WebTrader |
| 8 | 支付网关缺失 | 业务 | 接入 USDT 节点 / Stripe / SWIFT 网关 |

### 🟡 P1 — 严重影响（1 个月内）

| # | 问题 | 负责维度 |
|---|------|----------|
| 9 | 两套 UI 组件体系并存 | 前端 |
| 10 | 50+ 页面硬编码 Mock 数据 | 前端+后端 |
| 11 | 16 个超大型页面需拆分 | 前端 |
| 12 | KYC 审核 API 全 Mock → 需真实实现 | 后端 |
| 13 | 补充认证内存存储 → 需数据库持久化 | 后端 |
| 14 | 28 处 `as any` 类型逃逸 | 前端 |
| 15 | 113+ 处 `console.log` 残留 | 前端 |
| 16 | 引入 CSRF 保护 + 幂等性键 | 安全 |
| 17 | 黑名单实时拦截注册/登录/出入金 | 安全 |
| 18 | 无交易监控系统（TMS） | 合规 |
| 19 | 无 Dockerfile / CI/CD | 工程化 |
| 20 | 无单元测试 / 组件测试 | 工程化 |

### 🟢 P2 — 优化项（2-3 个月）

| # | 问题 |
|---|------|
| 21 | 佣金计算引擎 |
| 22 | 跟单执行引擎 |
| 23 | 报表导出引擎 |
| 24 | 实时行情数据接入 |
| 25 | 邮件/短信/推送服务 |
| 26 | 国际化完整覆盖（next-intl 已安装但未配置）|
| 27 | Bundle 体积优化（动态导入、tree-shaking）|
| 28 | 从 SQLite 迁移到 PostgreSQL |

---

## 四、推荐上线路径

### Phase 1：安全加固（2 周）
- 修复 5 个 P0 安全漏洞
- API 层过滤 Mock Headers
- Backoffice API 增加角色校验中间件

### Phase 2：数据层建设（1-2 月）
- 设计完整 Prisma Schema（KYC/Account/Order/Wallet/Transaction/IB）
- 将 KYC 审核、补充认证迁移到真实数据库
- 建立统一 BFF API 规范，替换 Backoffice Mock 数据

### Phase 3：交易核心（2-3 月）
- 接入 MT5 Manager API
- 嵌入 WebTrader 或自研交易组件
- 实现实时行情推送

### Phase 4：资金闭环（1-2 月）
- 接入 USDT-TRC20 节点
- 接入法币支付网关
- 资金流水对账系统

### Phase 5：工程化（并行）
- Dockerfile + docker-compose
- GitHub Actions CI/CD
- Vitest + React Testing Library
- Bundle Analyzer + 性能优化

---

## 五、各维度详细报告

- [前端架构审计报告](./audit-report-frontend.md)
- [后端 API 审计报告](./audit-report-backend.md)
- [业务功能审计报告](./audit-report-business.md)
- [安全合规审计报告](./audit-report-security.md)
- [工程化审计报告](./audit-report-devops.md)

---

*报告生成时间：2026-04-25*
*审计团队：frontend-audit / backend-audit / business-audit / security-audit / devops-audit*
