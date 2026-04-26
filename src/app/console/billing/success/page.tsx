"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BillingSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const devInvoiceId = searchParams.get("dev_invoice");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      if (sessionId) {
        // Real Stripe mode — verify session via API
        try {
          const res = await fetch(`/api/console/billing/verify-session?session_id=${sessionId}`);
          if (!res.ok) throw new Error("Verification failed");
        } catch (err: any) {
          setError(err.message);
        }
      } else if (devInvoiceId) {
        // Dev mode — simulate payment
        await fetch("/api/console/billing/pay", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId: devInvoiceId, method: "card" }),
        });
      }
      setLoading(false);
    }

    verifyPayment();
  }, [sessionId, devInvoiceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-[rgb(var(--tp-accent-rgb))]" />
          <p className="text-[rgba(var(--tp-fg-rgb),0.6)]">正在确认支付状态...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <span className="text-red-600 text-2xl">✕</span>
            </div>
            <h1 className="text-xl font-bold text-[rgb(var(--tp-fg-rgb))]">支付确认失败</h1>
            <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">{error}</p>
            <Link href="/console/billing">
              <Button variant="outline" className="mt-4">返回账单页面</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))] mb-2">
              支付成功
            </h1>
            <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">
              您的订阅已激活，全部功能现已可用。
            </p>
          </div>
          <div className="space-y-2">
            <Link href="/console">
              <Button className="w-full">
                进入控制台
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/console/billing">
              <Button variant="outline" className="w-full">
                查看账单详情
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
