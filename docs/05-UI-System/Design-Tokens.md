# Design Tokens

> TradePass 设计变量规范

## 颜色系统

### 品牌色 Brand Colors

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-primary` | `#1E40AF` | 主按钮、链接、重点强调 |
| `--color-primary-light` | `#3B82F6` | Hover 状态、次要强调 |
| `--color-primary-dark` | `#1E3A8A` | Active 状态、深色背景 |

### 语义色 Semantic Colors

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-success` | `#10B981` | 成功状态、正向数据 |
| `--color-success-light` | `#34D399` | 成功 Hover |
| `--color-error` | `#EF4444` | 错误状态、删除操作 |
| `--color-error-light` | `#F87171` | 错误 Hover |
| `--color-warning` | `#F59E0B` | 警告状态、需注意 |
| `--color-warning-light` | `#FBBF24` | 警告 Hover |
| `--color-info` | `#3B82F6` | 信息提示、中性强调 |
| `--color-info-light` | `#60A5FA` | 信息 Hover |

### 中性色 Neutral Colors

| Token | 值 | 用途 |
|-------|-----|------|
| `--color-gray-25` | `#FAFAFA` | 最浅背景 |
| `--color-gray-50` | `#F5F7FA` | 页面背景 |
| `--color-gray-100` | `#F3F4F6` | 卡片背景、分隔线 |
| `--color-gray-200` | `#E5E7EB` | 边框、分割线 |
| `--color-gray-300` | `#D1D5DB` | 禁用状态边框 |
| `--color-gray-400` | `#9CA3AF` | 占位符文字 |
| `--color-gray-500` | `#6B7280` | 次要文字 |
| `--color-gray-600` | `#4B5563` | 辅助文字 |
| `--color-gray-700` | `#374151` | 正文文字 |
| `--color-gray-800` | `#1F2937` | 标题文字 |
| `--color-gray-900` | `#111827` | 最深文字 |

### shadcn/ui 兼容变量

```css
--background: #F5F7FA;        /* 页面背景 */
--foreground: #1F2937;        /* 主要文字 */
--card: #FFFFFF;              /* 卡片背景 */
--card-foreground: #1F2937;   /* 卡片文字 */
--popover: #FFFFFF;           /* 弹出层背景 */
--popover-foreground: #1F2937;
--primary: #1E40AF;           /* 主色 */
--primary-foreground: #FFFFFF;
--secondary: #F3F4F6;         /* 次要背景 */
--secondary-foreground: #1F2937;
--muted: #F3F4F6;             /* 静音背景 */
--muted-foreground: #6B7280;  /* 静音文字 */
--accent: #EFF6FF;            /* 强调背景 */
--accent-foreground: #1E40AF;
--destructive: #EF4444;       /* 危险色 */
--destructive-foreground: #FFFFFF;
--border: #E5E7EB;            /* 边框 */
--input: #E5E7EB;             /* 输入框边框 */
--ring: #1E40AF;              /* 焦点环 */
--radius: 0.5rem;             /* 默认圆角 */
```

## 间距系统 Spacing

| Token | 值 | 用途 |
|-------|-----|------|
| `--space-xs` | `4px` | 图标内边距、紧凑间距 |
| `--space-sm` | `8px` | 小组件间距、行内间距 |
| `--space-md` | `16px` | 标准间距、卡片内边距 |
| `--space-lg` | `24px` | 大组件间距、Section 间距 |
| `--space-xl` | `32px` | 页面级间距 |
| `--space-2xl` | `48px` | 大区块间距 |
| `--space-3xl` | `64px` | 页面 Section 间距 |
| `--space-4xl` | `96px` | Hero 区域间距 |
| `--space-5xl` | `128px` | 超大间距 |

## 圆角系统 Radius

| Token | 值 | 用途 |
|-------|-----|------|
| `--radius-sm` | `8px` | 小按钮、标签 |
| `--radius-md` | `10px` | 标准按钮、输入框 |
| `--radius-lg` | `12px` | 卡片、弹窗 |
| `--radius-xl` | `16px` | 大卡片、Modal |
| `--radius-full` | `9999px` | 圆形、Pill 形状 |

## 阴影系统 Shadows

| Token | 值 | 用途 |
|-------|-----|------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 轻微提升 |
| `--shadow-card` | `0 1px 3px rgba(0,0,0,0.08)` | 卡片默认 |
| `--shadow-card-hover` | `0 4px 12px rgba(0,0,0,0.1)` | 卡片 Hover |
| `--shadow-dropdown` | `0 4px 6px -1px rgba(0,0,0,0.1)` | 下拉菜单 |
| `--shadow-modal` | `0 10px 25px -5px rgba(0,0,0,0.1)` | 弹窗 |
| `--shadow-lg` | `0 20px 25px -5px rgba(0,0,0,0.1)` | 大阴影 |

## 字体系统 Typography

### 字体族

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
--font-heading: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
--font-mono: 'SF Mono', 'JetBrains Mono', monospace;
```

### 字体大小

| Token | 值 | 用途 |
|-------|-----|------|
| `--text-xs` | `12px` | 标签、辅助文字 |
| `--text-sm` | `14px` | 正文、按钮 |
| `--text-base` | `16px` | 标准正文 |
| `--text-lg` | `18px` | 大正文 |
| `--text-xl` | `20px` | 小标题 |
| `--text-2xl` | `24px` | 标题 H4 |
| `--text-3xl` | `30px` | 标题 H3 |
| `--text-4xl` | `36px` | 标题 H2 |
| `--text-5xl` | `48px` | 标题 H1 |

### 字重

| Token | 值 | 用途 |
|-------|-----|------|
| `--font-normal` | `400` | 正文 |
| `--font-medium` | `500` | 按钮、标签 |
| `--font-semibold` | `600` | 标题、强调 |
| `--font-bold` | `700` | 大标题、数字 |

### 行高

| Token | 值 | 用途 |
|-------|-----|------|
| `--leading-tight` | `1.25` | 标题 |
| `--leading-snug` | `1.375` | 紧凑正文 |
| `--leading-normal` | `1.5` | 标准正文 |
| `--leading-relaxed` | `1.625` | 宽松正文 |

## 过渡动画 Transitions

| Token | 值 | 用途 |
|-------|-----|------|
| `--transition-fast` | `150ms ease-in-out` | 快速反馈 |
| `--transition-base` | `200ms ease-in-out` | 标准过渡 |
| `--transition-slow` | `300ms ease-in-out` | 慢速过渡 |

## 响应式断点

| Token | 值 | 用途 |
|-------|-----|------|
| `sm` | `640px` | 小屏手机 |
| `md` | `768px` | 平板 |
| `lg` | `1024px` | 小桌面 |
| `xl` | `1280px` | 标准桌面 |
| `2xl` | `1536px` | 大桌面 |

## 使用示例

```tsx
// Tailwind 类名使用
<div className="bg-primary text-white px-md py-sm rounded-lg shadow-card">
  按钮内容
</div>

// CSS 变量使用（自定义样式）
<div style={{ 
  backgroundColor: 'var(--color-primary)',
  padding: 'var(--space-md)',
  borderRadius: 'var(--radius-lg)'
}}>
  自定义组件
</div>
```

## 暗色模式

暗色模式通过 `[data-theme="dark"]` 属性切换，所有颜色变量会自动适配。

```tsx
// 组件中使用
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  自适应内容
</div>
```
