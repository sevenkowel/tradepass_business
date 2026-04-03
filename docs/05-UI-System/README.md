# TradePass UI 组件规范

> 统一 Portal 和 Backoffice 两端的 UI 设计系统

## 设计原则

1. **一致性** - 相同功能使用相同组件，相同交互保持一致
2. **清晰性** - 视觉层次分明，信息传达明确
3. **效率性** - 减少用户操作步骤，提供快捷方式
4. **可访问性** - 符合 WCAG 2.1 AA 标准

## 文档结构

- [Design Tokens](./Design-Tokens.md) - 颜色、间距、字体、圆角等设计变量
- [Component API](./Component-API.md) - 所有组件的 API 规范
- [Usage Guidelines](./Usage-Guidelines.md) - 组件使用场景和最佳实践
- [Migration Guide](./Migration-Guide.md) - 存量代码迁移指南

## 快速开始

```tsx
// 基础组件
import { Button, Card, Input, Dialog } from "@/components/ui";

// Backoffice 业务组件
import { DataTable, PageHeader, StatusBadge } from "@/components/backoffice/ui";

// Portal 业务组件
import { AccountCard, TradePanel } from "@/components/portal/ui";
```

## 技术栈

- **Tailwind CSS v4** - 原子化样式
- **Radix UI** - Headless 组件基础
- **Lucide React** - 图标库
- **Framer Motion** - 动画（可选）

---

*版本: v1.0.0 | 最后更新: 2026-04-03*
