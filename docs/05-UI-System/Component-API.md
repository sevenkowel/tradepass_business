# Component API 规范

> 所有 UI 组件的统一 API 设计规范

## 通用 Props 约定

### 基础 Props

每个组件都应支持以下基础 Props：

```ts
interface BaseProps {
  className?: string;      // 自定义类名
  style?: CSSProperties;   // 自定义样式
  children?: ReactNode;    // 子元素
}
```

### 变体 Props

```ts
interface VariantProps {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}
```

### 状态 Props

```ts
interface StateProps {
  disabled?: boolean;      // 禁用状态
  loading?: boolean;       // 加载状态
  error?: boolean;         // 错误状态
}
```

---

## 基础组件

### Button 按钮

```tsx
import { Button } from "@/components/ui";

<Button
  variant="primary"      // 变体: default | primary | secondary | destructive | ghost | outline | link
  size="md"              // 尺寸: sm | md | lg | icon
  disabled={false}       // 禁用
  loading={false}        // 加载状态
  onClick={handleClick}  // 点击事件
>
  按钮文字
</Button>
```

**Props:**

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | `ButtonVariant` | `'default'` | 按钮样式变体 |
| size | `ButtonSize` | `'md'` | 按钮尺寸 |
| asChild | `boolean` | `false` | 是否使用子元素作为按钮 |
| disabled | `boolean` | `false` | 禁用状态 |
| loading | `boolean` | `false` | 加载状态（显示 spinner） |

---

### Card 卡片

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui";

<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
    <CardDescription>卡片描述文字</CardDescription>
  </CardHeader>
  <CardContent>内容区域</CardContent>
  <CardFooter>底部操作区</CardFooter>
</Card>
```

**Props:**

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | `'default' \| 'outline' \| 'ghost'` | `'default'` | 卡片样式 |
| padding | `'none' \| 'sm' \| 'md' \| 'lg'` | `'md'` | 内边距大小 |

---

### Input 输入框

```tsx
import { Input } from "@/components/ui";

<Input
  type="text"            // 类型: text | email | password | number | tel | url
  placeholder="提示文字"
  value={value}
  onChange={handleChange}
  error={errorMessage}   // 错误提示
  disabled={false}
  size="md"              // sm | md | lg
/>
```

**Props:**

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | `InputType` | `'text'` | 输入类型 |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | 尺寸 |
| error | `string \| boolean` | - | 错误状态/消息 |
| startIcon | `ReactNode` | - | 左侧图标 |
| endIcon | `ReactNode` | - | 右侧图标 |

---

### Label 标签

```tsx
import { Label } from "@/components/ui";

<Label htmlFor="email" required>邮箱地址</Label>
```

**Props:**

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| required | `boolean` | `false` | 是否必填（显示红星） |
| disabled | `boolean` | `false` | 禁用样式 |

---

### Select 选择器

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui";

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="请选择" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">选项 1</SelectItem>
    <SelectItem value="option2">选项 2</SelectItem>
  </SelectContent>
</Select>
```

---

### Dialog 对话框

```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui";

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>打开对话框</Button>
  </DialogTrigger>
  <DialogContent size="md">  {/* sm | md | lg | full */}
    <DialogHeader>
      <DialogTitle>对话框标题</DialogTitle>
      <DialogDescription>对话框描述</DialogDescription>
    </DialogHeader>
    <div>内容区域</div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>取消</Button>
      <Button onClick={handleConfirm}>确认</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Props:**

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| size | `'sm' \| 'md' \| 'lg' \| 'full'` | `'md'` | 对话框尺寸 |
| showClose | `boolean` | `true` | 显示关闭按钮 |
| overlay | `boolean` | `true` | 显示遮罩层 |

---

### Toast 轻提示

```tsx
import { toast } from "@/components/ui";

// 使用 toast 函数
toast({
  title: "操作成功",
  description: "数据已保存",
  variant: "success",    // success | error | warning | info
  duration: 3000,        // 显示时长（毫秒）
});

// 快捷方法
toast.success("保存成功");
toast.error("操作失败");
toast.warning("请注意");
toast.info("提示信息");
```

---

### Badge 徽章

```tsx
import { Badge } from "@/components/ui";

<Badge variant="default">默认</Badge>
<Badge variant="primary">主要</Badge>
<Badge variant="success">成功</Badge>
<Badge variant="warning">警告</Badge>
<Badge variant="error">错误</Badge>
<Badge variant="outline">描边</Badge>
```

**Props:**

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | `BadgeVariant` | `'default'` | 徽章样式 |
| size | `'sm' \| 'md'` | `'md'` | 尺寸 |
| dot | `boolean` | `false` | 显示状态点 |

---

### Avatar 头像

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui";

<Avatar size="md">  {/* xs | sm | md | lg | xl */}
  <AvatarImage src="/avatar.jpg" alt="用户名" />
  <AvatarFallback>UN</AvatarFallback>
</Avatar>
```

**Props:**

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| size | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | 尺寸 |
| shape | `'circle' \| 'square'` | `'circle'` | 形状 |

---

### Tooltip 文字提示

```tsx
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui";

<Tooltip>
  <TooltipTrigger>
    <Button>悬停查看</Button>
  </TooltipTrigger>
  <TooltipContent side="top" align="center">
    提示内容
  </TooltipContent>
</Tooltip>
```

**Props:**

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| side | `'top' \| 'right' \| 'bottom' \| 'left'` | `'top'` | 显示位置 |
| align | `'start' \| 'center' \| 'end'` | `'center'` | 对齐方式 |
| delay | `number` | `200` | 延迟显示（毫秒） |

---

### Tabs 标签页

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui";

<Tabs defaultValue="tab1" onValueChange={setTab}>
  <TabsList>
    <TabsTrigger value="tab1">标签 1</TabsTrigger>
    <TabsTrigger value="tab2">标签 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">内容 1</TabsContent>
  <TabsContent value="tab2">内容 2</TabsContent>
</Tabs>
```

---

### Checkbox 复选框

```tsx
import { Checkbox } from "@/components/ui";

<Checkbox
  checked={checked}
  onCheckedChange={setChecked}
  disabled={false}
  indeterminate={false}  // 半选状态
/>
```

---

### Switch 开关

```tsx
import { Switch } from "@/components/ui";

<Switch
  checked={checked}
  onCheckedChange={setChecked}
  disabled={false}
  size="md"  // sm | md
/>
```

---

### Textarea 多行文本

```tsx
import { Textarea } from "@/components/ui";

<Textarea
  placeholder="请输入内容"
  rows={4}
  maxLength={500}
  showCount={true}  // 显示字数统计
  resize="vertical" // none | vertical | horizontal | both
/>
```

---

### Radio Group 单选组

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui";

<RadioGroup value={value} onValueChange={setValue}>
  <RadioGroupItem value="option1">选项 1</RadioGroupItem>
  <RadioGroupItem value="option2">选项 2</RadioGroupItem>
</RadioGroup>
```

---

## 数据展示组件

### DataTable 数据表格

```tsx
import { DataTable } from "@/components/backoffice/ui";

<DataTable
  columns={columns}
  data={data}
  pagination={{
    page: 1,
    pageSize: 10,
    total: 100,
    onChange: (page, pageSize) => {}
  }}
  sorting={{
    sortField: 'name',
    sortOrder: 'asc',
    onChange: (field, order) => {}
  }}
  loading={false}
  emptyText="暂无数据"
  onRowClick={(record) => {}}
  rowSelection={{
    selectedRowKeys,
    onChange: setSelectedRowKeys
  }}
/>
```

---

### StatusBadge 状态徽章

```tsx
import { StatusBadge } from "@/components/backoffice/ui";

<StatusBadge status="success">已通过</StatusBadge>
<StatusBadge status="pending">待审核</StatusBadge>
<StatusBadge status="error">已拒绝</StatusBadge>
<StatusBadge status="warning">警告</StatusBadge>
```

---

## 反馈组件

### Alert 警告提示

```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui";

<Alert variant="info">  // info | success | warning | error
  <AlertTitle>提示</AlertTitle>
  <AlertDescription>这是一条提示信息</AlertDescription>
</Alert>
```

---

### Skeleton 骨架屏

```tsx
import { Skeleton } from "@/components/ui";

<Skeleton className="h-4 w-[250px]" />  {/* 自定义尺寸 */}
<Skeleton circle className="h-12 w-12" />  {/* 圆形 */}

// 组合使用
<div className="space-y-2">
  <Skeleton className="h-4 w-[250px]" />
  <Skeleton className="h-4 w-[200px]" />
</div>
```

---

### Progress 进度条

```tsx
import { Progress } from "@/components/ui";

<Progress value={60} max={100} size="md" showValue />
```

---

## 导航组件

### Breadcrumb 面包屑

```tsx
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui";

<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href="/">首页</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem>
    <BreadcrumbLink href="/users">用户管理</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbSeparator />
  <BreadcrumbItem isCurrentPage>用户详情</BreadcrumbItem>
</Breadcrumb>
```

---

### Pagination 分页

```tsx
import { Pagination } from "@/components/ui";

<Pagination
  current={1}
  pageSize={10}
  total={100}
  onChange={(page, pageSize) => {}}
  showSizeChanger={true}
  showQuickJumper={true}
  showTotal={(total) => `共 ${total} 条`}
/>
```

---

## 布局组件

### PageHeader 页面头部

```tsx
import { PageHeader } from "@/components/backoffice/ui";

<PageHeader
  title="页面标题"
  description="页面描述文字"
  breadcrumb={breadcrumbItems}
  actions={[
    <Button key="1">操作 1</Button>,
    <Button key="2" variant="primary">主要操作</Button>
  ]}
/>
```

---

### FilterBar 筛选栏

```tsx
import { FilterBar } from "@/components/backoffice/ui";

<FilterBar
  filters={[
    { type: 'input', name: 'keyword', placeholder: '搜索关键词' },
    { type: 'select', name: 'status', options: statusOptions },
    { type: 'date-range', name: 'date', label: '日期范围' },
  ]}
  onSearch={(values) => {}}
  onReset={() => {}}
/>
```

---

## 命名规范

### 文件命名

- 组件文件：kebab-case（如 `data-table.tsx`）
- 类型文件：`.types.ts` 后缀
- 测试文件：`.test.tsx` 后缀
- 样式文件：`.styles.ts`（如需单独样式）

### 组件命名

- React 组件：PascalCase
- 类型/接口：PascalCase + 后缀（如 `ButtonProps`）
- Hook：camelCase + `use` 前缀（如 `useToast`）

### Props 命名

- 布尔值：使用肯定语气（如 `disabled` 而非 `isDisabled`）
- 事件处理：`on` + 动词（如 `onClick`, `onChange`）
- 回调函数：`handle` + 动作（如 `handleSubmit`）

---

## 类型定义

```ts
// 组件 Props 统一导出
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  asChild?: boolean;
  loading?: boolean;
}

// 变体类型
export type ButtonVariant = NonNullable<ButtonProps['variant']>;
export type ButtonSize = NonNullable<ButtonProps['size']>;
```
