"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, Ban, Wallet, Shield, UserCog, Tag } from "lucide-react";
import { Card, PageHeader, Button, StatusBadge, LevelBadge, EnhancedDataTable, type Column, type RowAction } from "@/components/backoffice/ui";
import { FilterBar } from "@/components/backoffice/ui/FilterBar";
import { UserDetailDrawer } from "@/components/backoffice/users/UserDetailDrawer";
import { Breadcrumb } from "@/components/backoffice/layout";
import type { BackofficeUser } from "@/types/backoffice";

// Mock data
const mockUsers: BackofficeUser[] = [
  {
    id: "1",
    uid: "USR001",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 234 *** 5678",
    status: "active",
    kycStatus: "verified",
    level: "vip",
    balance: 12500.50,
    equity: 13200.00,
    createdAt: "2024-01-15T09:30:00Z",
    lastLoginAt: "2024-03-15T14:22:00Z",
    tags: ["VIP", "Active Trader"],
    country: "United States"
  },
  {
    id: "2",
    uid: "USR002",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 456 *** 9012",
    status: "active",
    kycStatus: "verified",
    level: "premium",
    balance: 8500.00,
    equity: 8900.00,
    createdAt: "2024-01-20T11:45:00Z",
    lastLoginAt: "2024-03-15T10:15:00Z",
    tags: ["Premium"],
    country: "Canada"
  },
  {
    id: "3",
    uid: "USR003",
    name: "Michael Brown",
    email: "m.brown@email.com",
    phone: "+44 20 *** 3456",
    status: "frozen",
    kycStatus: "pending",
    level: "standard",
    balance: 1500.00,
    equity: 1500.00,
    createdAt: "2024-02-01T08:00:00Z",
    lastLoginAt: "2024-03-10T16:30:00Z",
    tags: ["At Risk"],
    country: "United Kingdom"
  },
  {
    id: "4",
    uid: "USR004",
    name: "Emma Wilson",
    email: "emma.w@email.com",
    phone: "+61 2 *** 7890",
    status: "active",
    kycStatus: "verified",
    level: "vip",
    balance: 45000.00,
    equity: 46800.00,
    createdAt: "2024-01-25T14:20:00Z",
    lastLoginAt: "2024-03-15T12:00:00Z",
    tags: ["VIP", "High Value"],
    country: "Australia"
  },
  {
    id: "5",
    uid: "USR005",
    name: "David Lee",
    email: "david.lee@email.com",
    phone: "+65 6789 *** 12",
    status: "pending",
    kycStatus: "not_submitted",
    level: "standard",
    balance: 0,
    equity: 0,
    createdAt: "2024-03-14T09:00:00Z",
    lastLoginAt: "2024-03-14T09:05:00Z",
    tags: ["New"],
    country: "Singapore"
  },
  {
    id: "6",
    uid: "USR006",
    name: "Lisa Chen",
    email: "lisa.chen@email.com",
    phone: "+86 138 *** 4567",
    status: "active",
    kycStatus: "rejected",
    level: "standard",
    balance: 200.00,
    equity: 200.00,
    createdAt: "2024-02-10T16:30:00Z",
    lastLoginAt: "2024-03-12T08:45:00Z",
    tags: ["KYC Failed"],
    country: "China"
  },
  {
    id: "7",
    uid: "USR007",
    name: "James Taylor",
    email: "j.taylor@email.com",
    phone: "+49 30 *** 8901",
    status: "active",
    kycStatus: "verified",
    level: "enterprise",
    balance: 150000.00,
    equity: 155000.00,
    createdAt: "2024-01-05T10:00:00Z",
    lastLoginAt: "2024-03-15T15:30:00Z",
    tags: ["Enterprise", "VIP"],
    country: "Germany"
  },
];

export default function UsersPage() {
  const [users] = useState<BackofficeUser[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<BackofficeUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

  const handleRowClick = (user: BackofficeUser) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const columns: Column<BackofficeUser>[] = [
    {
      key: "uid",
      title: "UID",
      width: "100px",
      sortable: true,
      render: (row) => (
        <Link href={`/backoffice/users/${row.id}`} className="font-mono text-blue-600 hover:underline">
          {row.uid}
        </Link>
      ),
    },
    {
      key: "name",
      title: "用户名",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-slate-900 dark:text-white">{row.name}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: "level",
      title: "等级",
      width: "100px",
      render: (row) => <LevelBadge level={row.level} />,
    },
    {
      key: "balance",
      title: "余额",
      width: "120px",
      align: "right",
      sortable: true,
      render: (row) => (
        <span className="font-medium text-slate-900 dark:text-white">
          ${row.balance.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      title: "状态",
      width: "100px",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "kycStatus",
      title: "KYC",
      width: "120px",
      render: (row) => <StatusBadge status={row.kycStatus} />,
    },
    {
      key: "createdAt",
      title: "注册时间",
      width: "150px",
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 dark:text-slate-400">{new Date(row.createdAt).toLocaleDateString("zh-CN")}</span>
      ),
    },
  ];

  const rowActions: RowAction<BackofficeUser>[] = [
    {
      label: "查看详情",
      icon: <Eye className="w-4 h-4" />,
      onClick: handleRowClick,
    },
    {
      label: "调整余额",
      icon: <Wallet className="w-4 h-4" />,
      onClick: (row) => console.log("Adjust balance", row.id),
    },
    {
      label: "冻结账户",
      icon: <Ban className="w-4 h-4" />,
      onClick: (row) => console.log("Freeze", row.id),
      variant: "danger",
      disabled: (row) => row.status === "frozen",
    },
  ];

  const filterOptions = [
    { key: "status", label: "状态", type: "select" as const, options: [
      { label: "正常", value: "active" },
      { label: "冻结", value: "frozen" },
      { label: "待激活", value: "pending" },
    ]},
    { key: "kyc", label: "KYC 状态", type: "select" as const, options: [
      { label: "已认证", value: "verified" },
      { label: "待审核", value: "pending" },
      { label: "已拒绝", value: "rejected" },
      { label: "未提交", value: "not_submitted" },
    ]},
    { key: "level", label: "等级", type: "select" as const, options: [
      { label: "Standard", value: "standard" },
      { label: "VIP", value: "vip" },
      { label: "Premium", value: "premium" },
      { label: "Enterprise", value: "enterprise" },
    ]},
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "用户管理" }, { label: "用户列表" }]} />

      {/* Page Header */}
      <PageHeader
        title="用户管理"
        description="管理平台用户、KYC认证和账户设置"
        actions={
          <div className="flex gap-3">
            <Button variant="secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              导出
            </Button>
            <Button>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              添加用户
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">总用户数</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">12,345</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">+8.2% 本月</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">活跃用户</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">8,901</p>
          <p className="text-xs text-slate-500 mt-1">72.1%</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">待审核 KYC</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">156</p>
          <p className="text-xs text-amber-600 mt-1">需要处理</p>
        </Card>
        <Card className="!p-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">冻结账户</p>
          <p className="text-2xl font-bold text-red-600 mt-1">89</p>
          <p className="text-xs text-slate-500 mt-1">0.7%</p>
        </Card>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filterOptions}
        searchable
        searchKeys={["uid", "name", "email"]}
        searchPlaceholder="搜索 UID、用户名或邮箱..."
      />

      {/* Data Table */}
      <Card padding="none">
        <EnhancedDataTable<BackofficeUser>
          columns={columns}
          data={users}
          keyExtractor={(row) => row.id}
          selectable
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          rowActions={rowActions}
          onRowClick={handleRowClick}
          emptyText="暂无用户数据"
          exportable
          onExport={() => console.log("Export data")}
        />
      </Card>

      {/* User Detail Drawer */}
      <UserDetailDrawer
        user={selectedUser}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
