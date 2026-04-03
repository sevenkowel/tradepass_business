# Usage Guidelines

> TradePass UI 组件使用指南

## 快速开始

### 1. 安装依赖

```bash
npm install @radix-ui/react-dialog @radix-ui/react-toast @radix-ui/react-tooltip @radix-ui/react-avatar @radix-ui/react-switch @radix-ui/react-radio-group class-variance-authority
```

### 2. 添加 Toast Provider

在 `app/layout.tsx` 中添加 ToastContextProvider：

```tsx
import { ToastContextProvider } from "@/components/ui"

export default function RootLayout({ children }) {
  return (
    <ToastContextProvider>
      {children}
    </ToastContextProvider>
  )
}
```

### 3. 使用组件

```tsx
import { Button, Card, Input, Dialog, toast } from "@/components/ui"

export default function Page() {
  return (
    <Card>
      <Input placeholder="请输入" />
      <Button onClick={() => toast.success("操作成功")}>
        提交
      </Button>
    </Card>
  )
}
```

---

## 组件使用示例

### Button 按钮

```tsx
// 变体
<Button variant="primary">主要按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="outline">描边按钮</Button>
<Button variant="ghost">幽灵按钮</Button>
<Button variant="destructive">危险按钮</Button>

// 尺寸
<Button size="sm">小按钮</Button>
<Button size="md">中按钮</Button>
<Button size="lg">大按钮</Button>

// 状态
<Button loading>加载中</Button>
<Button disabled>禁用</Button>

// 图标按钮
<Button size="icon">
  <Plus className="h-4 w-4" />
</Button>
```

### Card 卡片

```tsx
<Card>
  <CardHeader>
    <CardTitle>卡片标题</CardTitle>
    <CardDescription>卡片描述</CardDescription>
  </CardHeader>
  <CardContent>
    内容区域
  </CardContent>
  <CardFooter className="flex justify-end gap-2">
    <Button variant="outline">取消</Button>
    <Button>确认</Button>
  </CardFooter>
</Card>
```

### Form 表单

```tsx
<form onSubmit={handleSubmit}>
  <div className="space-y-4">
    <div>
      <Label htmlFor="email" required>邮箱</Label>
      <Input 
        id="email" 
        type="email" 
        placeholder="请输入邮箱"
        error={errors.email}
      />
    </div>
    
    <div>
      <Label htmlFor="bio">简介</Label>
      <Textarea 
        id="bio" 
        rows={4} 
        maxLength={200}
        showCount
      />
    </div>
    
    <div className="flex items-center gap-2">
      <Switch id="subscribe" />
      <Label htmlFor="subscribe">订阅邮件</Label>
    </div>
    
    <Button type="submit">提交</Button>
  </div>
</form>
```

### Dialog 对话框

```tsx
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>打开对话框</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>确认删除</DialogTitle>
      <DialogDescription>
        此操作不可撤销，确定要删除吗？
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>
        取消
      </Button>
      <Button variant="destructive" onClick={handleDelete}>
        删除
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Toast 轻提示

```tsx
import { useToast } from "@/components/ui"

function MyComponent() {
  const { success, error, warning, info } = useToast()
  
  return (
    <>
      <Button onClick={() => success("保存成功")}>
        成功提示
      </Button>
      <Button onClick={() => error("操作失败")}>
        错误提示
      </Button>
      <Button onClick={() => warning("请注意")}>
        警告提示
      </Button>
      <Button onClick={() => info("提示信息")}>
        信息提示
      </Button>
      <Button onClick={() => toast.custom({ 
        title: "自定义", 
        description: "详细内容",
        variant: "success",
        duration: 5000 
      })}>
        自定义
      </Button>
    </>
  )
}
```

### DataTable 数据表格

```tsx
import { DataTable } from "@/components/backoffice/ui"

const columns = [
  { key: 'name', title: '姓名', sortable: true },
  { key: 'email', title: '邮箱' },
  { 
    key: 'status', 
    title: '状态',
    render: (row) => <Badge variant={row.status === 'active' ? 'success' : 'default'}>{row.status}</Badge>
  },
]

<DataTable
  columns={columns}
  data={users}
  keyExtractor={(row) => row.id}
  pagination={{
    page: 1,
    pageSize: 10,
    total: 100,
    onChange: (page, pageSize) => {}
  }}
  rowSelection={{
    selectedRowKeys,
    onChange: setSelectedRowKeys
  }}
/>
```

### StatusBadge 状态徽章

```tsx
import { StatusBadge } from "@/components/backoffice/ui"

<StatusBadge status="success">已通过</StatusBadge>
<StatusBadge status="pending">待审核</StatusBadge>
<StatusBadge status="error">已拒绝</StatusBadge>
<StatusBadge status="warning">警告</StatusBadge>
```

---

## 最佳实践

### 1. 表单验证

```tsx
const [errors, setErrors] = useState<Record<string, string>>({})

const validate = () => {
  const newErrors: Record<string, string> = {}
  if (!email) newErrors.email = "邮箱不能为空"
  if (!password) newErrors.password = "密码不能为空"
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

<Input 
  value={email} 
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
/>
```

### 2. 加载状态

```tsx
const [loading, setLoading] = useState(false)

<Button loading={loading} onClick={handleSubmit}>
  提交
</Button>

// 或骨架屏
{loading ? (
  <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
  </div>
) : (
  <Content />
)}
```

### 3. 空状态处理

```tsx
{data.length === 0 ? (
  <EmptyState
    title="暂无数据"
    description="点击按钮添加第一条数据"
    action={<Button>添加数据</Button>}
  />
) : (
  <DataTable data={data} />
)}
```

### 4. 响应式设计

```tsx
// 移动端隐藏，桌面端显示
<div className="hidden md:block">
  <DesktopContent />
</div>

// 移动端显示，桌面端隐藏
<div className="md:hidden">
  <MobileContent />
</div>

// 响应式按钮尺寸
<Button size="sm" className="md:size-md">
  响应式按钮
</Button>
```

---

## 主题定制

### 修改颜色

在 `globals.css` 中修改 CSS 变量：

```css
:root {
  --color-primary: #your-color;
  --color-success: #your-success-color;
  /* ... */
}
```

### 组件级覆盖

```tsx
<Button className="bg-purple-600 hover:bg-purple-700">
  自定义颜色
</Button>
```

---

## 常见问题

### Q: 如何添加自定义图标？

```tsx
import { CustomIcon } from "lucide-react"

<Button>
  <CustomIcon className="mr-2 h-4 w-4" />
  按钮文字
</Button>
```

### Q: 如何控制 Dialog 大小？

```tsx
<DialogContent size="lg">  {/* sm | md | lg | full */}
```

### Q: 如何实现表单联动？

```tsx
const [country, setCountry] = useState('')
const [city, setCity] = useState('')

// 国家改变时重置城市
useEffect(() => {
  setCity('')
}, [country])
```

### Q: 如何处理异步提交？

```tsx
const handleSubmit = async () => {
  setLoading(true)
  try {
    await api.submit(data)
    toast.success('提交成功')
  } catch (error) {
    toast.error('提交失败')
  } finally {
    setLoading(false)
  }
}
```
