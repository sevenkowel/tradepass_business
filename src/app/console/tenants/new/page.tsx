"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateTenantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/console/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        slug: form.get("slug"),
        region: form.get("region"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "创建失败");
      return;
    }

    router.push(`/console/tenants/${data.tenant.id}/subscribe`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/console">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> 返回
          </Button>
        </Link>
        <h1 className="text-xl font-bold text-slate-900">创建租户</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-slate-700">租户名称</label>
              <Input name="name" required className="mt-1" placeholder="例如：Alpha Broker" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">租户标识（slug）</label>
              <Input name="slug" required className="mt-1" placeholder="alpha-broker" />
              <p className="text-xs text-slate-500 mt-1">用于生成唯一标识，仅限字母、数字和连字符</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">数据中心区域</label>
              <select name="region" className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="ap-southeast-1">新加坡</option>
                <option value="eu-west-1">伦敦</option>
                <option value="us-east-1">弗吉尼亚</option>
              </select>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full bg-[#1E40AF] hover:bg-[#1E3A8A] text-white">
              {loading ? "创建中..." : "下一步：选择产品"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
