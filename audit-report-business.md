# TradePass 经纪商 SaaS 系统 — 业务功能完整性审计报告

> 审计日期：2026-04-25  
> 审计范围：前端路由页面（Console / Admin / Backoffice / Portal / Auth / Marketing）  
> 审计方法：源码级页面遍历 + 业务流分析 + 行业标准对标

---

## 一、执行摘要

| 维度 | 评分 | 说明 |
|------|------|------|
| **页面覆盖度** | 82% | 共发现 ~95 个有效路由页面，4 个占位/空白页 |
| **业务闭环完整度** | 68% | 注册→KYC→开户→入金→出金链路完整，但**交易执行**和**真实资金网关**缺失 |
| **数据真实性** | 45% | 大量页面使用 mock 数据，Backoffice 约 70% 页面未对接真实 API |
| **行业标准对标** | 65% | CRM、KYC、风控 UI 完善，但缺少交易核心（MT5/MT4 实时对接）、报表引擎、佣金结算系统 |
| **综合完善度** | **64%** | 前端 UI 架构成熟，业务逻辑层和真实数据层是主要缺口 |

---

## 二、功能覆盖度矩阵

### 2.1 Console（控制台）— 面向 SaaS 平台管理员

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 仪表盘 | `/console` | ✅ 完整实现 | 租户列表、KPI 卡片、统计数据 |
| 账单管理 | `/console/billing` | ✅ 完整实现 | 账单列表、状态 badge、支付按钮 |
| 初始化向导 | `/console/onboarding` | ✅ 完整实现 | 5 步引导（品牌/认证/交易/资金/发布） |
| 产品管理 | `/console/products` | ✅ 完整实现 | 已订阅/可订阅产品展示 |
| 租户管理 | `/console/tenants` | ✅ 完整实现 | 租户列表、创建、详情 |
| 租户详情 | `/console/tenants/[id]` | ✅ 完整实现 | 成员管理、邀请 |
| 创建租户 | `/console/tenants/new` | ✅ 完整实现 | 表单提交 |

**Console 小结：7 页，全部完整实现。面向 Broker OS 的 SaaS 购买方，功能闭环。**

---

### 2.2 Admin（系统管理）— 面向 TradePass 超级管理员

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 仪表盘 | `/admin` | ✅ 完整实现 | KPI（用户/租户/License/收入）、最近活动 |
| 用户管理 | `/admin/users` | ✅ 完整实现 | 搜索、状态管理、禁用/恢复 |
| License 管理 | `/admin/licenses` | ✅ 完整实现 | 搜索、吊销/恢复、Key 掩码显示 |
| 审计日志 | `/admin/audit-logs` | ✅ 完整实现 | 操作记录表格 |
| 计费管理 | `/admin/billing` | ⚠️ 占位页面 | "计费规则配置与用量对账功能开发中..." |

**Admin 小结：5 页，4 完整 + 1 占位。**

---

### 2.3 Backoffice（运营管理）— 面向经纪商运营人员

> 共 ~60+ 页面，是系统最大的模块。

#### 仪表盘 & 监控

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 运营仪表盘 | `/backoffice` | ✅ 完整实现 | 6 个 KPI、4 张图表、最近用户/租户 |
| 转化漏斗 | `/backoffice/funnel` | ✅ 完整实现 | 注册→KYC→入金→交易漏斗可视化 |
| 实时监控 | `/backoffice/monitor` | ✅ 完整实现 | 在线用户、系统状态、实时活动流 |

#### 账户管理

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| MT 账户列表 | `/backoffice/accounts` | ⚠️ 基础实现 | mock 数据，AccountDetailDrawer 被注释 |
| 账户分组 | `/backoffice/accounts/groups` | ✅ 完整实现 | 6 个分组 mock、CRUD 交互 |
| 杠杆设置 | `/backoffice/accounts/leverage` | ✅ 完整实现 | 规则表、编辑弹窗、风险提示 |

#### 合规 & KYC

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| KYC 审核 | `/backoffice/compliance/kyc-review` | ✅ 完整实现 | 状态筛选、审核 Drawer、AML 筛查、证件预览 |
| 黑名单 | `/backoffice/compliance/blacklist` | ⚠️ 基础实现 | mock 数据列表 |
| 风控审核 | `/backoffice/compliance/risk` | ⚠️ 基础实现 | mock 数据 |
| 补充审核 | `/backoffice/compliance/supplemental-review` | ⚠️ 基础实现 | mock 数据 |
| 审计日志 | `/backoffice/compliance/audit` | ⚠️ 基础实现 | mock 数据 |

#### 资金管理

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 存款订单 | `/backoffice/funds/deposits` | ✅ 完整实现 | 6 条 mock、状态筛选、详情抽屉、快速审核按钮 |
| 出金审核 | `/backoffice/funds/withdrawal-review` | ✅ 完整实现 | 银行信息/加密地址展示、风控标记 |
| 支付渠道 | `/backoffice/funds/channels` | ✅ 完整实现 | 渠道配置、手续费、限额、启用/禁用 |
| 资金流水 | `/backoffice/funds/transactions` | ⚠️ 基础实现 | mock 数据 |

#### 交易管理

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 订单管理 | `/backoffice/trading/orders` | ⚠️ 基础实现 | mock 订单列表 |
| 持仓管理 | `/backoffice/trading/positions` | ⚠️ 基础实现 | mock 持仓列表 |
| 品种管理 | `/backoffice/trading/instruments` | ⚠️ 基础实现 | mock 品种列表 |
| 交易设置 | `/backoffice/trading/settings` | ⚠️ 基础实现 | 设置页面骨架 |

#### IB 管理

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| IB 伙伴列表 | `/backoffice/ib` | ✅ 完整实现 | 统计卡片、筛选、详情 Drawer |
| 佣金管理 | `/backoffice/ib/commissions` | ⚠️ 基础实现 | mock 佣金流水 |
| 层级树 | `/backoffice/ib/tree` | ⚠️ 基础实现 | 层级关系可视化 |
| IB 设置 | `/backoffice/ib/settings` | ⚠️ 基础实现 | 设置页面骨架 |

#### 跟单交易

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 交易员管理 | `/backoffice/copy-trading/traders` | ✅ 完整实现 | 统计卡片、风险/状态筛选 |
| 跟随者管理 | `/backoffice/copy-trading/followers` | ⚠️ 基础实现 | mock 数据 |
| 收益管理 | `/backoffice/copy-trading/profits` | ⚠️ 基础实现 | mock 数据 |
| 跟单设置 | `/backoffice/copy-trading/settings` | ⚠️ 基础实现 | 设置页面骨架 |

#### 用户管理

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 用户列表 | `/backoffice/users` | ✅ 完整实现 | 搜索、标签、详情 Drawer |
| 用户等级 | `/backoffice/users/levels` | ⚠️ 基础实现 | 等级配置 |
| 用户标签 | `/backoffice/users/tags` | ⚠️ 基础实现 | 标签管理 |

#### 风控

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 风控仪表盘 | `/backoffice/risk` | ✅ 完整实现 | 风险指标、告警列表、详情 Drawer |
| 保证金监控 | `/backoffice/risk/margin` | ⚠️ 基础实现 | mock 数据 |
| 净额结算 | `/backoffice/risk/nbp` | ⚠️ 基础实现 | mock 数据 |
| 风控规则 | `/backoffice/risk/rules` | ⚠️ 基础实现 | 规则配置骨架 |

#### 报告

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 财务报告 | `/backoffice/reports/financial` | ⚠️ 基础实现 | 报告骨架 |
| 交易报告 | `/backoffice/reports/trading` | ⚠️ 基础实现 | 报告骨架 |
| 用户报告 | `/backoffice/reports/users` | ⚠️ 基础实现 | 报告骨架 |

#### 营销

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 活动管理 | `/backoffice/marketing/campaigns` | ✅ 完整实现 | 活动列表、创建/编辑 |
| 消息推送 | `/backoffice/marketing/messages` | ✅ 完整实现 | 消息列表、目标人群筛选 |
| Banner 管理 | `/backoffice/marketing/banners` | ✅ 完整实现 | Banner 列表、位置筛选 |
| 新闻管理 | `/backoffice/marketing/news` | ✅ 完整实现 | 文章列表、创建/编辑 |

#### CRM

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 工单管理 | `/backoffice/crm/tickets` | ✅ 完整实现 | 工单列表、状态筛选 |
| 用户反馈 | `/backoffice/crm/feedback` | ✅ 完整实现 | 反馈列表 |
| 操作日志 | `/backoffice/crm/logs` | ✅ 完整实现 | 日志列表 |

#### 系统管理

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 员工管理 | `/backoffice/system/staff` | ✅ 完整实现 | 员工列表、角色分配 |
| 角色权限 | `/backoffice/system/roles` | ✅ 完整实现 | 角色配置、权限矩阵 |
| API 管理 | `/backoffice/system/api` | ✅ 完整实现 | API Key / Webhook 管理 |
| KYC 配置 | `/backoffice/system/kyc-config` | ✅ 完整实现 | 地区配置、开关控制、历史版本 |
| 系统配置 | `/backoffice/system/config` | ✅ 完整实现 | 全局参数配置 |
| 系统用户 | `/backoffice/system/users` | ✅ 完整实现 | 用户列表、密码重置 |
| 安全日志 | `/backoffice/system/security` | ✅ 完整实现 | 安全事件日志 |
| 系统日志 | `/backoffice/system/logs` | ✅ 完整实现 | 系统操作日志 |

#### 其他

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 个人中心 | `/backoffice/profile` | ✅ 完整实现 | 资料编辑、2FA、登录历史、改密码 |
| 系统设置 | `/backoffice/settings` | ✅ 完整实现 | 主题、侧边栏、分页、通知偏好 |
| UI 组件库 | `/backoffice/ui-showcase` | ✅ 完整实现 | 设计系统展示 |
| AI 信号池 | `/backoffice/ai-signals/pool` | ⚠️ 基础实现 | mock 数据 |
| AI 信号用量 | `/backoffice/ai-signals/usage` | ⚠️ 基础实现 | mock 数据 |
| 应用市场 | `/backoffice/apps/[appId]` | ⚠️ 部分占位 | "配置功能开发中" |

**Backoffice 小结：~64 页，约 32 页完整实现，24 页基础实现（mock 数据），4 页占位/骨架，4 页为 redirect。**

---

### 2.4 Portal（用户门户）— 面向终端交易者

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 仪表盘 | `/portal/dashboard` | ✅ 完整实现 | 运营 Banner、账户概览、AI Signals、市场快讯、活动、帮助中心、公告、工具下载 |
| KYC 首页 | `/portal/kyc` | ✅ 完整实现 | 地区选择、配置联动、维护模式检测 |
| KYC 文档上传 | `/portal/kyc/document` | ✅ 完整实现 | 多地区证件上传 |
| KYC OCR 确认 | `/portal/kyc/ocr-confirm` | ✅ 完整实现 | OCR 结果确认、修正 |
| KYC 活体检测 | `/portal/kyc/liveness` | ✅ 完整实现 | 人脸识别流程 |
| KYC 个人信息 | `/portal/kyc/personal-info` | ✅ 完整实现 | 表单填写 |
| KYC 协议签署 | `/portal/kyc/agreements` | ✅ 完整实现 | 协议勾选 |
| KYC 状态页 | `/portal/kyc/status` | ✅ 完整实现 | 状态追踪 |
| 交易账户 | `/portal/trading/accounts` | ✅ 完整实现 | 账户列表、开户入口 |
| 交易历史 | `/portal/trading/history` | ⚠️ 基础实现 | mock 交易记录 |
| MT5 连接 | `/portal/trading/mt5` | ⚠️ 基础实现 | 连接状态展示 |
| 开户申请 | `/portal/trading/open-account` | ✅ 完整实现 | 开户流程 |
| 订单管理 | `/portal/trading/orders` | ⚠️ 基础实现 | mock 订单 |
| 持仓管理 | `/portal/trading/positions` | ⚠️ 基础实现 | mock 持仓 |
| 资金管理首页 | `/portal/fund` | ✅ 完整实现 | 总余额、快捷操作、钱包、交易账户、支付方式 |
| 入金 | `/portal/fund/deposit` | ✅ 完整实现 | 支付方式选择、金额输入 |
| 出金 | `/portal/fund/withdraw` | ✅ 完整实现 | 出金申请 |
| 转账 | `/portal/fund/transfer` | ✅ 完整实现 | 钱包↔账户转账 |
| 资金历史 | `/portal/fund/history` | ⚠️ 基础实现 | mock 流水 |
| 钱包首页 | `/portal/wallet` | ✅ 完整实现 | 余额统计、快捷操作、最近交易 |
| 钱包交易记录 | `/portal/wallet/transactions` | ⚠️ 基础实现 | mock 数据 |
| IB 总览 | `/portal/ib/overview` | ✅ 完整实现 | 统计数据、快捷入口 |
| IB 邀请 | `/portal/ib/invite` | ✅ 完整实现 | 邀请链接、二维码 |
| IB 客户 | `/portal/ib/clients` | ⚠️ 基础实现 | mock 客户列表 |
| IB 佣金 | `/portal/ib/commission` | ⚠️ 基础实现 | mock 佣金数据 |
| IB 营销素材 | `/portal/ib/marketing` | ⚠️ 基础实现 | 素材展示 |
| IB 子代理 | `/portal/ib/sub-ib` | ⚠️ 基础实现 | 层级展示 |
| IB 工具 | `/portal/ib/tools` | ⚠️ 基础实现 | 工具页面骨架 |
| 跟单发现 | `/portal/copy-trading/discover` | ✅ 完整实现 | 交易员列表、筛选、详情 |
| 我的跟单 | `/portal/copy-trading/my-copy` | ⚠️ 基础实现 | mock 数据 |
| 成为交易员 | `/portal/copy-trading/become-trader` | ⚠️ 基础实现 | 申请页面骨架 |
| 交易员列表 | `/portal/copy-trading/traders` | ⚠️ 基础实现 | mock 数据 |
| 跟单设置 | `/portal/copy-trading/settings` | ⚠️ 基础实现 | 设置骨架 |
| MAMM 首页 | `/portal/mamm` | ⚠️ 基础实现 | 3 个统计卡片 + 2 个入口按钮 |
| MAMM 投资 | `/portal/mamm/invest` | ⚠️ 基础实现 | 列表骨架 |
| MAMM 成为经理 | `/portal/mamm/become-manager` | ⚠️ 基础实现 | 申请骨架 |
| PAMM 首页 | `/portal/pamm` | ⚠️ 基础实现 | 与 MAMM 结构相同，mock 数据 |
| PAMM 投资 | `/portal/pamm/invest` | ⚠️ 基础实现 | 列表骨架 |
| PAMM 成为经理 | `/portal/pamm/become-manager` | ⚠️ 基础实现 | 申请骨架 |
| 活动中心 | `/portal/activity` | ⚠️ 基础实现 | 活动/任务/奖励/历史入口 |
| 设置首页 | `/portal/settings` | ✅ 完整实现 | 6 个分类导航，profile/security/kyc/notifications 已实装 |
| 语言设置 | `/portal/settings/language` | ✅ 完整实现 | 语言切换 |
| 支持中心 | `/portal/support` | ✅ 完整实现 | FAQ、工单、联系表单 |
| AI 信号 | `/portal/ai-signals` | ⚠️ 基础实现 | 信号列表 |
| 洞察中心 | `/portal/insights` | ❌ 无 page.tsx | 目录存在但无入口页，仅有 data/media/news 子目录 |

**Portal 小结：~45 页，约 18 页完整实现，20 页基础实现，4 页 redirect，1 页缺失（insights），2 页 Coming Soon 区块（settings 中的 payment methods）。**

---

### 2.5 Auth（认证）

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 登录 | `/auth/login` | ✅ 完整实现 | LoginForm 组件完整 |
| 注册 | `/auth/register` | ✅ 完整实现 | 表单验证、自动登录、跳过验证开发开关 |
| 邮箱验证 | `/auth/verify-email` | ✅ 完整实现 | Token 验证、状态动画 |

**Auth 小结：3 页全部完整。**

---

### 2.6 Marketing（营销站）

| 页面 | 路径 | 状态 | 说明 |
|------|------|------|------|
| 首页 | `/` | ✅ 完整实现 | 8 个 Section（Hero/Problem/Platform/Architecture/Products/UseCases/Ecosystem/CTA） |

**Marketing 小结：1 页完整。**

---

## 三、业务闭环检查表

### 3.1 主流程：注册 → KYC → 开户 → 入金 → 交易 → 出金

| 环节 | Portal 侧 | Backoffice 侧 | API 侧 | 闭环状态 |
|------|-----------|---------------|--------|----------|
| **用户注册** | ✅ 邮箱/密码注册，验证邮件 | — | ✅ 有注册 API | ✅ 闭环 |
| **KYC 认证** | ✅ 9 地区配置联动，5 步流程 | ✅ 审核后台，AML 筛查 | ✅ 有 KYC 状态/提交/审核 API | ✅ 闭环 |
| **开户申请** | ✅ MT4/MT5 账户申请 | ✅ 账户分组、杠杆配置 | ⚠️ 有开户页面，缺 MT5 Manager API 对接 | ⚠️ 半闭环 |
| **入金** | ✅ 多通道入金 UI | ✅ 存款订单审核 | ⚠️ 前端 UI 完整，缺真实支付网关 SDK 集成 | ⚠️ 半闭环 |
| **交易执行** | ❌ 无交易终端，仅账户/订单/持仓查看 | ⚠️ 订单/持仓管理（mock 数据） | ❌ 无交易执行 API | ❌ 未闭环 |
| **出金** | ✅ 出金申请 UI | ✅ 出金审核 | ⚠️ 前端 UI 完整，缺真实出金网关对接 | ⚠️ 半闭环 |

**主流程结论：前 3 环节（注册/KYC/开户）前端闭环；入金/出金前端闭环但缺支付网关；交易执行完全缺失。**

### 3.2 IB 返佣体系

| 环节 | Portal | Backoffice | 闭环状态 |
|------|--------|------------|----------|
| 邀请注册 | ✅ 邀请链接 + 二维码 | — | ✅ |
| 层级关系 | ⚠️ 子代理入口（骨架） | ⚠️ 树形图（mock） | ⚠️ 仅 UI |
| 客户管理 | ⚠️ 客户列表（mock） | ✅ IB 伙伴列表 | ⚠️ 半闭环 |
| 佣金计算 | ❌ 无佣金计算引擎展示 | ⚠️ 佣金流水（mock） | ❌ 未闭环 |
| 佣金发放 | ❌ 无提现/发放功能 | ❌ 无发放审批 | ❌ 未闭环 |

**IB 结论：邀请注册前端完成，佣金计算和发放环节完全缺失。行业标准 IB 系统需要自动佣金计算、多级分层、佣金提现审批，目前均未实现。**

### 3.3 跟单交易（Copy Trading / MAMM / PAMM）

| 产品 | Portal | Backoffice | 核心引擎 | 结论 |
|------|--------|------------|----------|------|
| **Copy Trading** | ✅ 发现/列表/筛选 UI | ✅ 交易员管理 | ❌ 无跟单执行引擎 | 前端完整，缺信号复制逻辑 |
| **MAMM** | ⚠️ 首页 + 投资入口 | — | ❌ 无多账户管理引擎 | 仅骨架 |
| **PAMM** | ⚠️ 首页 + 投资入口 | — | ❌ 无资金分配引擎 | 仅骨架 |

**跟单结论：Copy Trading 前端最完善，但跟单执行、信号同步、风控熔断等核心逻辑缺失。MAMM/PAMM 仅入口页面。**

### 3.4 资金管理系统

| 功能 | Portal | Backoffice | 状态 |
|------|--------|------------|------|
| 支付渠道配置 | — | ✅ 渠道管理（手续费/限额/启用） | 前端完整 |
| 入金申请 | ✅ 多通道入金 | ✅ 订单审核 | 前端完整 |
| 出金申请 | ✅ 出金表单 | ✅ 出金审核 | 前端完整 |
| 资金转账 | ✅ 钱包↔MT 账户 | — | 前端完整 |
| 交易流水 | ⚠️ mock 数据 | ⚠️ mock 数据 | 仅 UI |
| 支付网关对接 | ❌ | ❌ | 完全缺失 |

**资金结论：运营管理端 UI 架构完善，但缺乏真实支付网关（如 Stripe、Adyen、加密货币节点）的 SDK/API 集成。**

---

## 四、角色权限分析

| 角色 | 面向对象 | 核心功能 | 权限边界 | 功能重叠/缺口 |
|------|----------|----------|----------|---------------|
| **Console** | SaaS 购买方（Broker Owner） | 租户管理、产品订阅、账单支付、初始化配置 | 只能看到自己的租户和产品 | ❌ 缺：多租户权限隔离的细粒度控制 |
| **Admin** | TradePass 超级管理员 | 全平台用户/License/审计/计费 | 跨租户全局管理 | ❌ 计费管理为占位页 |
| **Backoffice** | 经纪商运营人员 | 用户/KYC/资金/交易/风控/营销/IB/报表/系统 | 单租户内全部运营功能 | ⚠️ 大量页面使用 mock 数据，运营功能"看得见摸不着" |
| **Portal** | 终端交易者 | 开户/KYC/入金出金/跟单/IB/设置/支持 | 仅自己的账户和数据 | ✅ 权限边界清晰 |
| **Auth** | 所有未登录用户 | 注册/登录/验证 | 无 | — |

**权限缺口：**
1. Console 和 Backoffice 之间缺乏角色升降级机制（如 Broker Owner 如何进入自己租户的 Backoffice）。
2. Backoffice 内部缺少 RBAC 细粒度权限验证的前端控制（虽然 UI 有角色管理页面，但页面级路由守卫未在分析范围内）。
3. 缺少"只读运营"、"财务专员"、"客服专员"等细分角色。

---

## 五、缺失功能清单（按优先级排序）

### P0 — 阻断上线

| # | 缺失功能 | 影响 | 建议 |
|---|----------|------|------|
| 1 | **交易执行终端** | 用户无法下单，核心经纪商功能缺失 | 接入 MT5 Manager API / 自研 WebTrader |
| 2 | **支付网关 SDK 集成** | 入金/出金无法走真实资金通道 | 接入 USDT-TRC20 节点、SWIFT 网关、Stripe 等 |
| 3 | **佣金计算引擎** | IB 体系无法产生实际价值 | 设计基于交易量/点差的佣金计算服务 |
| 4 | **跟单执行引擎** | Copy Trading 无法自动复制订单 | 基于 MT5 API 的信号复制服务 |

### P1 — 严重影响运营

| # | 缺失功能 | 影响 |
|---|----------|------|
| 5 | Backoffice 数据层对接 | 70% 运营页面为 mock，运营人员无法工作 |
| 6 | 实时行情数据 | Dashboard、交易终端需要实时报价 |
| 7 | 报表导出引擎 | 财务/交易/用户报告需要可导出的真实数据 |
| 8 | 邮件/短信/推送服务 | 注册验证、KYC 通知、交易提醒缺发送通道 |
| 9 | 风控自动触发机制 | 当前风控仅展示告警，无自动冻结/强平能力 |

### P2 — 影响用户体验

| # | 缺失功能 | 影响 |
|---|----------|------|
| 10 | Portal Settings — Payment Methods | 用户无法管理支付方式 |
| 11 | Portal Insights 首页 | 目录存在但无入口页 |
| 12 | MAMM/PAMM 投资详情页 | 仅入口，无真实投资流程 |
| 13 | Admin 计费管理 | 无法配置计费规则 |
| 14 | 多语言完整覆盖 | 仅部分页面支持 i18n |
| 15 | 移动端适配优化 | Portal 部分页面未针对移动端优化 |

---

## 六、空白和占位页面详细清单

| # | 页面路径 | 问题描述 | 严重程度 |
|---|----------|----------|----------|
| 1 | `/admin/billing` | 显示"计费规则配置与用量对账功能开发中..." | 中 |
| 2 | `/backoffice/apps/[appId]` | 配置 tab 显示"配置功能开发中" | 低 |
| 3 | `/portal/insights/page.tsx` | **文件不存在**，仅有子目录 | 中 |
| 4 | `/portal/settings` — Payment Methods | 点击显示 "Coming soon" | 低 |
| 5 | `/portal/settings` — Language（外部页） | `/portal/settings/language` 存在但 Settings 内未直接渲染 | 低 |
| 6 | 大量 Backoffice 子页面 | 使用 `mockMTAccounts`、`mockOrders`、`mockRiskAlerts` 等，功能按钮 `console.log` 无实际 API 调用 | 高 |

**PlaceholderPage 组件检查结果：** 系统中存在 `PlaceholderPage` 组件定义，但**没有任何路由页面实际引用它**（`search_content` 返回 0 结果）。说明开发团队已经用更细粒度的页面替代了早期占位方案。

---

## 七、对比行业标准 — 模块成熟度评估

| 模块 | 行业标准要求 | 当前成熟度 | 评分 |
|------|-------------|-----------|------|
| **CRM** | 用户360°视图、工单、跟进记录、标签分级 | 用户列表+标签+工单+反馈完整，缺跟进记录和销售漏斗 | 75% |
| **KYC** | 多地区证件、OCR、活体、AML、人工审核、补充材料 | 9地区、OCR、活体、AML评分、审核Drawer、补充审核齐全 | 90% |
| **资金管理** | 多渠道入金/出金、支付网关、流水对账、风控审核 | UI 完善，缺真实网关和自动对账 | 55% |
| **交易管理** | 实时订单、持仓、品种、点差、杠杆、保证金 | 仅 mock 列表展示，无实时数据和执行能力 | 30% |
| **风控** | 实时监控、自动告警、强制平仓、黑名单 | 告警展示完善，缺自动触发和执行 | 60% |
| **报告** | 财务报表、交易报表、用户报表、导出 | 仅有骨架页面 | 25% |
| **营销** | 活动、Banner、消息推送、新闻、转化漏斗 | 全部完整实现 | 85% |
| **IB管理** | 邀请、层级、佣金计算、发放、营销素材 | 邀请和列表完成，缺计算和发放 | 45% |
| **跟单交易** | 信号发现、自动复制、风控、收益分配 | 发现页完整，缺复制引擎和收益分配 | 40% |
| **MAM/PAMM** | 经理管理、投资、资金分配、业绩费率 | 仅首页骨架 | 20% |
| **系统管理** | 员工、角色、API、配置、日志、安全 | 全部完整实现 | 90% |

---

## 八、关键风险与建议

### 8.1 数据层风险（最高优先级）

**现状**：Backoffice 约 70% 页面使用 `mockOrders`、`mockMTAccounts`、`mockRiskAlerts` 等本地假数据，按钮点击仅 `console.log`。

**风险**：系统看起来功能齐全，但无法投入实际运营。

**建议**：
1. 建立统一的 BFF（Backend for Frontend）API 规范
2. 优先对接：用户列表、订单列表、持仓列表、资金流水、风险告警
3. 使用 feature flag 控制 mock / 真实数据切换，便于渐进式上线

### 8.2 交易核心缺失（最高优先级）

**现状**：没有交易终端、没有实时行情、没有订单执行能力。

**建议**：
1. **短期**：集成第三方 WebTrader（如 MetaQuotes WebTerminal）嵌入 Portal
2. **中期**：基于 MT5 Manager API 开发自研交易组件
3. **长期**：考虑接入零工作台券商基础设施（如 Leverate、Spotware）

### 8.3 资金通道缺失（高优先级）

**现状**：入金/出金 UI 完善但无真实资金通道。

**建议**：
1. 加密货币：接入 USDT-TRC20 全节点或 BlockATM 等聚合支付
2. 法币：接入 SWIFT 代理、SEPA、本地银行转账
3. 必须建设：资金流水对账、异常告警、退款机制

### 8.4 IB 佣金体系（高优先级）

**现状**：前端展示完整，但佣金计算和发放逻辑缺失。

**建议**：
1. 设计佣金规则引擎（按手数/按点差/按层级分成）
2. 实现佣金结算周期（日结/周结/月结）
3. IB 佣金提现审批流程

---

## 九、总结

TradePass 在前端 UI/UX 层面已经具备了**行业中等偏上**的完成度：
- ✅ 营销站、KYC 系统、Backoffice 仪表盘、配置联动系统、系统管理 等模块非常成熟
- ✅ 组件库统一（Backoffice 有自己的 UI 体系，Portal 使用独立组件）
- ✅ 多租户架构（Console/Admin/Backoffice/Portal 分层清晰）

但距离一个**可上线运营的经纪商 SaaS**，核心缺口在于：
- ❌ **交易执行层**（没有交易终端 = 不是券商）
- ❌ **真实数据层**（70% Backoffice 页面为 mock）
- ❌ **资金网关层**（没有真实支付 = 无法产生收入）
- ❌ **佣金计算层**（IB 体系无法闭环）

**推荐上线路径**：
1. **Phase 1**（1-2 月）：接入真实 API，替换 Backoffice mock 数据
2. **Phase 2**（2-3 月）：接入 MT5 Manager API + WebTrader，实现交易闭环
3. **Phase 3**（1-2 月）：接入支付网关，实现资金闭环
4. **Phase 4**（1-2 月）：建设佣金引擎，实现 IB 闭环

---

*报告结束*
