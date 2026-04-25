# TradePass 系统改善与修复方案

> 基于 AUDIT-SUMMARY + 5 维度详细报告 + 产品商业竞争力分析制定  
> 版本：v1.0 | 日期：2026-04-26

---

## 一、方案总览

**当前状态**：综合评分 5.86/10（C 级），核心交易链路断裂，安全存在可被直接利用的漏洞  
**目标状态**：综合评分 7.5+/10（B+ 级），核心链路闭环，可进入内测/小范围试运营  
**总工期预估**：14 ~ 18 周（2 人全栈团队）  
**核心原则**：**先止血，再造血，后整容** — 安全 > 链路 > 数据 > 功能

---

## 二、四阶段修复路线

### Phase 1：安全止血（Security First）—— 2 周

**目标**：消除全部 P0 安全风险，达到"上线不被秒"的底线。

| # | 任务 | 优先级 | 估算工时 | 交付验收标准 |
|---|------|--------|----------|-------------|
| S1 | **修复注册绕过** — 删除 `POST /api/auth/register` 的 `skipVerification` 参数，邮箱验证为强制流程 | P0 | 4h | 发送 `"skipVerification": true` 返回 400，用户状态只能为 `pending` |
| S2 | **消除 JWT 硬编码密钥** — `src/lib/auth.ts` 中移除回退值，启动时若 `JWT_SECRET` 未设置则 `throw` 并退出 | P0 | 2h | `JWT_SECRET` 为 `undefined` 时进程拒绝启动 |
| S3 | **API 层过滤 Mock Headers** — 全局中间件拦截并丢弃 `X-Mock-*` headers（无论任何环境） | P0 | 4h | 携带 `X-Mock-Review-Force` 的请求被清除 header 后再处理 |
| S4 | **KYC 审核 API 加权限校验** — 审核 API 从 Session 取 `adminId`，校验角色含 `compliance_officer` | P0 | 6h | 非合规角色调用返回 403 |
| S5 | **统一权限中间件** — 创建 `requireRole()` 高阶函数，覆盖所有 Backoffice / Admin 敏感 API | P0 | 1d | 所有敏感路由均经过角色校验，未校验路由数为 0 |
| S6 | **CSRF Token + 幂等性键** — 敏感操作（审核/出金/改密码）要求 `X-CSRF-Token` + `Idempotency-Key` | P0 | 2d | 重复提交返回 409，无 CSRF Token 返回 403 |
| S7 | **验证 Token 熵值提升** — `generateVerificationToken()` 改用 `crypto.randomUUID()` | P0 | 1h | Token 长度 ≥ 36 字符，不可预测 |
| S8 | **bcrypt cost 提升至 12** — `bcrypt.hash(password, 12)` | P0 | 30min | 密码哈希耗时 ≥ 250ms |
| S9 | **Session 服务端失效** — Token 加入 Redis 黑名单，修改密码后旧 Token 失效 | P1 | 1.5d | 修改密码后旧 Token 返回 401 |
| S10 | **2FA 强制校验** — 登录 API 若用户开启 2FA 则必须校验 TOTP 才能发放 Token | P1 | 1d | 开启 2FA 的用户登录不填 OTP 返回 401 |

**Phase 1 交付物**：
1. 安全修复 PR，含完整回归测试
2. 安全基线文档（已修复/待修复清单）
3. 渗透测试通过报告（手动验证 10 个场景）

---

### Phase 2：核心链路闭环（Value Delivery）—— 5 周

**目标**：打通"注册 → KYC → 开户 → 入金 → 交易 → 出金"最小闭环，让系统产生真实价值。

#### 2.1 KYC 状态机落地（1.5 周）

| # | 任务 | 估算工时 |
|---|------|----------|
| K1 | **Prisma 新增 KYCRecord 模型** — 含 userId, region, level, status（13 步枚举）, documents[], reviewLogs[], createdAt, updatedAt | 4h |
| K2 | **KYC 状态机服务** — `src/lib/kyc/state-machine.ts`，封装状态流转规则（如 liveness_completed → personal_info_pending 只能前进不能后退） | 1d |
| K3 | **KYC 审核 API 真实化** — `/api/backoffice/kyc/review` 读写 KYCRecord，生成真实审核记录 | 1.5d |
| K4 | **KYC 补充认证持久化** — `supplementalRequestsStore` 从内存 Map 迁移到 Prisma | 6h |
| K5 | **开户申请 → MT 账户关联** — KYC approved 后生成开户申请，状态同步到 Portal | 1d |

#### 2.2 交易终端嵌入（1 周）

| # | 任务 | 估算工时 |
|---|------|----------|
| T1 | **接入 MT5 WebTerminal** — 用 iframe 嵌入 MetaTrader 5 Web Terminal（最简单方案） | 1d |
| T2 | **单点登录对接** — Portal 登录后自动向 MT5 Manager API 申请 token，免密进入 WebTerminal | 2d |
| T3 | **账户列表绑定 MT 账号** — Portal 的账户列表从 Mock 改为读取 `MTAccount` 模型 | 1d |
| T4 | **订单/持仓/历史真实数据** — 从 MT5 API 拉取真实交易数据展示在 Portal | 1d |

> **备选方案**：若 MT5 WebTerminal 嵌入存在许可问题，改用 cTrader Open API（REST + WebSocket），预估 +3 天。

#### 2.3 支付网关接入（2 周）

| # | 任务 | 估算工时 |
|---|------|----------|
| P1 | **Prisma 新增 Transaction/Wallet/Deposit/Withdrawal 模型** | 1d |
| P2 | **接入 USDT-TRC20 支付网关** — 使用 TronGrid API 生成充值地址，监听链上确认 | 2d |
| P3 | **存款流程闭环** — 用户选 USDT → 生成地址 → 转账确认 → 资金入账 → 入账通知 | 1.5d |
| P4 | **出金流程闭环** — 用户发起出金 → 后台审核 → 链上转账 → 状态更新 | 1.5d |
| P5 | **资金对账服务** — 定时任务扫描链上交易，匹配系统记录 | 1d |
| P6 | **Stripe/Adyen 备选通道** — 信用卡/银行卡入金（最小集成） | 2d |

#### 2.4 风控体系骨架（0.5 周）

| # | 任务 | 估算工时 |
|---|------|----------|
| R1 | **黑名单联动** — 注册/登录/出入金时查询黑名单表，命中则拦截 | 4h |
| R2 | **风控规则引擎 v0** — 最小实现：保证金比例 < 50% 时触发 alert，写入 RiskEvent 表 | 1d |
| R3 | **风控锁联动** — 触发风控锁时阻断对应操作（如大额出金锁禁止出金） | 4h |

**Phase 2 交付物**：
1. 用户可完整走完：注册 → KYC → 开户 → USDT 入金 → MT5 交易 → USDT 出金
2. KYC 审核后台可操作真实记录
3. 风控告警产生真实事件
4. 端到端测试脚本（Playwright）覆盖完整链路

---

### Phase 3：数据层重构与 API 真实化（4 周）

**目标**：将 Mock 数据层替换为真实数据库，Prisma Schema 覆盖全部核心业务。

#### 3.1 Prisma Schema 扩展（1.5 周）

新增模型清单：

| 模型 | 核心字段 | 关联 |
|------|----------|------|
| `KYCRecord` | userId, region, level, status, documents, reviewLogs | → User |
| `MTAccount` | accountId, userId, group, leverage, balance, equity | → User |
| `Wallet` | userId, currency, balance, frozen, available | → User |
| `Transaction` | type(deposit/withdrawal/transfer), amount, status, txHash?, method | → User, Wallet |
| `Order` | mtTicket, accountId, symbol, type, volume, openPrice, closePrice, profit | → MTAccount |
| `Position` | accountId, symbol, type, volume, openPrice, openTime, profit | → MTAccount |
| `IBPartner` | userId, parentId, level, commissionRate, totalCommission | → User |
| `CommissionRecord` | ibId, clientId, orderId, amount, status, period | → IBPartner, Order |
| `RiskEvent` | type, severity, userId, accountId, triggeredAt, resolvedAt | → User |
| `BlacklistEntry` | type(email/phone/ip/document), value, reason, createdBy | — |
| `AuditLog` | action, actorId, targetType, targetId, before, after, ip | → User |
| `Notification` | userId, type, title, content, read, createdAt | → User |

> 总计从 13 个模型扩展至 25+ 个。

#### 3.2 Mock → 真实迁移（1.5 周）

| # | 模块 | 迁移方式 | 估算工时 |
|---|------|----------|----------|
| M1 | Backoffice 资金页面（存款/出金/渠道/交易记录） | 读取 Prisma Transaction/Wallet | 1d |
| M2 | Backoffice 交易管理（订单/持仓/品种/设置） | 读取 Prisma Order/Position + MT5 API | 1.5d |
| M3 | Backoffice IB 管理（佣金/设置/树形） | 读取 Prisma IBPartner/CommissionRecord | 1.5d |
| M4 | Backoffice 风控（规则/保证金/NBP） | 读取 Prisma RiskEvent + 实时计算 | 1d |
| M5 | Portal 仪表盘 | 聚合 Wallet + MTAccount + Order 真实数据 | 1d |
| M6 | 删除 `lib/backoffice/mock-*.ts` 系列文件 | 确认无引用后移除 | 4h |

#### 3.3 API 统一与清理（1 周）

| # | 任务 | 估算工时 |
|---|------|----------|
| A1 | **合并 KYC 配置双系统** — 废弃旧 `/api/config/kyc`，全部路由到新系统 | 4h |
| A2 | **统一错误响应格式** — 所有 API 返回 `{ success: boolean, data?, error?: { code, message } }` | 1d |
| A3 | **API 文档自动生成** — 使用 `next-api-doc` 或手动维护 OpenAPI spec | 1d |
| A4 | **清理 console.log** — 删除全部 113+ 处调试输出 | 4h |
| A5 | **移除 `as any`** — 逐处修复 28 处类型逃逸 | 1.5d |

**Phase 3 交付物**：
1. 完整 Prisma Schema（25+ 模型）+ 迁移脚本
2. Mock 数据文件全部移除
3. API 错误响应格式统一
4. 数据库 Seeding 脚本（含测试数据）

---

### Phase 4：功能补全与工程化升级（4 ~ 6 周）

**目标**：补全商业竞争力缺口，提升工程化成熟度。

#### 4.1 佣金引擎（1.5 周）

| # | 任务 | 估算工时 |
|---|------|----------|
| C1 | **佣金计算服务** — 订单成交后按 L1/L2/L3 比例自动计算佣金 | 2d |
| C2 | **佣金入账/提现流程** — IB Portal 佣金余额展示 + 提现申请 + 审核 + 发放 | 2d |
| C3 | **佣金报表** — Backoffice 佣金统计 + IB 个人报表 | 1d |
| C4 | **IB 树形关系真实化** — 从 Mock 改为真实层级绑定 | 4h |

#### 4.2 跟单交易 v0（1 周）

| # | 任务 | 估算工时 |
|---|------|----------|
| CP1 | **信号提供者注册** — 用户申请成为信号提供者，设置订阅费/分成比例 | 1d |
| CP2 | **复制引擎 v0** — 最小实现：跟随者账户按比例复制信号者的开仓/平仓（延迟 1-5 秒可接受） | 2d |
| CP3 | **分润结算** — 按周/月结算跟随者的盈利分成 | 1d |
| CP4 | **复制设置** — 跟随者可设置倍数、最大持仓、止损 | 1d |

> v0 版本不追求低延迟，先跑通流程。v1 再优化到毫秒级跟单。

#### 4.3 工程化升级（1.5 ~ 2 周）

| # | 任务 | 估算工时 |
|---|------|----------|
| E1 | **ESLint + Prettier 全量配置** — 覆盖全部 src/ 目录，提交前自动格式化 | 1d |
| E2 | **Husky + lint-staged** — Git hooks 禁止提交未通过 lint 的代码 | 4h |
| E3 | **单元测试骨架** — Vitest + React Testing Library，核心工具函数和 hooks 优先 | 2d |
| E4 | **E2E 测试** — Playwright，覆盖 Phase 2 的完整链路 | 2d |
| E5 | **Bundle 分析** — `next-bundle-analyzer`，识别超大依赖 | 4h |
| E6 | **SSR 优化** — 清理 `"use client"` 滥用，纯展示页改为 Server Component | 2d |
| E7 | **Docker 部署配置** — Dockerfile + docker-compose（含 PostgreSQL + Redis） | 1d |
| E8 | **CI/CD 流水线** — GitHub Actions：lint → test → build → deploy | 1.5d |

#### 4.4 UI 组件统一（穿插进行，1 周）

| # | 任务 | 估算工时 |
|---|------|----------|
| U1 | **Backoffice 组件迁移** — 将自建 Button/Card/PageHeader 替换为 shadcn/ui | 2d |
| U2 | **DataTable 合并** — 将两套表格组件合并为一套通用实现 | 1d |
| U3 | **主题 Token 统一** — 清理硬编码颜色，全部使用 CSS 变量 | 1d |
| U4 | **占位页面组件化** — 6+ 重复 "Coming Soon" 合并为一个 `<ComingSoonPage />` | 2h |

**Phase 4 交付物**：
1. IB 返佣体系可运转（邀请 → 交易 → 佣金计算 → 提现）
2. 跟单交易 MVP 可运行
3. CI/CD 流水线通过
4. Docker 一键部署
5. 单元测试覆盖率 ≥ 30%

---

## 三、工期与资源规划

### 3.1 总工期（2 人全栈）

```
Phase 1: 安全止血        ────────────  2 周
Phase 2: 核心链路闭环    ──────────────────  5 周
Phase 3: 数据层重构      ────────────────  4 周
Phase 4: 功能补全        ───────────────────  5 周
                                     总计 16 周
```

**可并行的任务**：
- Phase 2 中 KYC 状态机与支付网关可并行
- Phase 3 与 Phase 4 中工程化任务可与功能开发穿插
- 实际压缩到 **14 周** 可行

### 3.2 人员配置建议

| 角色 | 人数 | 负责阶段 |
|------|------|----------|
| 全栈工程师（Next.js/Prisma） | 2 | 全部 |
| DevOps（Docker/CI/CD） | 0.5（兼任） | Phase 4 后半段 |
| 产品经理 | 0.5（兼任） | Phase 2/4 需求确认 |

### 3.3 关键路径

```
S1~S10 (安全) → K1~K5 (KYC 状态机) → P1~P6 (支付网关) → T1~T4 (交易终端)
                     ↓
              最小可运营版本（MVP Ready）
                     ↓
     M1~M6 (Mock 迁移) → C1~C4 (佣金引擎) → CP1~CP4 (跟单)
```

**MVP Ready 节点**：完成 Phase 1 + Phase 2 后，系统即可小规模试运营（10-50 用户）。

---

## 四、风险与应对

| 风险 | 概率 | 影响 | 应对 |
|------|------|------|------|
| MT5 WebTerminal 嵌入许可受限 | 中 | 高 | 备选 cTrader Open API 或自研简易下单面板 |
| USDT 支付网关开发复杂度超预期 | 中 | 高 | 先接入第三方聚合支付（如 CoinPayments），再自建 |
| Prisma Schema 大改导致数据丢失 | 低 | 高 | 每次迁移前自动备份 SQLite，测试环境验证后再执行 |
| 2 人团队 burnout | 中 | 中 | Phase 1 后立即安排 1 天休整；每 2 周 review 进度 |
| 竞品抢先发布类似功能 | 高 | 低 | 聚焦最小闭环，不追全功能；速度 > 完美 |

---

## 五、验收标准

每个 Phase 结束后需通过以下验收：

1. **Phase 1**：渗透测试清单 10/10 通过，安全扫描无高危漏洞
2. **Phase 2**：Playwright E2E 覆盖完整链路，通过率 100%
3. **Phase 3**：`npm run build` 零错误，`npm run lint` 零 warning，Mock 文件数为 0
4. **Phase 4**：单元测试覆盖率 ≥ 30%，Docker 一键部署成功，CI/CD 全绿

---

## 六、立即开始的动作（若确认）

若方案获得确认，建议按以下顺序启动：

1. **今天**：创建 `fix/security-phase1` 分支，开始 S1（注册绕过修复）
2. **本周内**：完成 S1~S8（全部 P0 安全漏洞）
3. **下周**：Code Review + 安全回归测试，合并到 main
4. **第三周**：启动 Phase 2，并行 KYC 状态机 + 支付网关调研

---

## 七、附录：审计问题 → 修复方案映射表

| 审计报告 | 问题编号 | 对应本方案任务 |
|----------|----------|---------------|
| security | H1~H5 | S1~S8 |
| security | M1~M9 | S9, S10 |
| backend | Prisma 仅 13 模型 | K1, P1, Phase 3.1 |
| backend | KYC API 全 Mock | K2~K5 |
| backend | Mock 数据 ~89KB | M1~M6 |
| frontend | 两套 UI 体系 | U1~U4 |
| frontend | 50+ 页面硬编码 Mock | M1~M6 |
| frontend | 16 个超大型页面 | Phase 3/4 渐进拆分 |
| frontend | 28 处 `as any` | A5 |
| frontend | 113+ console.log | A4 |
| business | 交易链路断裂 | T1~T4, P1~P6 |
| business | IB 返佣断裂 | C1~C4 |
| business | 跟单交易断裂 | CP1~CP4 |
| devops | 无测试 | E3, E4 |
| devops | 无 CI/CD | E7, E8 |

---

**请审阅以上方案。确认后我将按 Phase 顺序开始实施。**
