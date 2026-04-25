"use client";

import { useState } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
  Lock,
  FileEdit,
  X,
} from "lucide-react";
import { Card, PageHeader, Button } from "@/components/backoffice/ui";
import { Breadcrumb } from "@/components/backoffice/layout";
import { EnhancedDataTable, Column, RowAction } from "@/components/backoffice/ui/EnhancedDataTable";
import { cn } from "@/lib/utils";

// Types
interface AuditLog {
  id: string;
  action: string;
  module: "compliance" | "funds" | "users" | "trading" | "system" | "risk";
  target: string;
  targetType: string;
  operator: string;
  role: string;
  ip: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
  details?: string;
  beforeValue?: string;
  afterValue?: string;
}

// Mock data
const mockAuditLogs: AuditLog[] = [
  {
    id: "AUD001",
    action: "KYC审核通过",
    module: "compliance",
    target: "USR-8823",
    targetType: "用户",
    operator: "admin_01",
    role: "合规专员",
    ip: "192.168.1.100",
    timestamp: "2024-03-15 14:30:00",
    severity: "info",
    details: "用户提交KYC文档审核通过，提升至Standard级别",
  },
  {
    id: "AUD002",
    action: "大额出金审核",
    module: "funds",
    target: "WD-9921",
    targetType: "出金订单",
    operator: "admin_risk",
    role: "风控专员",
    ip: "192.168.1.105",
    timestamp: "2024-03-15 13:45:00",
    severity: "warning",
    details: "金额 $25,000 超出日限额，触发人工审核",
    beforeValue: "pending",
    afterValue: "approved",
  },
  {
    id: "AUD003",
    action: "添加黑名单",
    module: "compliance",
    target: "USR-8823",
    targetType: "用户",
    operator: "compliance_team",
    role: "合规主管",
    ip: "192.168.1.110",
    timestamp: "2024-03-15 10:00:00",
    severity: "critical",
    details: "用户涉嫌洗钱，加入黑名单",
  },
  {
    id: "AUD004",
    action: "修改杠杆设置",
    module: "trading",
    target: "Group-A",
    targetType: "账户组",
    operator: "admin_02",
    role: "交易管理员",
    ip: "192.168.1.120",
    timestamp: "2024-03-14 16:20:00",
    severity: "warning",
    beforeValue: "1:100",
    afterValue: "1:200",
    details: "将Group-A账户组最大杠杆从100倍调整至200倍",
  },
  {
    id: "AUD005",
    action: "用户权限变更",
    module: "users",
    target: "USR-4401",
    targetType: "用户",
    operator: "admin_01",
    role: "超级管理员",
    ip: "192.168.1.100",
    timestamp: "2024-03-14 11:00:00",
    severity: "info",
    details: "为用户分配IB角色",
  },
  {
    id: "AUD006",
    action: "系统配置修改",
    module: "system",
    target: "KYC-Config",
    targetType: "配置项",
    operator: "system",
    role: "系统",
    ip: "127.0.0.1",
    timestamp: "2024-03-13 09:00:00",
    severity: "info",
    details: "VN地区KYC配置从Basic更新为Standard",
  },
  {
    id: "AUD007",
    action: "保证金预警触发",
    module: "risk",
    target: "ACC-3321",
    targetType: "交易账户",
    operator: "system",
    role: "系统",
    ip: "127.0.0.1",
    timestamp: "2024-03-13 08:15:00",
    severity: "critical",
    details: "保证金水平低于50%，触发强平预警",
  },
  {
    id: "AUD008",
    action: "出金拒绝",
    module: "funds",
    target: "WD-8812",
    targetType: "出金订单",
    operator: "admin_03",
    role: "资金专员",
    ip: "192.168.1.130",
    timestamp: "2024-03-12 17:30:00",
    severity: "warning",
    details: "出金账户与注册姓名不符",
  },
];

const moduleConfig = {
  compliance: { label: "合规", icon: ShieldCheck, color: "text-blue-600", bg: "bg-blue-100" },
  funds: { label: "资金", icon: ClipboardList, color: "text-emerald-600", bg: "bg-emerald-100" },
  users: { label: "用户", icon: UserCheck, color: "text-violet-600", bg: "bg-violet-100" },
  trading: { label: "交易", icon: FileEdit, color: "text-amber-600", bg: "bg-amber-100" },
  system: { label: "系统", icon: Lock, color: "text-gray-600", bg: "bg-gray-100" },
  risk: { label: "风控", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100" },
};

const severityConfig = {
  info: { label: "信息", color: "text-blue-600", bg: "bg-blue-100", dot: "bg-blue-500" },
  warning: { label: "警告", color: "text-amber-600", bg: "bg-amber-100", dot: "bg-amber-500" },
  critical: { label: "严重", color: "text-red-600", bg: "bg-red-100", dot: "bg-red-500" },
};

export default function AuditLogsPage() {
  const [logs] = useState<AuditLog[]>(mockAuditLogs);
  const [filterModule, setFilterModule] = useState<"all" | AuditLog["module"]>("all");
  const [filterSeverity, setFilterSeverity] = useState<"all" | AuditLog["severity"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (filterModule !== "all" && log.module !== filterModule) return false;
    if (filterSeverity !== "all" && log.severity !== filterSeverity) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.operator.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const stats = {
    total: logs.length,
    info: logs.filter((l) => l.severity === "info").length,
    warning: logs.filter((l) => l.severity === "warning").length,
    critical: logs.filter((l) => l.severity === "critical").length,
  };

  const columns: Column<AuditLog>[] = [
    {
      key: "severity",
      title: "级别",
      width: "90px",
      render: (row) => {
        const cfg = severityConfig[row.severity];
        return (
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full", cfg.dot)} />
            <span className={cn("text-xs font-medium", cfg.color)}>{cfg.label}</span>
          </div>
        );
      },
    },
    {
      key: "module",
      title: "模块",
      width: "110px",
      render: (row) => {
        const cfg = moduleConfig[row.module];
        const Icon = cfg.icon;
        return (
          <div className="flex items-center gap-2">
            <div className={cn("w-7 h-7 rounded-md flex items-center justify-center", cfg.bg)}>
              <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
            </div>
            <span className="text-sm">{cfg.label}</span>
          </div>
        );
      },
    },
    {
      key: "action",
      title: "操作",
      render: (row) => (
        <div>
          <p className="text-sm font-medium">{row.action}</p>
          <p className="text-xs text-gray-500">{row.targetType}: {row.target}</p>
        </div>
      ),
    },
    {
      key: "operator",
      title: "操作人",
      width: "120px",
      render: (row) => (
        <div>
          <p className="text-sm font-medium">{row.operator}</p>
          <p className="text-xs text-gray-500">{row.role}</p>
        </div>
      ),
    },
    {
      key: "ip",
      title: "IP地址",
      width: "130px",
      render: (row) => <span className="text-sm font-mono text-gray-600">{row.ip}</span>,
    },
    {
      key: "timestamp",
      title: "时间",
      width: "160px",
      render: (row) => <span className="text-sm text-gray-500">{row.timestamp}</span>,
    },
  ];

  const rowActions: RowAction<AuditLog>[] = [
    {
      label: "查看详情",
      icon: <ClipboardList className="w-4 h-4" />,
      onClick: (row) => setSelectedLog(row),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "合规" }, { label: "审计日志" }]} />

      <PageHeader
        title="审计日志"
        description="查看系统所有操作记录，用于合规审查和安全追溯"
        actions={
          <Button variant="secondary">
            <Filter className="w-4 h-4" />
            导出日志
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-500">总记录</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.info}</p>
              <p className="text-sm text-gray-500">信息</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.warning}</p>
              <p className="text-sm text-gray-500">警告</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
              <p className="text-sm text-gray-500">严重</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索操作、目标或操作人..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterModule}
            onChange={(e) => setFilterModule(e.target.value as typeof filterModule)}
            className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部模块</option>
            <option value="compliance">合规</option>
            <option value="funds">资金</option>
            <option value="users">用户</option>
            <option value="trading">交易</option>
            <option value="system">系统</option>
            <option value="risk">风控</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as typeof filterSeverity)}
            className="h-9 px-3 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部级别</option>
            <option value="info">信息</option>
            <option value="warning">警告</option>
            <option value="critical">严重</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <EnhancedDataTable
        columns={columns}
        data={filteredLogs}
        keyExtractor={(row) => row.id}
        searchable={false}
        rowActions={rowActions}
        onRowClick={setSelectedLog}
        emptyText="暂无审计日志"
      />

      {/* Detail Modal */}
      {selectedLog && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSelectedLog(null)} />
          <div className="fixed inset-x-4 top-[10%] max-w-lg mx-auto bg-white rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-lg font-semibold">审计详情</h2>
                <p className="text-sm text-gray-500 font-mono mt-0.5">{selectedLog.id}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="p-2 rounded-lg hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const cfg = moduleConfig[selectedLog.module];
                  const Icon = cfg.icon;
                  return (
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", cfg.bg)}>
                      <Icon className={cn("w-6 h-6", cfg.color)} />
                    </div>
                  );
                })()}
                <div>
                  <p className="text-lg font-medium">{selectedLog.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full", severityConfig[selectedLog.severity].bg, severityConfig[selectedLog.severity].color)}>
                      {severityConfig[selectedLog.severity].label}
                    </span>
                    <span className="text-xs text-gray-500">{selectedLog.module}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">操作人</p>
                  <p className="text-sm font-medium">{selectedLog.operator}</p>
                  <p className="text-xs text-gray-500">{selectedLog.role}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">IP地址</p>
                  <p className="text-sm font-mono">{selectedLog.ip}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">目标</p>
                  <p className="text-sm font-medium">{selectedLog.target}</p>
                  <p className="text-xs text-gray-500">{selectedLog.targetType}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">时间</p>
                  <p className="text-sm">{selectedLog.timestamp}</p>
                </div>
              </div>

              {selectedLog.details && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">详情</p>
                  <p className="text-sm">{selectedLog.details}</p>
                </div>
              )}

              {(selectedLog.beforeValue || selectedLog.afterValue) && (
                <div className="space-y-2">
                  {selectedLog.beforeValue && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-xs text-red-600 mb-1">变更前</p>
                      <p className="text-sm font-mono text-red-800">{selectedLog.beforeValue}</p>
                    </div>
                  )}
                  {selectedLog.afterValue && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <p className="text-xs text-emerald-600 mb-1">变更后</p>
                      <p className="text-sm font-mono text-emerald-800">{selectedLog.afterValue}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50">
              <Button variant="secondary" className="w-full" onClick={() => setSelectedLog(null)}>
                关闭
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
