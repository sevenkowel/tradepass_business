# KYC + Fund 系统开发任务清单

**版本**: v1.0  
**日期**: 2026-04-03  
**预计工时**: 55 小时（7 工作日）

---

## 📋 任务总览

| 模块 | 任务数 | 预计工时 |
|------|--------|----------|
| KYC Core | 8 | 27h |
| Fund | 7 | 22h |
| 集成测试 | 1 | 6h |
| **总计** | **16** | **55h** |

---

## 🔐 KYC 身份认证系统

### K1: 地区化配置中心设计
**工时**: 3h  
**依赖**: -  
**负责人**: 前端 + 后端

- [ ] 设计 RegionKYCConfig 数据模型
- [ ] 创建 9 个地区的配置数据（VN/TH/IN/AE/KR/JP/FR/ES/BR）
- [ ] 实现配置 API (`GET /api/kyc/config?region=VN`)
- [ ] 前端配置缓存机制

**输出文件**:
- `src/lib/kyc/region-config.ts`
- `src/app/api/kyc/config/route.ts`

---

### K2: KYC 状态机 & 数据模型
**工时**: 3h  
**依赖**: K1  
**负责人**: 后端

- [ ] 设计 UserKYC 数据表
- [ ] 设计 KYCDocument 数据表
- [ ] 实现 KYC 状态机（not_started → document_uploaded → ... → approved）
- [ ] 创建数据库迁移文件

**数据表结构**:
```typescript
// UserKYC
{
  id: string;
  userId: string;
  regionCode: string;
  status: KYCStatus;
  currentStep: number;
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  confidence?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**输出文件**:
- `prisma/schema.prisma` (更新)
- `src/lib/kyc/types.ts`

---

### K3: eKYC 服务接口设计（Mock）
**工时**: 2h  
**依赖**: -  
**负责人**: 后端

- [ ] 设计 OCR 接口（Mock）
- [ ] 设计活体检测接口（Mock）
- [ ] 设计审核结果接口（Mock）
- [ ] 实现 Mock 服务（随机返回 approved/manual_review/rejected）

**API 列表**:
- `POST /api/kyc/ocr` - OCR 识别
- `POST /api/kyc/liveness` - 活体检测
- `POST /api/kyc/submit` - 提交审核

**输出文件**:
- `src/lib/kyc/mock-service.ts`
- `src/app/api/kyc/ocr/route.ts`
- `src/app/api/kyc/liveness/route.ts`

---

### K4: 步骤1 - 证件上传 + OCR 识别
**工时**: 5h  
**依赖**: K2, K3  
**负责人**: 前端 + 后端

- [ ] 创建证件类型选择 UI
- [ ] 实现文件上传组件（支持拖拽、预览）
- [ ] 实现证件正反面上传
- [ ] 集成 OCR API
- [ ] 实现 OCR 结果展示和编辑
- [ ] 实现进度保存（断点续传）

**页面**:
- `/portal/kyc/document`

**输出文件**:
- `src/components/kyc/DocumentUpload.tsx`
- `src/components/kyc/OCRResultEditor.tsx`

---

### K5: 步骤2 - 活体识别
**工时**: 3h  
**依赖**: K2, K3  
**负责人**: 前端

- [ ] 集成摄像头调用
- [ ] 实现眨眼检测 UI
- [ ] 实现摇头检测 UI
- [ ] 实现倒计时和进度提示
- [ ] 实现重试机制（最多 3 次）
- [ ] 根据地区配置判断是否显示此步骤

**页面**:
- `/portal/kyc/liveness`

**输出文件**:
- `src/components/kyc/LivenessCheck.tsx`

---

### K6: 步骤3 - 动态个人信息表单
**工时**: 6h  
**依赖**: K1, K2  
**负责人**: 前端

- [ ] 实现动态表单渲染（根据地区配置）
- [ ] 基础信息表单（姓名、出生日期等）
- [ ] 教育背景表单
- [ ] 投资经验表单
- [ ] 财务状况表单
- [ ] 声明勾选（美国人/PEP/军队/专业）
- [ ] 表单验证（Zod schema）

**页面**:
- `/portal/kyc/personal-info`

**输出文件**:
- `src/components/kyc/PersonalInfoForm.tsx`
- `src/lib/kyc/form-schemas.ts`

---

### K7: 步骤4 - 协议签署
**工时**: 2h  
**依赖**: -  
**负责人**: 前端

- [ ] 实现协议展示组件
- [ ] 实现滚动阅读检测
- [ ] 实现勾选确认
- [ ] 实现电子签名（输入姓名）

**页面**:
- `/portal/kyc/agreements`

**输出文件**:
- `src/components/kyc/AgreementSign.tsx`

---

### K8: KYC 状态管理 & 流程引擎
**工时**: 5h  
**依赖**: K4-K7  
**负责人**: 前端 + 后端

- [ ] 实现 KYC 状态管理（Context/Zustand）
- [ ] 实现步骤导航和进度条
- [ ] 实现步骤守卫（未完成的步骤不能跳过）
- [ ] 实现提交审核 API
- [ ] 实现审核状态查询
- [ ] 实现审核结果通知

**页面**:
- `/portal/kyc` - KYC 主页
- `/portal/kyc/status` - 审核状态页

**输出文件**:
- `src/lib/kyc/store.ts`
- `src/app/portal/kyc/page.tsx`
- `src/app/portal/kyc/status/page.tsx`

---

## 💰 Fund 资金管理系统

### F1: Fund 路由重构 & 菜单更新
**工时**: 2h  
**依赖**: -  
**负责人**: 前端

- [ ] 更新 PortalSidebar 菜单（Wallet → Fund）
- [ ] 创建新的路由结构
- [ ] 实现旧路由 301 重定向
- [ ] 更新面包屑导航

**新路由**:
```
/portal/fund                    → 钱包概览
/portal/fund/deposit           → 存款
/portal/fund/withdraw          → 取款
/portal/fund/transfer          → 转账
/portal/fund/history           → 资金记录
/portal/fund/accounts          → 收付款账户
```

**输出文件**:
- `src/components/portal/layout/PortalSidebar.tsx` (更新)
- `src/app/portal/fund/` 目录结构

---

### F2: 钱包概览页面
**工时**: 3h  
**依赖**: F1  
**负责人**: 前端

- [ ] 实现总资产卡片
- [ ] 实现多币种余额列表
- [ ] 实现交易账户卡片
- [ ] 实现最近交易快捷入口
- [ ] 实现快速操作按钮

**页面**:
- `/portal/fund`

**输出文件**:
- `src/app/portal/fund/page.tsx`
- `src/components/fund/WalletOverview.tsx`

---

### F3: 存款页面（多支付方式）
**工时**: 6h  
**依赖**: F1  
**负责人**: 前端 + 后端

- [ ] 实现支付方式选择 UI
- [ ] 加密货币存款（地址生成、二维码）
- [ ] 银行卡存款（表单、3DS 跳转）
- [ ] 电汇存款（银行信息显示）
- [ ] 信用卡存款
- [ ] 电子钱包存款
- [ ] 实现目标账户选择

**页面**:
- `/portal/fund/deposit`

**输出文件**:
- `src/app/portal/fund/deposit/page.tsx`
- `src/components/fund/deposit/CryptoDeposit.tsx`
- `src/components/fund/deposit/CardDeposit.tsx`
- `src/components/fund/deposit/BankTransfer.tsx`

---

### F4: 取款页面
**工时**: 4h  
**依赖**: F1  
**负责人**: 前端 + 后端

- [ ] 实现取款方式选择
- [ ] 实现已绑定账户选择
- [ ] 实现金额输入和验证
- [ ] 实现资金来源选择
- [ ] 实现 2FA 验证
- [ ] 实现取款申请提交

**页面**:
- `/portal/fund/withdraw`

**输出文件**:
- `src/app/portal/fund/withdraw/page.tsx`
- `src/components/fund/withdraw/WithdrawForm.tsx`

---

### F5: 转账功能（账户间）
**工时**: 4h  
**依赖**: F1  
**负责人**: 前端 + 后端

- [ ] 实现转出账户选择
- [ ] 实现转入账户选择
- [ ] 实现金额输入
- [ ] 实现币种转换显示
- [ ] 实现转账确认
- [ ] 实现即时到账反馈

**页面**:
- `/portal/fund/transfer`

**输出文件**:
- `src/app/portal/fund/transfer/page.tsx`
- `src/components/fund/transfer/TransferForm.tsx`

---

### F6: 资金记录页面
**工时**: 3h  
**依赖**: F1  
**负责人**: 前端

- [ ] 实现交易列表
- [ ] 实现筛选功能（类型/状态/时间/币种）
- [ ] 实现分页加载
- [ ] 实现交易详情弹窗
- [ ] 实现凭证下载

**页面**:
- `/portal/fund/history`

**输出文件**:
- `src/app/portal/fund/history/page.tsx`
- `src/components/fund/history/TransactionList.tsx`

---

### F7: 收付款账户管理
**工时**: 4h  
**依赖**: F1  
**负责人**: 前端 + 后端

- [ ] 实现账户列表展示
- [ ] 实现添加银行账户表单
- [ ] 实现小额验证流程
- [ ] 实现添加加密货币地址
- [ ] 实现设为默认功能
- [ ] 实现删除账户功能

**页面**:
- `/portal/fund/accounts`

**输出文件**:
- `src/app/portal/fund/accounts/page.tsx`
- `src/components/fund/accounts/PaymentAccountList.tsx`
- `src/components/fund/accounts/AddBankAccount.tsx`
- `src/components/fund/accounts/AddCryptoAddress.tsx`

---

## 🧪 集成测试

### T1: 端到端测试
**工时**: 6h  
**依赖**: K1-K8, F1-F7  
**负责人**: 测试

- [ ] KYC 完整流程测试（9 个地区）
- [ ] Fund 存款/取款/转账测试
- [ ] 移动端兼容性测试
- [ ] 性能测试（加载速度）
- [ ] 安全测试（2FA、风控）

**输出**:
- 测试报告
- Bug 修复

---

## 📅 开发计划

### Week 1
| 日期 | 任务 | 工时 |
|------|------|------|
| Day 1 | K1, K2, K3 | 8h |
| Day 2 | K4 | 5h |
| Day 3 | K5, K6 | 9h |
| Day 4 | K7, K8 | 7h |
| Day 5 | F1, F2, F3 | 11h |

### Week 2
| 日期 | 任务 | 工时 |
|------|------|------|
| Day 6 | F4, F5 | 8h |
| Day 7 | F6, F7, T1 | 13h |

---

## ✅ 验收标准

### KYC 系统
- [ ] 9 个地区的配置可正常加载
- [ ] 证件上传和 OCR 识别正常
- [ ] 活体检测（眨眼、摇头）正常
- [ ] 动态表单根据地区正确渲染
- [ ] 协议签署和提交审核正常
- [ ] 审核状态可正确查询

### Fund 系统
- [ ] 菜单显示为 Fund，旧路由可重定向
- [ ] 钱包概览显示正确
- [ ] 5 种存款方式可正常选择
- [ ] 取款流程完整（含 2FA）
- [ ] 转账即时到账
- [ ] 资金记录可筛选和查看详情
- [ ] 收付款账户可正常管理

---

## 📁 相关文档

- [KYC-PRD.md](../01-Product/KYC-PRD.md)
- [Fund-PRD.md](../01-Product/Fund-PRD.md)
- [KYC-TestCases.md](../01-Product/KYC-TestCases.md)
- [Fund-TestCases.md](../01-Product/Fund-TestCases.md)
- [KYC-Region-Config.md](KYC-Region-Config.md)
