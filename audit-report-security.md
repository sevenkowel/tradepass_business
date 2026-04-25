# TradePass 安全合规审计报告

**审计日期**: 2026-04-25  
**审计范围**: KYC 系统、风控体系、资金安全、认证授权、开发工具风险、合规覆盖度  
**审计员**: security-audit (tradepass-audit team)  
**版本**: v1.0

---

## 1. 执行摘要

TradePass 是一个面向外汇保证金交易的经纪商 SaaS 系统，覆盖 Console / Admin / Backoffice / Portal 四个前端层级，支持 9 个地区的 KYC 开户流程。本审计基于源码静态分析，发现了 **5 项高风险**、**9 项中风险**、**6 项低风险**安全问题。核心风险集中在：认证层硬编码密钥、注册接口可绕过邮箱验证、API 层缺乏角色校验、KYC 审核可被 Mock Header 干预，以及反洗钱与交易监控体系的实质性缺失。

---

## 2. 安全风险评估

### 2.1 高风险（Critical / High）

| 编号 | 风险项 | 位置 | 影响 |
|------|--------|------|------|
| H1 | **JWT_SECRET 存在硬编码回退值** | `src/lib/auth.ts:4` | 若生产环境未设置 `JWT_SECRET`，将使用 `"tradepass-dev-secret-change-in-production"`，攻击者可伪造任意用户 Token |
| H2 | **注册接口允许跳过邮箱验证** | `src/app/api/auth/register/route.ts:36` | `skipVerification` 参数可直接将用户状态设为 `active`，绕过注册验证流程，存在被批量注册/滥用的风险 |
| H3 | **KYC 审核 API 可被 Mock Header 强制结果** | `src/app/api/kyc/submit/route.ts:24` | 请求中携带 `X-Mock-Review-Force` header 可强制 approved/rejected 结果，当前服务端**未限制开发环境**
| H4 | **Backoffice KYC 审核 API 无角色校验** | `src/app/api/backoffice/kyc/review/route.ts:315` | `adminId` 硬编码为 `"admin_current"`，未从 Session 获取，也未校验调用者是否具备合规审核权限 |
| H5 | **全局缺乏 CSRF / 防重放保护** | 全站 API | 所有 POST/PUT/DELETE API 均未校验 CSRF Token，也无幂等性键（Idempotency Key），存在跨站请求伪造和重复提交风险 |

### 2.2 中风险（Medium）

| 编号 | 风险项 | 位置 | 影响 |
|------|--------|------|------|
| M1 | **Session 仅依赖客户端 Cookie，无服务端失效机制** | `src/lib/session.ts` | Token 7 天有效期间无法强制吊销；用户修改密码后旧 Token 仍然有效 |
| M2 | **2FA 仅为前端实现，登录流程未强制校验** | `src/lib/backoffice/twofa-utils.ts` | TOTP 工具函数完整，但登录 API (`/api/auth/login`) 未检查 2FA，Backoffice 也未强制开启 2FA |
| M3 | **KYC 数据持久化在 localStorage** | `src/lib/kyc/store.ts:174` | Zustand persist 将 KYC 状态（含 OCR 结果、个人信息）写入 localStorage，存在 XSS 场景下数据泄露风险 |
| M4 | **Mock 配置通过 localStorage 跨会话保留** | `src/lib/kyc/dev-mock-config.ts:47` | `kyc-mock-config` 存储在 localStorage，即使开发工具 UI 被隐藏，恶意用户仍可通过直接修改 localStorage 注入 Mock Headers |
| M5 | **OCR / Liveness API 接受 Mock 控制 Header** | `src/app/api/kyc/ocr/route.ts:35` | 生产环境若未在网关层过滤 `X-Mock-*` headers，用户可模拟 OCR 失败或任意置信度 |
| M6 | **密码哈希轮数偏低** | `src/lib/auth.ts:7` | `bcrypt.hash(password, 10)` 的 cost factor 为 10，在现代硬件下建议提升至 12 |
| M7 | **审核日志 API 无权限校验** | `src/app/api/admin/audit-logs/route.ts` | 任何持有有效 Token 的用户均可查询全量审计日志 |
| M8 | **Portal 权限检查使用硬编码用户 ID** | `src/app/api/portal/kyc/check-permission/route.ts:44` | `userId` 取自 `x-user-id` header 并回退到 `"user-001"`，未从 Session 验证 |
| M9 | **Cookie sameSite 为 lax** | `src/app/api/auth/login/route.ts:55` | 在 iframe 嵌套场景下存在被利用的风险，建议对敏感路由使用 `sameSite=strict` |

### 2.3 低风险（Low）

| 编号 | 风险项 | 位置 | 影响 |
|------|--------|------|------|
| L1 | **DevToolbox 在预发布/测试环境可能暴露** | `src/components/portal/layout/PortalShell.tsx:36` | 仅通过 `NODE_ENV !== "production"` 判断，若 staging 环境为 development build，则工具箱可见 |
| L2 | **KYC DevPanel 提供 OTP 跳过开关** | `src/components/dev-tools/KYCDevPanel.tsx:802` | `skipOtpVerification` 和预验证手机号/邮箱功能仅用于开发，但配置写入 localStorage |
| L3 | **地区配置回退到越南 (VN)** | `src/lib/kyc/region-config.ts:405` | `getDefaultRegionConfig()` 硬编码返回越南配置，异常场景下可能导致错误地区适用 |
| L4 | **备份码哈希为模拟实现** | `src/lib/backoffice/twofa-utils.ts:131` | `hashBackupCode` 使用简单字符串拼接而非 bcrypt/argon2，若后端直接复用此逻辑则不安全 |
| L5 | **KYC 补充认证服务使用内存存储** | `src/lib/kyc/supplemental-service.ts:42` | `supplementalRequestsStore` 为内存 Map，服务重启后数据丢失，生产环境需迁移至数据库 |
| L6 | **验证 Token 使用 Math.random() 生成** | `src/lib/auth.ts:23` | `generateVerificationToken()` 使用 `Math.random()` + `Date.now()`，熵值不足，建议使用 `crypto.randomUUID()` 或 `crypto.randomBytes` |

---

## 3. 合规覆盖度检查表

### 3.1 反洗钱（AML）

| 要求项 | 状态 | 说明 |
|--------|------|------|
| 客户身份识别（CDD） | ⚠️ 部分 | KYC 流程收集姓名、证件、地址、PEP/制裁声明，但缺乏**地址证明**的文件上传与核验（仅 IN/AE/FR/ES 要求） |
| 增强尽职调查（EDD） | ❌ 缺失 | 高风险客户（PEP、高净值、高风险国家）无独立的 EDD 流程 |
| 制裁名单筛查 | ⚠️ 部分 | `blacklist` 页面支持 entity 类型黑名单，但无实时 OFAC/UN/EU 名单自动对接 |
| 可疑交易报告（STR/SAR） | ❌ 缺失 | 无 SAR  filing 工作流，无报告编号与监管机构提交流程 |
| 持续监控 | ❌ 缺失 | 无交易行为基线建模，无自动风险评分再计算机制 |
| 客户风险评级 | ⚠️ 部分 | KYC 审核记录中有 `amlRiskScore` 和 `riskLevel` 字段，但评分逻辑为 Mock |

### 3.2 了解客户（KYC）

| 要求项 | 状态 | 说明 |
|--------|------|------|
| 多地区配置 | ✅ 已覆盖 | 9 地区（VN/TH/IN/AE/KR/JP/FR/ES/BR）均有独立配置 |
| 多等级配置 | ✅ 已覆盖 | Basic / Standard / Enhanced 三等级，字段与证件要求差异化 |
| 证件 OCR | ✅ 已覆盖 | 接入 OCR 接口，支持置信度校验 |
| 活体检测 | ✅ 已覆盖 | Liveness 为必需步骤，支持视频录制与动作检测 |
| 人工审核 | ✅ 已覆盖 | Backoffice KYC Review 页面支持 approve/reject/request_info/start_review |
| 补充认证 | ✅ 已覆盖 | Supplemental KYC 支持 6 种触发类型（document_expiry/risk_control/aml_compliance/large_withdrawal/tier_upgrade/manual_review） |
| 适合性评估 | ⚠️ 部分 | 收集了投资经验、风险承受能力、财务状况，但无**适合性匹配引擎**判断产品是否适合客户 |

### 3.3 交易监控

| 要求项 | 状态 | 说明 |
|--------|------|------|
| 实时交易监控 | ❌ 缺失 | Risk Rules 页面仅展示 Mock 规则，无实际规则引擎 |
| 异常交易检测 | ❌ 缺失 | 无 Layering、Wash Trading、Pump & Dump 等模式检测 |
| 大额交易报告 | ❌ 缺失 | 无大额交易（CTR）自动报告机制 |
| 同 IP / 设备多账户检测 | ⚠️ 部分 | 黑名单支持 IP/Device 类型，但无实时注册/登录时的自动关联检测 |

### 3.4 风险披露

| 要求项 | 状态 | 说明 |
|--------|------|------|
| 风险披露协议 | ✅ 已覆盖 | KYC 流程包含协议签署步骤，有 `Risk Disclosure` 协议模板 |
| 杠杆风险声明 | ⚠️ 部分 | 协议文本中有风险披露，但无**逐笔交易前的动态风险确认** |
| 负余额保护声明 | ⚠️ 部分 | NBP 页面存在，但无面向客户的自动赔付承诺与条款 |

### 3.5 投诉处理

| 要求项 | 状态 | 说明 |
|--------|------|------|
| 投诉工单系统 | ✅ 已覆盖 | CRM → Tickets 模块支持投诉工单创建、分配、处理 |
| 投诉分类与 SLA | ⚠️ 部分 | 有工单状态流转，但无明确的 SLA 计时与升级机制 |
| 监管投诉报告 | ❌ 缺失 | 无按监管机构要求的投诉汇总与上报功能 |

### 3.6 数据保护与隐私

| 要求项 | 状态 | 说明 |
|--------|------|------|
| 数据加密传输 | ✅ 已覆盖 | Cookie 设置 `secure` flag（生产环境） |
| 数据加密存储 | ⚠️ 部分 | 密码使用 bcrypt，但 KYC 证件图片 URL 为明文存储 |
| GDPR 合规声明 | ✅ 已覆盖 | KYC 页面底部有 "符合 GDPR 规范存储" 的声明文本 |
| 数据留存策略 | ❌ 缺失 | 无自动数据过期清理与归档策略 |

---

## 4. 风控体系评估

### 4.1 风控规则引擎

- **现状**: Backoffice `/risk/rules` 页面以表格形式展示 6 条 Mock 规则（大额入金、异常交易频率、同 IP 多账户、负余额预警、出金账户不一致、制裁名单筛查）。
- **问题**: 规则仅为展示数据，无实际执行引擎；无规则优先级、阈值动态调整、A/B 测试能力；无规则命中率的统计分析。
- **风险**: 规则与实际交易/资金系统脱节，风控流于形式。

### 4.2 保证金预警（Margin Alerts）

- **现状**: `/risk/margin` 页面展示 Mock 预警数据，包含 margin_call / stop_out / near_liquidation 三种类型。
- **问题**: 未与 MT5/交易核心对接，无实时净值推送；预警处理依赖人工记录，无自动强平接口。
- **风险**: 市场剧烈波动时无法自动触发止损，可能导致穿仓风险扩大。

### 4.3 负余额保护（NBP）

- **现状**: `/risk/nbp` 页面展示索赔申请流程，支持 pending / approved / rejected / processing 状态。
- **问题**: NBP 为事后审批制，非实时账户层面的余额兜底；无自动将负余额清零的交易核心逻辑。
- **风险**: 客户账户穿仓后需人工审核赔付，响应慢，不符合欧盟 ESMA 对 NBP 的实时性要求。

### 4.4 黑名单系统

- **现状**: `/compliance/blacklist` 支持 5 种类型（user/ip/device/email/entity），有 active/expired/removed 状态与到期时间。
- **问题**: 黑名单为独立表，未与注册/登录/出入金 API 做实时拦截校验；无与外部制裁名单（OFAC、UN、EU）的自动同步。
- **风险**: 已被拉黑的用户仍可通过 API 正常完成注册或交易，直到人工发现。

### 4.5 风控锁（Risk Lock）

- **现状**: 工作记忆中提到 `src/lib/risk-lock.tsx` 的设计（密码修改 24h、2FA 关闭 48h、地址修改 24h、陌生设备 1h、大额提现 2h），但源码中**未找到该文件的实际实现**。
- **问题**: Risk Lock 体系仅为设计概念，未落地到代码；Portal Account Center 中引用的 `RiskLockBanner` / `RiskLockModal` 组件也**未在源码中发现**。
- **风险**: 敏感操作后无冷却期保护，账户被盗后可立即修改密码并出金。

---

## 5. 关键风险点清单

### 5.1 生产环境可直接利用的漏洞

1. **注册绕过验证**: 调用 `POST /api/auth/register` 时传入 `"skipVerification": true` 即可跳过邮箱验证直接获得有效 Token。
2. **JWT 伪造（条件性）**: 若服务器未配置 `JWT_SECRET`，使用已知硬编码密钥 `"tradepass-dev-secret-change-in-production"` 可签发任意用户 Token。
3. **KYC 结果操纵**: 向 `/api/kyc/submit` 发送 `X-Mock-Review-Force: approved` header 可强制通过 KYC 审核。
4. **越权审核 KYC**: 任何登录用户均可调用 `POST /api/backoffice/kyc/review` 执行 approve/reject，无需合规角色。

### 5.2 架构层面缺陷

1. **前端 Mock 与生产边界模糊**: 大量 API 路由（KYC OCR、Liveness、Review、Backoffice Dashboard）混合了 Mock 逻辑与真实逻辑，通过 Header 切换，生产环境若未在网关层拦截 Mock Headers，则可直接触发模拟行为。
2. **权限体系前端化**: RBAC 角色数据（`mock-roles.ts`）完整，但 API 层未实施权限校验，所有权限控制依赖前端 UI 隐藏。
3. **审计日志不完整**: 仅 `/api/admin/audit-logs` 查询真实数据库，Backoffice 的 Compliance Audit 页面使用独立 Mock 数据，两者未打通。

### 5.3 合规层面重大缺口

1. **无交易监控系统（TMS）**: 作为受监管经纪商，缺乏实时交易监控是致命合规缺口。
2. **无 SAR/CTR 报告机制**: 无法生成可疑活动报告与货币交易报告。
3. **无持续客户尽职调查（OCDD）**: 客户开户后无定期复评机制。
4. **无制裁名单实时筛查**: 依赖手动维护黑名单，无法对接 OFAC、HMT、UN 等官方名单。

---

## 6. 整改建议（按优先级）

### P0 - 立即处理（1 周内）

| 编号 | 整改项 | 具体措施 |
|------|--------|----------|
| P0-1 | **移除注册接口 skipVerification** | 删除 `register/route.ts` 中的 `skipVerification` 参数，所有注册必须走邮箱验证流程 |
| P0-2 | **强制生产环境 JWT_SECRET** | 在应用启动时校验 `JWT_SECRET` 环境变量，若为默认值或空，则拒绝启动 |
| P0-3 | **API 层过滤 Mock Headers** | 在 Middleware 或 API Gateway 层拦截并丢弃所有 `X-Mock-*` headers，禁止其进入生产业务逻辑 |
| P0-4 | **为 Backoffice API 增加角色校验** | 所有 `/api/backoffice/*` 和 `/api/admin/*` 路由必须校验用户角色，拒绝无权限访问 |

### P1 - 短期处理（1 个月内）

| 编号 | 整改项 | 具体措施 |
|------|--------|----------|
| P1-1 | **引入 CSRF 保护** | 为所有状态变更 API（POST/PUT/DELETE）添加 CSRF Token 校验，或改用 `sameSite=strict` + 自定义 header |
| P1-2 | **引入幂等性键** | 出入金、KYC 提交等关键接口增加 `Idempotency-Key` 支持，防止重复提交 |
| P1-3 | **实现服务端 Session 失效** | 建立 Token 黑名单/Redis 会话表，支持密码修改、角色变更、异常检测后的强制登出 |
| P1-4 | **强制 Backoffice 2FA** | 所有 Backoffice 管理员账户强制启用 TOTP 2FA，登录 API 增加 2FA 校验步骤 |
| P1-5 | **提升 bcrypt cost factor** | 将 `bcrypt.hash(password, 10)` 提升至 12，并制定密码策略（最小长度、复杂度、过期周期） |
| P1-6 | **黑名单实时拦截** | 在注册、登录、出入金 API 中增加黑名单实时查询，命中即拒绝并记录 |

### P2 - 中期建设（1-3 个月）

| 编号 | 整改项 | 具体措施 |
|------|--------|----------|
| P2-1 | **建设交易监控系统（TMS）** | 引入实时交易流分析，支持异常模式检测（Layering、Wash Trading、价格操纵） |
| P2-2 | **制裁名单自动对接** | 对接 OFAC、UN、EU 制裁名单 API，每日自动同步并触发存量客户回溯筛查 |
| P2-3 | **实现 SAR/CTR 工作流** | 建立可疑活动报告生成、审核、编号、提交给监管机构的完整工作流 |
| P2-4 | **Risk Lock 体系落地** | 实现敏感操作后的风控锁（密码修改 24h、2FA 关闭 48h、地址修改 24h、陌生设备 1h、大额提现 2h） |
| P2-5 | **KYC 数据加密存储** | 证件图片、OCR 结果、个人信息等敏感数据加密存储（AES-256），localStorage 仅保留非敏感状态 |
| P2-6 | **NBP 实时兜底** | 在交易核心层面实现负余额自动清零，而非依赖事后审批 |

### P3 - 长期优化（3-6 个月）

| 编号 | 整改项 | 具体措施 |
|------|--------|----------|
| P3-1 | **统一审计日志体系** | 所有管理操作（KYC 审核、出入金审批、配置变更）写入统一的不可篡改审计日志 |
| P3-2 | **适合性评估引擎** | 基于客户财务状况、投资经验、风险承受能力，自动判断是否可向客户推荐特定杠杆/产品 |
| P3-3 | **持续客户尽职调查（OCDD）** | 建立客户风险评级定期复评机制（高风险每 6 个月、中风险每 12 个月、低风险每 24 个月） |
| P3-4 | **数据留存与自动清理** | 根据 GDPR/当地法规要求，制定数据保留期限与自动匿名化/删除策略 |
| P3-5 | **安全事件响应预案** | 制定数据泄露、账户大规模入侵、制裁名单命中等重大事件的响应流程与上报机制 |

---

## 7. 附录：审计文件清单

| 文件路径 | 审计重点 |
|----------|----------|
| `src/middleware.ts` | 路由保护、Cookie 设置 |
| `src/lib/auth.ts` | JWT 签名、密码哈希、Token 生成 |
| `src/lib/session.ts` | Session 获取、用户状态校验 |
| `src/lib/kyc/types.ts` | KYC 数据模型、状态流转 |
| `src/lib/kyc/region-config.ts` | 9 地区配置、证件要求 |
| `src/lib/kyc/store.ts` | KYC 前端状态、localStorage 持久化 |
| `src/lib/kyc/supplemental-service.ts` | 补充认证业务逻辑 |
| `src/lib/kyc/supplemental-types.ts` | 补充认证类型定义 |
| `src/lib/kyc/dev-mock-config.ts` | Mock 配置存储 |
| `src/lib/kyc/dev-fetch.ts` | Mock Header 注入 |
| `src/lib/backoffice/mock-roles.ts` | RBAC 角色与权限定义 |
| `src/lib/backoffice/twofa-utils.ts` | TOTP/备份码工具函数 |
| `src/lib/dev-config.tsx` | 开发者配置、OTP 跳过开关 |
| `src/app/api/auth/login/route.ts` | 登录认证、Cookie 设置 |
| `src/app/api/auth/register/route.ts` | 注册流程、skipVerification |
| `src/app/api/kyc/submit/route.ts` | KYC 提交、Mock Header 处理 |
| `src/app/api/kyc/ocr/route.ts` | OCR 接口、Mock 控制 |
| `src/app/api/backoffice/kyc/review/route.ts` | KYC 审核 API、角色校验缺失 |
| `src/app/api/portal/kyc/check-permission/route.ts` | 权限检查、硬编码 userId |
| `src/app/api/admin/audit-logs/route.ts` | 审计日志查询、无权限校验 |
| `src/components/dev-tools/FloatingDevToolbox.tsx` | 开发工具箱渲染条件 |
| `src/components/dev-tools/KYCDevPanel.tsx` | Mock 控制、OTP 跳过 |
| `src/components/portal/layout/PortalShell.tsx` | DevToolbox 环境判断 |
| `src/app/backoffice/compliance/kyc-review/page.tsx` | KYC 审核前端 |
| `src/app/backoffice/compliance/supplemental-review/page.tsx` | 补充认证审核前端 |
| `src/app/backoffice/compliance/blacklist/page.tsx` | 黑名单管理 |
| `src/app/backoffice/compliance/audit/page.tsx` | 审计日志前端 |
| `src/app/backoffice/risk/rules/page.tsx` | 风控规则展示 |
| `src/app/backoffice/risk/margin/page.tsx` | 保证金预警展示 |
| `src/app/backoffice/risk/nbp/page.tsx` | 负余额保护展示 |
| `src/app/backoffice/funds/deposits/page.tsx` | 入金管理 |
| `src/app/backoffice/funds/withdrawal-review/page.tsx` | 出金审批 |
| `src/app/backoffice/funds/channels/page.tsx` | 支付渠道管理 |
| `src/app/backoffice/system/security/page.tsx` | 安全策略配置 |

---

*本报告基于 2026-04-25 的源码快照生成。建议在完成 P0 整改后安排复测。*
