# TradePass SaaS - Product Specification

> Version: 1.0.0-draft  
> Status: 待确认  
> Last Updated: 2026-04-17

---

## 1. 背景与目标 (WHY)

### 1.1 业务目标
将 TradePass 从单一部署系统升级为 **SaaS 化产品平台**，让全球的中小型外汇经纪商（Broker）能够自助注册、按需订阅、开通租户，管理自己的业务系统（Portal + Backoffice + Trading Infra）。

### 1.2 核心价值主张
- **降低获客门槛**：从销售驱动的大客户模式，转向产品驱动的自助式订阅。
- **缩短交付周期**：从数周部署缩短到分钟级租户开通。
- **创造经常性收入（MRR/ARR）**：按租户数、用户数、产品模块计量计费。

### 1.3 目标用户
- 中小型外汇经纪商（已有牌照或准备开展业务）
- 金融科技创业团队
- 现有 Broker 的分支/子品牌运营方

### 1.4 成功指标 (North Star Metrics)
| 指标 | 目标值 | 说明 |
|---|---|---|
| 注册转化率 | > 15% | 访问官网并完成邮箱验证 |
| 30 天租户激活率 | > 40% | 注册后 30 天内创建至少 1 个租户 |
| 付费转化率 | > 8% | 产生首张账单的注册用户占比 |
| NPS | > 30 | 季度用户满意度调研 |

---

## 2. 产品架构

```
┌─────────────────────────────────────────────────────────┐
│                    TradePass SaaS                        │
├─────────────────────────────────────────────────────────┤
│  1. 官网 (Marketing Site)                                 │
│     - 产品介绍 / 定价 / 注册 / 登录                        │
├─────────────────────────────────────────────────────────┤
│  2. 用户控制台 (Console)  /console                        │
│     - 租户管理 (Create / List / Settings / Members)      │
│     - 产品管理 (Subscribe / Upgrade / Feature toggles)   │
│     - 账单管理 (Invoices / Payment methods / Usage)      │
├─────────────────────────────────────────────────────────┤
│  3. 业务管理后台 (TradePass Admin)                        │
│     - User 管理 (KYC / 审核 / 禁用)                      │
│     - License 管理 (分配 / 回收 / 批量操作)               │
│     - 计量计费 (Usage metering / Billing rules / 对账)    │
├─────────────────────────────────────────────────────────┤
│  4. 产品引擎层（按租户隔离）                               │
│     ├─ Growth Engine                                     │
│     ├─ Broker OS (Portal + Backoffice + App)            │
│     ├─ Trade Engine (Risk + LP + Margin)                │
│     └─ Trading Engine (Terminal + Social + API)         │
└─────────────────────────────────────────────────────────┘
```

---

## 3. 模块详细定义

### 3.1 官网 Website

| 页面 | 功能 | 优先级 |
|---|---|---|
| 首页 (/) | 价值主张、四大产品卡片、客户案例、CTA | P0 |
| 定价页 (/pricing) | 按产品/按租户阶梯定价、对比表 | P0 |
| 注册页 (/auth/register) | 邮箱/手机号注册、企业信息收集、邮箱验证 | P0 |
| 登录页 (/auth/login) | 邮箱+密码、2FA、忘记密码、SSO 预留 | P0 |
| 文档中心 (/docs) | 开发者文档、API 文档、帮助中心 | P1 |

### 3.2 用户控制台 Console (`/console`)

#### 3.2.1 租户管理

**租户列表页**
- 展示字段：租户名称、Logo、状态（Active / Suspended / Trial）、创建时间、到期时间、操作
- 操作：进入详情、升级套餐、续费、删除（仅限 Owner）

**创建租户**
- 步骤 1：填写租户名称、选择行业、选择数据中心区域
- 步骤 2：选择初始订阅产品包（MVP 阶段默认 Broker OS Starter）
- 步骤 3：确认开通，系统生成 `tenant_id` 并下发 License

**租户详情页**
- **基本信息**：名称、Logo、域名白名单、时区、语言、联系地址
- **员工管理**：
  - 邀请成员（邮箱 + 角色）
  - 角色定义：Owner（唯一）、Admin、Operator、Viewer
  - 操作：移除成员、转让 Owner
- **权限管理**：模块级权限矩阵（如 Admin 可访问全部，Viewer 仅可读）

#### 3.2.2 产品管理

**已订阅产品**
- 四大产品线卡片：Growth Engine / Broker OS / Trade Engine / Trading Engine
- 每个卡片显示：订阅状态、当前版本、到期时间、用量进度条

**功能开关 (Feature Toggles)**
- Broker OS 子模块：Portal / Backoffice / Mobile App / KYC / Funds / Trading Accounts
- Growth Engine 子模块：CDP / Marketing Automation / Ad Analytics / Promotion
- Trade Engine 子模块：Risk Engine / LP Management / Margin Management

**配额管理**
- 用户数上限（Seats）
- API QPS / 日调用量
- 存储容量（附件、日志）

#### 3.2.3 账单管理

**账单列表**
- 字段：账单周期、金额（USD / USDT / CNY）、状态、操作（下载 PDF / 支付）
- 状态：待支付 (Pending)、已支付 (Paid)、逾期 (Overdue)、已取消 (Cancelled)

**支付方式**
- 信用卡（Stripe）
- 银行转账（生成汇款单）
- 加密货币（USDT-TRC20 / USDT-ERC20）

**用量报表**
- 按租户维度：活跃用户、API 调用、存储、交易流水
- 按产品维度：各产品模块的配额使用率

### 3.3 业务管理后台 (TradePass Admin)

#### 3.3.1 User 管理
- 用户列表：注册时间、邮箱、KYC 状态、所属租户数、账号状态
- 操作：查看详情、审核 KYC、冻结账号、重置密码、模拟登录（Impersonate）

#### 3.3.2 License 管理
- License 生成：绑定 `tenant_id` + `product_id` + `expiry_date` + `features`
- 批量操作：批量续期、批量停用、批量导出
- 版本映射：License Version → 产品功能清单

#### 3.3.3 计量计费引擎
- **计费规则配置**：
  - 按固定月费（Per Tenant）
  - 按用户数（Per Seat）
  - 按用量（Per Usage：API 调用、存储、交易流水）
  - 混合计费（Base Fee + Overage）
- **用量数据采集**：
  - 每日从各产品引擎聚合用量数据
  - 异常用量告警（如突增 10 倍）
- **优惠与折扣**：
  - 优惠码（Promo Code）：百分比折扣 / 固定金额减免
  - 年度预付折扣（年付 85 折）

---

## 4. 核心用户旅程

```
1. 访客访问官网 → 浏览产品 → 点击「免费试用」
2. 注册页：填写邮箱、密码、企业名称 → 发送验证邮件
3. 邮箱验证 → 自动登录 → 进入 Console 仪表盘
4. 引导创建第一个租户 → 选择数据中心 → 选择订阅产品
5. 开通试用（14 天免费 / ¥500 试用额度）
6. 进入租户详情 → 邀请员工 → 分配权限
7. 系统下发 License → 用户获得 Portal / Backoffice 访问地址
8. 月末 / 试用到期前 3 天生成账单 → 支付 or 自动扣款
9. TradePass Admin 监控平台收入、用量、活跃用户
```

---

## 5. 待确认的关键决策

在细化 API 和进入开发前，需要确认以下问题：

| # | 问题 | 当前建议方案 |
|---|---|---|
| 1 | **租户隔离模式** | 共享数据库 + `tenant_id` Row-Level 隔离（成本与速度最优），核心配置表独立 Schema |
| 2 | **MVP 首发产品** | 仅上架 **Broker OS**（Portal + Backoffice），其余三款产品后续迭代接入 |
| 3 | **计费模式** | 混合计费：Base Fee（按租户固定月费）+ Per Seat（超出基础用户数后按人头） |
| 4 | **技术栈复用** | Console 和 Admin 复用现有 Next.js + TypeScript + Tailwind 技术栈；新增多租户中间层和 License 服务 |
| 5 | **部署架构** | Console / Admin / 官网 共用一套 Next.js App（按路由拆分），产品引擎保持独立部署，通过 API + License 校验接入 |

---

## 6. 非目标 (Non-Goals)

- MVP 阶段不支持白标定制（White-label）
- MVP 阶段不支持私有化部署（On-premise）
- MVP 阶段不支持多级分销 / 代理商体系
- 不改造现有 Broker OS 的单租户业务逻辑，通过中间层适配多租户

---

## 7. 风险与假设

| 风险 | 缓解措施 |
|---|---|
| 现有代码耦合度高，多租户改造困难 | 采用「适配层」模式，尽量不侵入现有业务代码 |
| 自助注册引入垃圾账号 | 邮箱验证 + 企业信息必填 + 人工审核开关 |
| 跨国支付合规风险 | 首阶段仅支持 Stripe + 加密货币，银行转账作为 Manual Invoice |
| 租户数据隔离安全性 | 所有查询强制带 `tenant_id` 过滤，数据库层加 RLS 策略 |

---

*文档状态：Draft，待研发计划对齐后进入 Frozen 状态。*
