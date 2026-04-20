# TradePass 测试计划 v1.0

> 生成时间: 2026-04-18
> 覆盖版本: v1.9.0
> 测试框架: Playwright E2E (@playwright/test v1.59.1)

---

## 一、项目概况

| 维度 | 数据 |
|------|------|
| 技术栈 | Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + Prisma + SQLite |
| 页面数量 | 165 个 page.tsx |
| API 路由 | 42 个 route.ts |
| 现有测试 | 0 |
| 已安装测试工具 | @playwright/test v1.59.1 |

### 系统模块

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Website   │  │    Auth     │  │   Portal    │  │  Backoffice │  │Console/Admin│
│  (营销首页)  │  │ (登录/注册)  │  │  (交易门户)  │  │  (运营后台)  │  │  (管理后台)  │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
      │                │                │                │                │
      ▼                ▼                ▼                ▼                ▼
   公开访问         公开访问         需认证            需认证            需认证
   8 Sections     3 个页面        30+ 子页面        60+ 子页面         10+ 子页面
```

---

## 二、测试策略

### 2.1 测试类型选择

| 测试类型 | 是否采用 | 理由 |
|----------|----------|------|
| E2E (Playwright) | ✅ 核心 | 全栈应用，真实用户旅程验证 |
| API 测试 | ✅ 辅助 | 用 Playwright request API 覆盖关键接口 |
| 组件单元测试 | ❌ 暂缓 | 页面数量多，ROI 低；E2E 已覆盖交互 |
| 视觉回归测试 | ✅ 轻量 | 关键页面截图存档 |

### 2.2 优先级定义

| 优先级 | 定义 | 失败影响 |
|--------|------|----------|
| **P0 - 阻塞** | 核心流程完全不可用 | 用户无法使用系统 |
| **P1 - 高** | 主要功能存在缺陷 | 影响用户体验/运营效率 |
| **P2 - 中** | 次要功能/边缘场景 | 影响有限 |
| **P3 - 低** | 优化建议/细节问题 | 不影响使用 |

### 2.3 测试环境

```bash
# 前置步骤
cd /Users/sevenkowel/WorkBuddy/20260331222439/tradepass
npm install                    # 确保依赖完整
npm run db:seed               # 初始化测试数据
PORT=3001 npm run dev         # 启动开发服务器

# 测试执行
npx playwright test           # 运行全部测试
npx playwright test --ui      # UI 模式调试
```

**基础 URL**: `http://localhost:3001`

**测试账号** (由 seed 数据创建):
- 管理员: `admin@tradepass.io` / `admin123`
- 测试用户: `test@example.com` / `password123`

---

## 三、测试用例详情

### 模块 A: Website & 公开页面 (P0-P1)

| 用例 ID | 名称 | 优先级 | 步骤 | 预期结果 |
|---------|------|--------|------|----------|
| **WEB-01** | 首页正常渲染 | P0 | 1. 访问 `/` | 8 个 Section 均可见，无控制台报错 |
| **WEB-02** | 主题切换功能 | P1 | 1. 访问 `/` <br>2. 点击主题切换按钮 | 亮/暗/系统三种模式正常切换 |
| **WEB-03** | CTA 按钮链接有效 | P1 | 1. 检查 Hero CTA → `/auth/register` <br>2. 检查产品 CTA → `#products` <br>3. 检查联系销售 → `mailto:sales@tradepass.io` | 所有链接目标正确 |
| **WEB-04** | Header 语言切换 | P1 | 1. 点击 EN/中 切换 | 语言切换入口存在并可交互 |
| **WEB-05** | 响应式布局 (Mobile) | P1 | 1. 视口设为 375×667 <br>2. 检查布局 | 无横向滚动，元素不重叠 |

### 模块 B: 认证与授权 (P0)

| 用例 ID | 名称 | 优先级 | 步骤 | 预期结果 |
|---------|------|--------|------|----------|
| **AUTH-01** | 注册流程（跳过验证） | P0 | 1. 访问 `/auth/register` <br>2. 填写邮箱/密码/姓名 <br>3. 勾选跳过验证 <br>4. 提交 | 注册成功，自动跳转 `/console` |
| **AUTH-02** | 注册流程（需验证） | P0 | 1. 访问 `/auth/register` <br>2. 填写信息，不勾选跳过 <br>3. 提交 | 显示"请查收验证邮件"，控制台输出验证链接 |
| **AUTH-03** | 邮箱验证 | P0 | 1. 从控制台复制 verifyUrl <br>2. 浏览器访问该链接 | 邮箱验证成功 |
| **AUTH-04** | 登录成功 | P0 | 1. 访问 `/auth/login` <br>2. 输入正确邮箱密码 <br>3. 提交 | 登录成功，Cookie 中有 token，跳转 `/console` |
| **AUTH-05** | 登录失败-错误密码 | P0 | 1. 输入正确邮箱+错误密码 <br>2. 提交 | 显示"Invalid credentials"，HTTP 401 |
| **AUTH-06** | 登录失败-未验证邮箱 | P0 | 1. 注册未验证账号 <br>2. 尝试登录 | 显示"Please verify your email first"，HTTP 403 |
| **AUTH-07** | 登出功能 | P0 | 1. 登录后访问任意页面 <br>2. 点击登出 | Cookie 清除，重定向到 `/auth/login` |
| **AUTH-08** | Middleware 路由守卫 | P0 | 1. 清除 Cookie <br>2. 访问 `/portal/dashboard` <br>3. 访问 `/backoffice` <br>4. 访问 `/console` | 全部重定向到 `/auth/login` |
| **AUTH-09** | 已登录用户防重登 | P1 | 1. 登录后访问 `/auth/login` <br>2. 访问 `/auth/register` | 自动重定向到 `/console` |
| **AUTH-10** | 注册邮箱唯一性 | P1 | 1. 用已注册邮箱再次注册 | 显示"Email already registered"，HTTP 409 |

### 模块 C: Portal 用户端 (P0-P1)

#### C1 - Dashboard

| 用例 ID | 名称 | 优先级 | 步骤 | 预期结果 |
|---------|------|--------|------|----------|
| **POR-DASH-01** | Dashboard 页面渲染 | P0 | 1. 登录后访问 `/portal/dashboard` | 页面加载，AccountOverview、TradingAccounts 等模块可见 |
| **POR-DASH-02** | 视角切换 | P1 | 1. 切换不同用户视角 | Dashboard 内容根据视角变化 |

#### C2 - Fund Management (核心)

| 用例 ID | 名称 | 优先级 | 步骤 | 预期结果 |
|---------|------|--------|------|----------|
| **POR-FUND-01** | 资金管理首页渲染 | P0 | 1. 访问 `/portal/fund` | 钱包余额、快捷操作按钮均显示正确 |
| **POR-FUND-02** | 充值页面渲染 | P0 | 1. 访问 `/portal/fund/deposit` | 支付方式列表、账户选择、金额输入均可见 |
| **POR-FUND-03** | 充值费率计算 | P1 | 1. 选择 USDT-TRC20 <br>2. 输入 $1000 | 显示费率为 0，到账 $1000 |
| **POR-FUND-04** | 充值费率计算-SWIFT | P1 | 1. 选择 SWIFT <br>2. 输入 $1000 | 显示手续费 $25（payment_first 模式），实际到账 $975 |
| **POR-FUND-05** | 充值 FAQ 展开折叠 | P1 | 1. 点击 FAQ 问题 | 答案区域展开/折叠正常 |
| **POR-FUND-06** | 提款页面渲染 | P0 | 1. 访问 `/portal/fund/withdraw` | 账户选择、金额输入、提款方式均可见 |
| **POR-FUND-07** | 提款金额校验 | P1 | 1. 输入超过余额的金额 | 显示超限警告 |
| **POR-FUND-08** | 提款手续费计算 | P1 | 1. 选择 SWIFT，输入 $500 | 显示手续费 $25，实际到账 $475 |
| **POR-FUND-09** | 提款成功状态 | P1 | 1. 填写提款信息 <br>2. 提交 | 显示成功页面，金额/手续费/到账金额正确 |
| **POR-FUND-10** | 转账页面渲染 | P1 | 1. 访问 `/portal/fund/transfer` | 页面正常渲染 |
| **POR-FUND-11** | 历史记录页面渲染 | P1 | 1. 访问 `/portal/fund/history` | 交易历史列表正常渲染 |

#### C3 - KYC 身份认证 (核心)

| 用例 ID | 名称 | 优先级 | 步骤 | 预期结果 |
|---------|------|--------|------|----------|
| **POR-KYC-01** | KYC 首页渲染 | P0 | 1. 访问 `/portal/kyc` | 地区选择列表显示，配置加载成功 |
| **POR-KYC-02** | 地区选择并启动 | P0 | 1. 选择地区（如越南） <br>2. 点击开始认证 | 跳转到 `/portal/kyc/document` |
| **POR-KYC-03** | 文档上传页渲染 | P1 | 1. 访问 `/portal/kyc/document` | 上传区域、要求说明可见 |
| **POR-KYC-04** | OCR 确认页渲染 | P1 | 1. 模拟进入 OCR 确认 | 字段预填，可编辑 |
| **POR-KYC-05** | 活体检测页渲染 | P1 | 1. 访问 `/portal/kyc/liveness` | 摄像头引导页面正常 |
| **POR-KYC-06** | 个人信息页渲染 | P1 | 1. 访问 `/portal/kyc/personal-info` | 表单字段完整 |
| **POR-KYC-07** | 协议签署页渲染 | P1 | 1. 访问 `/portal/kyc/agreements` | 协议列表、签名区域可见 |
| **POR-KYC-08** | KYC 状态查询 | P1 | 1. 访问 `/portal/kyc/status` | 当前 KYC 状态正确显示 |
| **POR-KYC-09** | 配置加载失败处理 | P1 | 1. 模拟配置加载失败 | 显示错误提示，有重试按钮 |

#### C4 - Settings 账户中心

| 用例 ID | 名称 | 优先级 | 步骤 | 预期结果 |
|---------|------|--------|------|----------|
| **POR-SET-01** | 设置首页渲染 | P0 | 1. 访问 `/portal/settings` | 6 个设置分类卡片显示 |
| **POR-SET-02** | Profile 信息展示 | P1 | 1. 点击 Profile | 用户信息（姓名、邮箱、国家）正确显示 |
| **POR-SET-03** | Security 页面渲染 | P1 | 1. 点击 Security | 2FA、设备管理、密码修改入口可见 |
| **POR-SET-04** | Verification 页面渲染 | P1 | 1. 点击 Verification | KYC 等级、权限矩阵正确显示 |
| **POR-SET-05** | Payment Methods 渲染 | P1 | 1. 点击 Payment Methods | 支付方式列表正确 |
| **POR-SET-06** | Notifications 渲染 | P1 | 1. 点击 Notifications | 通知偏好设置正常 |
| **POR-SET-07** | Language 切换 | P1 | 1. 点击 Language <br>2. 切换语言 | 语言设置可交互 |

#### C5 - 其他 Portal 页面

| 用例 ID | 名称 | 优先级 | 步骤 | 预期结果 |
|---------|------|--------|------|----------|
| **POR-WAL-01** | 钱包页面渲染 | P1 | 1. 访问 `/portal/wallet` | 资产概览、操作按钮正常 |
| **POR-ACT-01** | 活动中心渲染 | P2 | 1. 访问 `/portal/activity` | 活动列表正常 |
| **POR-SUP-01** | 支持页面渲染 | P2 | 1. 访问 `/portal/support` | 工单、FAQ 正常 |
| **POR-AI-01** | AI Signals 页面渲染 | P2 | 1. 访问 `/portal/ai-signals` | 信号列表正常 |

### 模块 D: Backoffice 运营后台 (P1)

| 用例 ID | 名称 | 优先级 | 步骤 | 预期结果 |
|---------|------|--------|------|----------|
| **BO-DASH-01** | Dashboard 渲染与数据 | P1 | 1. 登录后访问 `/backoffice` | KPI 卡片、图表、最近用户/租户列表加载 |
| **BO-USER-01** | 用户列表页渲染 | P1 | 1. 访问 `/backoffice/users` | 用户表格、分页、筛选正常 |
| **BO-ACC-01** | 账户管理页渲染 | P1 | 1. 访问 `/backoffice/accounts` | 账户列表正常 |
| **BO-KYC-01** | KYC 审核页渲染 | P1 | 1. 访问 `/backoffice/compliance/kyc-review` | 审核列表、操作按钮正常 |
| **BO-KYC-02** | 证件图片预览 | P1 | 1. 进入 KYC 详情 <br>2. 点击证件图片 | 图片放大模态框正常弹出 |
| **BO-FUN-01** | 提款审核页渲染 | P1 | 1. 访问 `/backoffice/funds/withdrawal-review` | 提款申请列表正常 |
| **BO-CRM-01** | 工单管理页渲染 | P1 | 1. 访问 `/backoffice/crm/tickets` | 工单列表、状态筛选正常 |
| **BO-MKT-01** | 活动管理页渲染 | P2 | 1. 访问 `/backoffice/marketing/campaigns` | 活动列表正常 |
| **BO-RPT-01** | 财务报表渲染 | P2 | 1. 访问 `/backoffice/reports/financial` | 图表和数据正常 |
| **BO-SYS-01** | 系统配置页渲染 | P1 | 1. 访问 `/backoffice/system/config` | 配置项可编辑、保存 |
| **BO-SYS-02** | KYC 配置页渲染 | P1 | 1. 访问 `/backoffice/system/kyc-config` | 地区配置、开关正常 |
| **BO-SYS-03** | 角色管理页渲染 | P2 | 1. 访问 `/backoffice/system/roles` | 角色列表、权限矩阵正常 |
| **BO-MOB-01** | 移动端侧边栏 | P1 | 1. 视口设为 375×667 <br>2. 点击汉堡菜单 | 侧边栏滑出，遮罩层正常 |

### 模块 E: Console & Admin 管理后台 (P1)

| 用例 ID | 名称 | 优先级 | 步骤 | 预期结果 |
|---------|------|--------|------|----------|
| **CON-DASH-01** | Console Dashboard 渲染 | P1 | 1. 访问 `/console` | 租户统计、产品数据正常 |
| **CON-TEN-01** | 租户列表渲染 | P1 | 1. 访问 `/console/tenants` | 租户表格正常，数据正确 |
| **CON-TEN-02** | 新建租户页面渲染 | P1 | 1. 访问 `/console/tenants/new` | 表单正常，可提交 |
| **CON-TEN-03** | 租户详情页渲染 | P1 | 1. 访问 `/console/tenants/[id]` | 详情、订阅、功能开关正常 |
| **CON-PRO-01** | 产品管理页渲染 | P1 | 1. 访问 `/console/products` | 产品列表正常 |
| **ADM-DASH-01** | Admin Dashboard 渲染 | P1 | 1. 访问 `/admin` | 统计卡片正常 |
| **ADM-USER-01** | 用户管理页渲染 | P1 | 1. 访问 `/admin/users` | 用户列表正常 |
| **ADM-LIC-01** | License 管理页渲染 | P1 | 1. 访问 `/admin/licenses` | License 列表、脱敏显示正常 |
| **ADM-AUD-01** | 审计日志页渲染 | P1 | 1. 访问 `/admin/audit-logs` | 日志列表、分页正常 |
| **ADM-BIL-01** | 账单页渲染 | P2 | 1. 访问 `/admin/billing` | 账单数据正常 |

### 模块 F: API 接口 (P0-P1)

| 用例 ID | 名称 | 优先级 | 请求 | 预期结果 |
|---------|------|--------|------|----------|
| **API-AUTH-01** | 登录接口-成功 | P0 | POST `/api/auth/login` <br>Body: {email, password} | 200, 返回用户数据，设置 Cookie |
| **API-AUTH-02** | 登录接口-密码错误 | P0 | POST `/api/auth/login` <br>Body: 错误密码 | 401, error: "Invalid credentials" |
| **API-AUTH-03** | 登录接口-邮箱格式错误 | P0 | POST `/api/auth/login` <br>Body: 非法邮箱 | 400, error: "Invalid input" |
| **API-AUTH-04** | 注册接口-成功 | P0 | POST `/api/auth/register` | 200/201, 返回成功信息 |
| **API-AUTH-05** | 注册接口-邮箱已存在 | P0 | POST `/api/auth/register` <br>Body: 已注册邮箱 | 409, error: "Email already registered" |
| **API-AUTH-06** | 注册接口-密码太短 | P0 | POST `/api/auth/register` <br>Body: 密码 < 8 位 | 400, error: "Invalid input" |
| **API-AUTH-07** | 当前用户接口 | P0 | GET `/api/auth/me` (带 Cookie) | 200, 返回当前用户信息 |
| **API-AUTH-08** | 当前用户接口-未登录 | P0 | GET `/api/auth/me` (无 Cookie) | 401 |
| **API-AUTH-09** | 登出接口 | P0 | POST `/api/auth/logout` | 清除 Cookie，200 |
| **API-BO-01** | Backoffice Dashboard 数据 | P1 | GET `/api/backoffice/dashboard` | 200, 返回 KPI、recentUsers、recentTenants |
| **API-KYC-01** | KYC 状态查询 | P1 | GET `/api/kyc/status` | 200, 返回当前 KYC 状态 |
| **API-KYC-02** | KYC 配置获取 | P1 | GET `/api/kyc/config` | 200, 返回地区配置 |
| **API-CONF-01** | 开户配置获取 | P1 | GET `/api/config/kyc` | 200, 返回配置数据 |
| **API-CONF-02** | 开户配置更新 | P1 | PUT `/api/config/kyc` | 200, 配置更新成功 |
| **API-ADM-01** | 审计日志接口 | P1 | GET `/api/admin/audit-logs` | 200, 返回日志列表 |
| **API-ADM-02** | License 列表接口 | P1 | GET `/api/admin/licenses` | 200, 返回 License 列表 |
| **API-CON-01** | 租户列表接口 | P1 | GET `/api/console/tenants` | 200, 返回租户数据 |

### 模块 G: 响应式与兼容性 (P1-P2)

| 用例 ID | 名称 | 优先级 | 视口 | 检查点 |
|---------|------|--------|------|--------|
| **RESP-01** | 移动端首页 | P1 | 375×667 | 无横向滚动，CTA 可点击 |
| **RESP-02** | 移动端登录页 | P1 | 375×667 | 表单完整可见，按钮可点击 |
| **RESP-03** | 移动端 Portal Dashboard | P1 | 375×667 | 布局适配，卡片垂直排列 |
| **RESP-04** | 移动端 Fund 页面 | P1 | 375×667 | 快捷操作按钮可点击 |
| **RESP-05** | 移动端 Backoffice | P1 | 375×667 | 侧边栏可展开，表格横向滚动 |
| **RESP-06** | 平板端 Portal | P2 | 768×1024 | 布局正常，两列变单列 |
| **RESP-07** | 大屏端 Website | P2 | 1920×1080 | 内容居中，无过度拉伸 |

---

## 四、测试执行计划

### 4.1 批次安排

```
第 1 批 (P0 - 阻塞级)      → 约 20 个用例 → 预计 10 分钟
  ├── AUTH-01 ~ AUTH-10
  ├── WEB-01
  ├── POR-DASH-01, POR-FUND-01/02, POR-KYC-01/02
  └── API-AUTH-01 ~ API-AUTH-09

第 2 批 (P1 - 高优先级)    → 约 50 个用例 → 预计 25 分钟
  ├── WEB-02 ~ WEB-05
  ├── POR 全部剩余用例
  ├── BO 全部用例
  ├── CON/ADM 全部用例
  └── API 全部剩余用例

第 3 批 (P2-P3 - 中低优先级) → 约 20 个用例 → 预计 15 分钟
  ├── RESP-01 ~ RESP-07
  └── 截图存档
```

### 4.2 预期产出物

| 产出物 | 说明 |
|--------|------|
| `playwright.config.ts` | Playwright 配置文件 |
| `tests/e2e/*.spec.ts` | E2E 测试脚本（按模块分文件） |
| `tests/api/*.spec.ts` | API 测试脚本 |
| `test-results/` | 测试报告、截图、 trace |
| `docs/test-report-*.md` | 测试执行报告 |

---

## 五、风险与注意事项

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| dev server 启动慢 | 测试超时 | 设置 longer timeout (30s) |
| 数据库未 seed | 测试数据缺失 | 测试前自动执行 db:seed |
| 动画/过渡导致定位失败 | 测试不稳定 | 使用 `waitFor` 和 `toBeVisible` |
| 第三方依赖 (qrcode) | 构建失败 | 确保 node_modules 完整 |
| 并行测试导致数据冲突 | 测试不稳定 | 使用 serial mode 或隔离数据库 |

---

## 六、签字确认

- [ ] 测试用例覆盖范围确认
- [ ] 优先级定义确认
- [ ] 测试环境配置确认
- [ ] 开始执行测试
