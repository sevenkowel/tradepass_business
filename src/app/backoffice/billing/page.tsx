"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function AdminBillingPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Placeholder for billing management
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">计费管理</h2>
      <Card>
        <CardContent className="p-8 text-center text-slate-500">
          计费规则配置与用量对账功能开发中...
        </CardContent>
      </Card>
    </div>
  );
}
