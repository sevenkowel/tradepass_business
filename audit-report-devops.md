# TradePass 工程化审计报告

> 审计时间：2026-04-25  
> 审计对象：TradePass v1.7.0（Next.js 16 + React 19 经纪商 SaaS 系统）  
> 项目路径：`/Users/sevenkowel/WorkBuddy/20260331222439/tradepass`

---

## 一、工程化成熟度评分

| 维度 | 得分 | 权重 | 加权得分 |
|------|------|------|----------|
| 依赖管理 | 6.5 / 10 | 20% | 1.30 |
| 构建配置 | 5.5 / 10 | 20% | 1.10 |
| 测试覆盖 | 4.0 / 10 | 20% | 0.80 |
| 性能优化 | 4.5 / 10 | 15% | 0.68 |
| 开发体验 | 6.0 / 10 | 15% | 0.90 |
| 部署与 DevOps | 3.0 / 10 | 10% | 0.30 |
| **综合评分** | — | — | **5.08 / 10** |

**评级：C（需要系统性改进）**

> 项目完成了核心功能开发（167 页面、305 个 TSX 组件），但在构建优化、测试覆盖、部署流程方面存在显著缺口。

---

## 二、依赖健康度分析

### 2.1 依赖概览

- **生产依赖 (dependencies)**：34 个
- **开发依赖 (devDependencies)**：14 个
- **总计**：48 个（数量合理）

### 2.2 依赖清单分析

| 类别 | 依赖项 | 状态 |
|------|--------|------|
| UI 组件库 | `@radix-ui/*` (10 个) | 合理，headless UI 方案 |
| 状态管理 | `zustand` | 轻量合理 |
| 表单 | `react-hook-form` + `@hookform/resolvers` + `zod` | 黄金组合 |
| 数据获取 | `@tanstack/react-query` | 合理 |
| 样式 | `tailwindcss` v4 + `tailwind-merge` + `clsx` + `class-variance-authority` | 合理 |
| 动画 | `framer-motion` | 合理 |
| 图表 | `recharts` | 合理 |
| 图标 | `lucide-react` v1.7.0 | ⚠️ 版本较旧（最新 v0.488+） |
| 国际化 | `next-intl` v4.8.3 | ⚠️ 已安装但配置不完整 |
| ORM | `@prisma/client` | 合理 |
| 认证 | `bcryptjs` + `jsonwebtoken` + `otplib` | 合理 |
| 日期 | `date-fns` v4.1.0 | 合理 |
| 文件上传 | `react-dropzone` | 合理 |
| 二维码 | `qrcode` | 合理 |

### 2.3 发现的问题

#### 🔴 高风险

1. **`next-intl` 已安装但未实际配置国际化**
   - `package.json` 中包含 `next-intl`，但项目中没有 `i18n.ts` 配置文件
   - `layout.tsx` 中 `lang="en"` 硬编码，未使用 `next-intl` 的 `Locale`
   - `src/middleware.ts` 中没有 `next-intl` 的路由中间件配置
   - **结论**：安装了一个未使用的库，增加 bundle 体积约 30KB+

2. **`lucide-react` 版本异常**
   - 当前版本 `^1.7.0`，但 npm registry 上 `lucide-react` 的最新主版本是 `0.x`（最新 v0.488+）
   - 这个版本号可能存在来源问题（可能是 fork 或 private registry）
   - 建议确认版本来源和更新策略

#### 🟡 中风险

3. **缺少 Bundle Analyzer**
   - 没有 `@next/bundle-analyzer` 或类似工具
   - 无法系统性地分析和优化 bundle 体积

4. **缺少依赖安全扫描**
   - 没有 `npm audit` 自动化
   - 没有 `snyk` / `dependabot` 配置
   - 关键安全库：`bcryptjs`、`jsonwebtoken`、`otplib` 需要持续跟踪漏洞

5. **React 19 生态兼容性风险**
   - 使用 `react@19.2.4` + `next@16.2.1`，属于前沿版本
   - 部分第三方库可能尚未完全兼容 React 19
   - 实际构建已通过，说明核心依赖兼容

#### 🟢 低风险

6. **没有重复功能的库** — 日期只用 `date-fns`，HTTP 只用 Next.js 原生 fetch，状态管理只用 `zustand`，整体依赖策略清晰。

---

## 三、构建和性能问题

### 3.1 构建配置分析

```typescript
// next.config.ts — 当前配置
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  } as any,
};
```

#### 🔴 严重问题

1. **Next.js 配置极度单薄**
   - 没有 `output: 'export'` 或 `output: 'standalone'` 配置
   - 没有 `compress: true`（虽然默认启用 gzip，但未配置 brotli）
   - 没有 `poweredByHeader: false`（安全基线）
   - 没有 `generateBuildId` 或版本化管理
   - 没有 `distDir` 自定义

2. **`as any` 类型逃逸**
   - `experimental` 配置中使用了 `as any`，说明遇到 TypeScript 类型问题
   - 这反映了配置类型的维护债务

3. **没有 Turbopack 生产构建配置**
   - `dev` 脚本使用 `--webpack`，但 Next.js 16 默认推荐 Turbopack
   - 构建输出中存在 `turbopack` 目录，说明 Turbopack 在某些场景下已被使用
   - 开发模式未使用 Turbopack 可能错失更快的 HMR

#### 🟡 中等问题

4. **Image 配置过于宽松**
   - 只配置了 `images.unsplash.com`，但实际项目中可能使用其他来源图片
   - 没有 `deviceSizes` / `imageSizes` 优化
   - 没有 `formats: ['image/avif', 'image/webp']` 配置

5. **缺少 Source Map 控制**
   - 没有配置 `productionBrowserSourceMaps`
   - 生产环境 source map 策略不明确

### 3.2 Bundle 体积分析

| 指标 | 数值 | 评估 |
|------|------|------|
| 路由总数 | 167 | — |
| 最大路由 JS (未压缩) | 1,370 KB | 🔴 严重偏大 |
| 中位路由 JS (未压缩) | 724 KB | 🟡 偏大 |
| 最小路由 JS (未压缩) | 504 KB | 🟡 偏大 |
| 路由 > 1MB | 5 个 | 🔴 需要优化 |
| 路由 > 500KB | 166 个 | 🔴 几乎所有路由 |
| 静态 chunks 总数 | ~200 个 | — |
| 静态 chunks 总大小 | ~6.2 MB | 🟡 可接受 |
| 构建输出总大小 | 834 MB | 🔴 异常庞大 |
| node_modules 大小 | 729 MB | — |

#### Bundle 体积诊断

- **所有页面最小加载都超过 500KB（未压缩）**，这意味着 gzip 后仍约 150KB+
- 5 个路由超过 1MB（未压缩），这些页面首次加载体验会很差
- 最大的 chunk `17ncjz-.4c.81.js` 约 388KB（已压缩），`17-7.4~j4.9i9.js` 约 227KB
- 834MB 的 `.next/` 目录异常庞大，包含大量 source map、trace 文件和中间产物

### 3.3 代码分割与懒加载

- **动态导入 (`next/dynamic`) 使用极少**：项目中只有 9 处 `dynamic`/`lazy`/`Suspense` 引用
- 167 个路由意味着大量页面共用同一个 chunk 策略，没有按路由细粒度分割
- `recharts` 等图表库可能被全量打包到所有页面中，即使某些页面不使用图表

### 3.4 性能优化建议（按优先级）

1. **紧急**：为 `recharts` / `framer-motion` 添加 `next/dynamic` 动态导入
2. **紧急**：配置 `output: 'standalone'` 优化 Docker 部署
3. **高**：添加 `@next/bundle-analyzer` 并分析 chunk 依赖图
4. **高**：配置 `experimental.optimizePackageImports` 对 `lucide-react` 等库做 tree-shaking
5. **中**：配置 `images.formats: ['image/avif', 'image/webp']`
6. **中**：清理 `.next/` 中的 trace 文件（生产部署不应包含 14MB+ 的 dev trace）

---

## 四、测试缺口清单

### 4.1 测试现状

| 测试类型 | 数量 | 评估 |
|----------|------|------|
| Playwright E2E 测试 | 5 个 spec 文件 | 🟡 有但覆盖不足 |
| Playwright API 测试 | 2 个 spec 文件 | 🟡 有但覆盖不足 |
| 单元测试 (Jest/Vitest) | **0** | 🔴 完全缺失 |
| 组件测试 (React Testing Library) | **0** | 🔴 完全缺失 |
| 覆盖率报告 | **0** | 🔴 完全缺失 |

### 4.2 E2E 测试分析

```
tests/
├── e2e/
│   ├── auth.spec.ts          (7.13 KB) — 认证流程
│   ├── backoffice-admin.spec.ts (6.14 KB) — 后台管理
│   ├── portal-core.spec.ts   (3.86 KB) — 门户核心
│   ├── portal-kyc.spec.ts    (3.31 KB) — KYC 流程
│   └── website.spec.ts       (2.38 KB) — 官网
└── api/
    ├── auth-api.spec.ts      (4.70 KB) — 认证 API
    └── core-api.spec.ts      (3.14 KB) — 核心 API
```

**Playwright 配置问题**：
- ✅ 有串行执行策略（`workers: 1, fullyParallel: false`），避免数据冲突
- ✅ 有 HTML + JSON 报告
- ⚠️ 硬编码了 macOS Chrome 路径（`/Applications/Google Chrome.app/...`），无法在 CI/Linux 运行
- ⚠️ 没有配置 Firefox/Safari 跨浏览器测试
- ⚠️ 没有 `testMatch` 排除规则

### 4.3 测试缺口（按严重程度排序）

| # | 缺口 | 影响 | 优先级 |
|---|------|------|--------|
| 1 | 无单元测试 | 业务逻辑、工具函数、hooks 零覆盖 | 🔴 P0 |
| 2 | 无组件测试 | 305 个 TSX 组件零覆盖 | 🔴 P0 |
| 3 | Playwright 硬编码 macOS Chrome 路径 | 无法在 CI 运行 E2E | 🔴 P0 |
| 4 | 无测试覆盖率报告 | 无法量化质量 | 🟡 P1 |
| 5 | E2E 未覆盖 portal funds/settings/trading 等核心模块 | 关键业务路径缺失 | 🟡 P1 |
| 6 | 无 API 契约测试 | 前后端接口变更无防护 | 🟡 P1 |
| 7 | 无性能测试 (Lighthouse CI) | 页面性能退化无感知 | 🟢 P2 |

---

## 五、开发体验审计

### 5.1 ESLint 配置

```javascript
// eslint.config.mjs
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
]);
```

**评估**：
- ✅ 使用 ESLint v9 Flat Config 格式（现代）
- ✅ 继承 `next/core-web-vitals` 和 `next/typescript`（合理）
- ✅ 对 `no-explicit-any` 降级为 warn（务实，渐进式严格）
- ❌ 没有 Prettier 配置
- ❌ 没有导入排序规则（`import/order`）
- ❌ 没有 unused vars / imports 自动检测

### 5.2 TypeScript 配置

```json
// tsconfig.json — 关键配置
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2017",
    "moduleResolution": "bundler",
    "incremental": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

**评估**：
- ✅ `strict: true` 已开启（严格模式）
- ✅ `target: ES2017` — 对于 Next.js 16 偏低，建议 `ES2020` 或 `ES2022`
- ✅ `incremental: true` 启用增量编译
- ✅ `paths` 别名配置正确
- ⚠️ 没有 `noUnusedLocals` / `noUnusedParameters`（未使用变量不会报错）

### 5.3 Git Hooks

- **完全缺失**：没有 `.husky/` 目录
- 没有 `lint-staged` 配置
- 没有 pre-commit / pre-push 钩子
- 代码提交无质量门禁

### 5.4 热更新与开发速度

- `dev` 使用 `--webpack` 而非默认 Turbopack
- Next.js 16 + React 19 组合中，Turbopack 的 HMR 速度比 Webpack 快约 5-10 倍
- 449 个源文件在 Webpack 下热更新可能较慢（>500ms）

---

## 六、部署与 DevOps 审计

### 6.1 容器化

| 项目 | 状态 |
|------|------|
| Dockerfile | ❌ 不存在 |
| docker-compose.yml | ❌ 不存在 |
| .dockerignore | ❌ 不存在 |

**影响**：无法做容器化部署、CI/CD 构建、本地环境一致性保障。

### 6.2 CI/CD

| 项目 | 状态 |
|------|------|
| `.github/workflows/` | ❌ 不存在 |
| GitHub Actions | ❌ 无配置 |
| 自动化测试 | ❌ 无 |
| 自动化部署 | ❌ 无 |

### 6.3 环境变量管理

```
.env (87 B)
├── DATABASE_URL="file:...dev.db"
```

**评估**：
- ❌ 只有 `.env`（没有 `.env.example` 供新开发者参考）
- ❌ 没有 `.env.local` / `.env.production` / `.env.staging` 多环境配置
- ❌ 敏感信息（JWT Secret、加密密钥等）没有独立的 secret 管理机制
- ⚠️ 使用 SQLite (`file:...dev.db`)，生产环境需要迁移到 PostgreSQL / MySQL

### 6.4 多环境配置

- 没有区分 dev / staging / prod 的构建配置
- `next.config.ts` 中没有条件配置逻辑
- Prisma 的 SQLite 配置只适合开发，没有生产数据库配置模板

---

## 七、国际化审计

### 7.1 现状

| 项目 | 状态 |
|------|------|
| i18n 库 (`next-intl`) | ✅ 已安装 |
| i18n 配置文件 | ❌ 不存在 |
| 多语言消息文件 | ❌ 不存在 |
| 路由级别的 locale 处理 | ❌ 未配置 |
| `html lang` | ⚠️ 硬编码 `en` |

### 7.2 结论

国际化处于**"库已安装但未集成"**状态。从工作记忆看，项目支持"中文、英文、印尼文三种语言切换"，但实际代码中没有实现。

---

## 八、DevOps 改进建议（按优先级）

### 🔴 P0 — 立即执行

1. **添加 Dockerfile + docker-compose.yml**
   ```dockerfile
   # 多阶段构建示例
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build

   FROM node:20-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV=production
   COPY --from=builder /app/.next/standalone ./
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **添加 `.env.example`**
   列出所有必需的环境变量，包括 `DATABASE_URL`、`JWT_SECRET`、`NEXTAUTH_SECRET` 等。

3. **修复 Playwright 配置**
   - 移除硬编码的 macOS Chrome 路径
   - 添加 `process.env.CI` 条件分支
   - 在 CI 中使用 `npx playwright install --with-deps`

4. **配置 `output: 'standalone'`**
   ```typescript
   const nextConfig: NextConfig = {
     output: 'standalone',
     poweredByHeader: false,
     compress: true,
     // ...
   };
   ```

### 🟡 P1 — 近期执行（1-2 周）

5. **引入 Vitest + React Testing Library**
   ```bash
   npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
   ```

6. **添加 Git Hooks（husky + lint-staged）**
   ```bash
   npx husky init
   npm install -D lint-staged
   ```

7. **配置 Bundle Analyzer**
   ```bash
   npm install -D @next/bundle-analyzer
   ```

8. **添加 `next/dynamic` 懒加载**
   对 `recharts`、`framer-motion`、大型表单组件使用动态导入。

9. **配置 `experimental.optimizePackageImports`**
   ```typescript
   experimental: {
     optimizePackageImports: ['lucide-react', 'recharts', '@radix-ui/react-icons'],
   }
   ```

10. **创建 GitHub Actions CI 工作流**
    - Lint 检查
    - TypeScript 类型检查
    - 构建验证
    - Playwright E2E 测试（可选，视 CI 资源而定）

### 🟢 P2 — 中期执行（1 个月内）

11. **升级 `target: "ES2022"`** 以利用现代 JavaScript 特性
12. **配置 Lighthouse CI** 监控 Core Web Vitals
13. **引入 `npm audit` 自动化** 或 Snyk/Dependabot
14. **完成 `next-intl` 国际化集成** 或决定移除未使用的依赖
15. **配置生产数据库迁移策略**（从 SQLite 迁移到 PostgreSQL）
16. **添加 `noUnusedLocals` 和 `noUnusedParameters`** 到 tsconfig

---

## 九、数据汇总

| 指标 | 数值 |
|------|------|
| 项目版本 | v1.7.0 |
| Next.js 版本 | 16.2.1 |
| React 版本 | 19.2.4 |
| TypeScript 版本 | ^5 |
| Tailwind CSS 版本 | v4 |
| 页面路由数 | 167 |
| TSX 组件数 | 305 |
| TS 模块数 | 144 |
| 源文件总数 | 449 |
| 生产依赖数 | 34 |
| 开发依赖数 | 14 |
| E2E 测试文件 | 5 |
| API 测试文件 | 2 |
| 单元测试文件 | 0 |
| Dockerfile | ❌ |
| CI/CD 配置 | ❌ |
| Bundle (最大路由) | 1,370 KB |
| Bundle (中位路由) | 724 KB |
| 构建输出大小 | 834 MB |

---

*报告由 devops-audit 生成 | 团队：tradepass-audit*
