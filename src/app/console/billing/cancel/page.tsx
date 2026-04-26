"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { XCircle, ArrowLeft, CreditCard } from "lucide-react";
import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
            <XCircle className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))] mb-2">
              支付已取消
            </h1>
            <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">
              您取消了支付流程。您的套餐未发生变更，可随时重新尝试。
            </p>
          </div>
          <div className="space-y-2">
            <Link href="/console/billing">
              <Button className="w-full">
                <CreditCard className="w-4 h-4 mr-1" />
                重新支付
              </Button>
            </Link>
            <Link href="/console">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-1" />
                返回控制台
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
