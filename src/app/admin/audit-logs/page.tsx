"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ClipboardList } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: string | null;
  ipAddress: string | null;
  createdAt: string;
  user: { id: string; email: string; name: string | null } | null;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch("/api/admin/audit-logs")
      .then((r) => r.json())
      .then((data) => {
        setLogs(data.logs || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400 mr-2" />
        <span className="text-sm text-slate-500">加载中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">审计日志</h1>
        <span className="text-sm text-slate-500">共 {total} 条记录</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">时间</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">操作人</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">操作</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">对象</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500">详情</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{log.user?.name || "-"}</p>
                      <p className="text-xs text-slate-500">{log.user?.email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">
                      {log.entity} {log.entityId}
                    </td>
                    <td className="px-5 py-3 text-slate-500 max-w-[300px] truncate">
                      {log.details || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <EmptyState
                icon={<ClipboardList className="w-5 h-5" />}
                title="暂无审计日志"
                description="系统操作记录将在此展示。"
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
