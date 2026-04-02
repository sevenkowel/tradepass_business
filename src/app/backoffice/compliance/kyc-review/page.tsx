"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
  Search,
  Filter,
  AlertTriangle,
  User,
  FileText,
  MapPin,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Card, PageHeader, Button, StatusBadge } from "@/components/backoffice/ui";
import { FilterBar } from "@/components/backoffice/ui/FilterBar";
import { Breadcrumb } from "@/components/backoffice/layout";

// Types
interface KYCApplication {
  id: string;
  userId: string;
  userName: string;
  email: string;
  phone: string;
  country: string;
  submittedAt: string;
  type: "individual" | "corporate";
  documents: {
    idCard: { status: "pending" | "approved" | "rejected"; url: string };
    proofOfAddress: { status: "pending" | "approved" | "rejected"; url: string };
    selfie?: { status: "pending" | "approved" | "rejected"; url: string };
  };
  riskLevel: "low" | "medium" | "high";
  reviewer?: string;
  reviewedAt?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}

// Mock data
const mockApplications: KYCApplication[] = [
  {
    id: "KYC001",
    userId: "USR008",
    userName: "Robert Chen",
    email: "robert.chen@email.com",
    phone: "+1 555 123 4567",
    country: "United States",
    submittedAt: "2024-03-15 10:30",
    type: "individual",
    documents: {
      idCard: { status: "approved", url: "/docs/id-1.jpg" },
      proofOfAddress: { status: "pending", url: "/docs/poa-1.jpg" },
      selfie: { status: "approved", url: "/docs/selfie-1.jpg" },
    },
    riskLevel: "low",
    status: "pending",
  },
  {
    id: "KYC002",
    userId: "USR009",
    userName: "Maria Garcia",
    email: "maria.garcia@email.com",
    phone: "+34 612 345 678",
    country: "Spain",
    submittedAt: "2024-03-15 09:15",
    type: "individual",
    documents: {
      idCard: { status: "approved", url: "/docs/id-2.jpg" },
      proofOfAddress: { status: "approved", url: "/docs/poa-2.jpg" },
      selfie: { status: "approved", url: "/docs/selfie-2.jpg" },
    },
    riskLevel: "low",
    status: "pending",
  },
  {
    id: "KYC003",
    userId: "USR010",
    userName: "Global Trading Ltd",
    email: "compliance@globaltrading.com",
    phone: "+44 20 7946 0958",
    country: "United Kingdom",
    submittedAt: "2024-03-14 16:45",
    type: "corporate",
    documents: {
      idCard: { status: "approved", url: "/docs/cert-1.pdf" },
      proofOfAddress: { status: "pending", url: "/docs/utility-1.pdf" },
    },
    riskLevel: "high",
    status: "pending",
  },
  {
    id: "KYC004",
    userId: "USR011",
    userName: "Hans Mueller",
    email: "hans.mueller@email.de",
    phone: "+49 151 2345 6789",
    country: "Germany",
    submittedAt: "2024-03-14 14:20",
    type: "individual",
    documents: {
      idCard: { status: "rejected", url: "/docs/id-3.jpg" },
      proofOfAddress: { status: "rejected", url: "/docs/poa-3.jpg" },
      selfie: { status: "rejected", url: "/docs/selfie-3.jpg" },
    },
    riskLevel: "medium",
    status: "rejected",
    rejectionReason: "证件照片不清晰，无法验证身份",
    reviewer: "admin_01",
    reviewedAt: "2024-03-15 11:00",
  },
  {
    id: "KYC005",
    userId: "USR012",
    userName: "Yuki Tanaka",
    email: "yuki.tanaka@email.jp",
    phone: "+81 90 1234 5678",
    country: "Japan",
    submittedAt: "2024-03-15 08:00",
    type: "individual",
    documents: {
      idCard: { status: "approved", url: "/docs/id-4.jpg" },
      proofOfAddress: { status: "approved", url: "/docs/poa-4.jpg" },
      selfie: { status: "approved", url: "/docs/selfie-4.jpg" },
    },
    riskLevel: "low",
    status: "approved",
    reviewer: "admin_02",
    reviewedAt: "2024-03-15 10:30",
  },
];

const statusConfig = {
  pending: {
    label: "待审核",
    color: "text-amber-600",
    bg: "bg-amber-100",
    icon: Clock,
  },
  approved: {
    label: "已通过",
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    icon: CheckCircle,
  },
  rejected: {
    label: "已拒绝",
    color: "text-red-600",
    bg: "bg-red-100",
    icon: XCircle,
  },
};

const riskConfig = {
  low: { label: "低风险", color: "text-emerald-600", bg: "bg-emerald-100" },
  medium: { label: "中风险", color: "text-amber-600", bg: "bg-amber-100" },
  high: { label: "高风险", color: "text-red-600", bg: "bg-red-100" },
};

export default function KYCReviewPage() {
  const [applications] = useState<KYCApplication[]>(mockApplications);
  const [selectedApp, setSelectedApp] = useState<KYCApplication | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApps = applications.filter((app) => {
    if (filter !== "all" && app.status !== filter) return false;
    if (searchQuery && !app.userName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const handleApprove = (app: KYCApplication) => {
    console.log("Approve", app.id);
    setSelectedApp(null);
  };

  const handleReject = (app: KYCApplication, reason: string) => {
    console.log("Reject", app.id, reason);
    setSelectedApp(null);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "合规" }, { label: "KYC审核" }]} />

      {/* Page Header */}
      <PageHeader
        title="KYC审核"
        description="审核用户身份认证材料，确保合规要求"
        actions={
          <div className="flex gap-3">
            <Button variant="secondary">
              <Download className="w-4 h-4" />
              导出报告
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
              <p className="text-sm text-slate-500">总申请</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-sm text-slate-500">待审核</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats.approved}</p>
              <p className="text-sm text-slate-500">已通过</p>
            </div>
          </div>
        </Card>
        <Card className="!p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-slate-500">已拒绝</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索用户名或邮箱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === status
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {status === "all" ? "全部" : status === "pending" ? "待审核" : status === "approved" ? "已通过" : "已拒绝"}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-3">
        {filteredApps.map((app) => {
          const status = statusConfig[app.status];
          const risk = riskConfig[app.riskLevel];
          const StatusIcon = status.icon;

          return (
            <motion.div
              key={app.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer"
              onClick={() => setSelectedApp(app)}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  {/* Left - User Info */}
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                      {app.userName.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {app.userName}
                        </h3>
                        <span className={`px-2 py-0.5 ${risk.bg} ${risk.color} rounded text-xs font-medium`}>
                          {risk.label}
                        </span>
                        {app.riskLevel === "high" && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                        <span className="font-mono">{app.userId}</span>
                        <span>•</span>
                        <span>{app.email}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {app.country}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right - Status & Time */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={`w-4 h-4 ${status.color}`} />
                        <span className={`text-sm font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {app.submittedAt}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>

                {/* Document Status */}
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      app.documents.idCard.status === "approved" ? "bg-emerald-500" :
                      app.documents.idCard.status === "rejected" ? "bg-red-500" : "bg-amber-500"
                    }`} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">身份证</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      app.documents.proofOfAddress.status === "approved" ? "bg-emerald-500" :
                      app.documents.proofOfAddress.status === "rejected" ? "bg-red-500" : "bg-amber-500"
                    }`} />
                    <span className="text-sm text-slate-600 dark:text-slate-400">地址证明</span>
                  </div>
                  {app.documents.selfie && (
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        app.documents.selfie.status === "approved" ? "bg-emerald-500" :
                        app.documents.selfie.status === "rejected" ? "bg-red-500" : "bg-amber-500"
                      }`} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">自拍认证</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredApps.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Shield className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium">暂无申请记录</p>
            <p className="text-sm">所有 KYC 申请已处理完毕</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                    {selectedApp.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">
                      {selectedApp.userName}
                    </h2>
                    <p className="text-sm text-slate-500">{selectedApp.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <XCircle className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-96 overflow-y-auto">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">用户ID</p>
                    <p className="font-mono font-medium">{selectedApp.userId}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">申请类型</p>
                    <p className="font-medium">{selectedApp.type === "individual" ? "个人" : "企业"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">手机</p>
                    <p className="font-medium">{selectedApp.phone}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">国家</p>
                    <p className="font-medium">{selectedApp.country}</p>
                  </div>
                </div>

                {/* Documents */}
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">提交材料</h3>
                <div className="space-y-3">
                  {Object.entries(selectedApp.documents).map(([key, doc]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <span className="font-medium">
                          {key === "idCard" ? "身份证" : key === "proofOfAddress" ? "地址证明" : "自拍认证"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          doc.status === "approved" ? "bg-emerald-100 text-emerald-700" :
                          doc.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {doc.status === "approved" ? "通过" : doc.status === "rejected" ? "拒绝" : "待审核"}
                        </span>
                        <Button variant="secondary" size="sm">
                          <Eye className="w-4 h-4" />
                          查看
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Risk Warning */}
                {selectedApp.riskLevel === "high" && (
                  <div className="flex items-start gap-3 p-4 mt-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-400">高风险标记</p>
                      <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                        该用户被标记为高风险，请仔细审核所有材料
                      </p>
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {selectedApp.rejectionReason && (
                  <div className="p-4 mt-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">拒绝原因</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      {selectedApp.rejectionReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedApp.status === "pending" && (
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <Button variant="secondary">
                    <XCircle className="w-4 h-4" />
                    拒绝
                  </Button>
                  <Button>
                    <CheckCircle className="w-4 h-4" />
                    通过审核
                  </Button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
