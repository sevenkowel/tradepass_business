"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface Subscription {
  id: string;
  productCode: string;
  productName: string;
  plan: string;
  status: string;
  startsAt: string;
  endsAt: string | null;
  autoRenew: boolean;
}

interface SubscriptionsPanelProps {
  tenantId: string;
  subscriptions: Subscription[];
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "error" | "outline" | "success"; icon: React.ReactNode }> = {
  active: { label: "运行中", variant: "success", icon: <CheckCircle2 className="w-3 h-3" /> },
  trial: { label: "试用中", variant: "secondary", icon: <Clock className="w-3 h-3" /> },
  expired: { label: "已过期", variant: "error", icon: <AlertCircle className="w-3 h-3" /> },
  cancelled: { label: "已取消", variant: "outline", icon: <AlertCircle className="w-3 h-3" /> },
};

export function SubscriptionsPanel({ tenantId, subscriptions }: SubscriptionsPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleRenew = async (subscriptionId: string) => {
    setLoading(subscriptionId);
    // TODO: 实现续费逻辑
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(null);
  };

  const businessSubscription = subscriptions.find(
    (s) => s.productCode === "trade_pass_business"
  );

  return (
    <div className="space-y-4">
      {/* Business Package Status */}
      <Card className={businessSubscription ? "border-emerald-200 bg-emerald-50/30" : ""}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">TradePass Business</h3>
                <p className="text-sm text-slate-500">
                  {businessSubscription
                    ? `当前套餐: ${businessSubscription.plan}`
                    : "未订阅 Business 套餐"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {businessSubscription ? (
                <>
                  <Badge variant={statusConfig[businessSubscription.status]?.variant || "default"}>
                    {statusConfig[businessSubscription.status]?.label || businessSubscription.status}
                  </Badge>
                  <Link href={`/console/modules?tenantId=${tenantId}`}>
                    <Button variant="outline" size="sm">
                      升级/续费
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href={`/console/modules?tenantId=${tenantId}`}>
                  <Button size="sm" className="bg-[#1E40AF] hover:bg-[#1E3A8A] text-white">
                    <Plus className="w-4 h-4 mr-1" /> 购买套餐
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {businessSubscription && (
            <div className="mt-4 pt-4 border-t border-emerald-100 grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-500">开始时间</span>
                <p className="font-medium">
                  {new Date(businessSubscription.startsAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-slate-500">到期时间</span>
                <p className="font-medium">
                  {businessSubscription.endsAt
                    ? new Date(businessSubscription.endsAt).toLocaleDateString()
                    : "永久"}
                </p>
              </div>
              <div>
                <span className="text-slate-500">自动续费</span>
                <p className="font-medium">{businessSubscription.autoRenew ? "已开启" : "未开启"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Subscriptions */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-slate-900">其他产品订阅</h3>
        <Link href={`/console/modules?tenantId=${tenantId}`}>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" /> 新增产品
          </Button>
        </Link>
      </div>

      {subscriptions.filter((s) => s.productCode !== "trade_pass_business").length === 0 ? (
        <Card>
          <EmptyState
            icon={<Package className="w-5 h-5" />}
            title="暂无其他产品"
            description="该租户尚未订阅其他独立功能产品"
            action={
              <Link href={`/console/modules?tenantId=${tenantId}`}>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" /> 浏览产品
                </Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3">
          {subscriptions
            .filter((s) => s.productCode !== "trade_pass_business")
            .map((sub) => (
              <Card key={sub.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Package className="w-4 h-4 text-slate-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{sub.productName}</h4>
                        <p className="text-xs text-slate-500">
                          套餐: {sub.plan} · 到期: {sub.endsAt ? new Date(sub.endsAt).toLocaleDateString() : "永久"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={statusConfig[sub.status]?.variant || "default"}>
                        {statusConfig[sub.status]?.label || sub.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRenew(sub.id)}
                        disabled={loading === sub.id}
                      >
                        {loading === sub.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
