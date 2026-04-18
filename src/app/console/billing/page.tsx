"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { CreditCard, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  tenant: { name: string };
  amount: number;
  currency: string;
  status: "pending" | "paid" | "overdue";
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  paidAt: string | null;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/console/billing")
      .then((r) => r.json())
      .then((data) => {
        setInvoices(data.invoices || []);
        setLoading(false);
      });
  }, []);

  async function payInvoice(invoiceId: string) {
    setPayingId(invoiceId);
    const res = await fetch("/api/console/billing/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId, method: "card" }),
    });
    const data = await res.json();
    if (data.invoice) {
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === invoiceId ? { ...inv, ...data.invoice } : inv))
      );
    }
    setPayingId(null);
  }

  const totalPending = invoices
    .filter((i) => i.status === "pending")
    .reduce((sum, i) => sum + i.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">账单总数</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{invoices.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">待支付金额</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">
              ${totalPending.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-slate-500">已支付账单</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">
              {invoices.filter((i) => i.status === "paid").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">账单列表</h2>
        {invoices.length === 0 ? (
          <Card>
            <EmptyState
              title="暂无账单"
              description="当前没有待处理的账单，系统会在产生费用时自动生成。"
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv) => (
              <Card key={inv.id} className="hover:border-slate-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-slate-900">{inv.invoiceNumber}</p>
                        <StatusBadge status={inv.status} />
                      </div>
                      <p className="text-sm text-slate-500">
                        {inv.tenant.name} · {new Date(inv.periodStart).toLocaleDateString()} -{" "}
                        {new Date(inv.periodEnd).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-400">
                        到期日: {new Date(inv.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-xl font-bold text-slate-900">
                        {inv.currency} {inv.amount.toFixed(2)}
                      </p>
                      {inv.status === "pending" && (
                        <Button
                          onClick={() => payInvoice(inv.id)}
                          disabled={payingId === inv.id}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          {payingId === inv.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4 mr-1.5" /> 支付
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
    paid: {
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      className: "bg-emerald-100 text-emerald-700",
      label: "已支付",
    },
    pending: {
      icon: <Clock className="w-3.5 h-3.5" />,
      className: "bg-amber-100 text-amber-700",
      label: "待支付",
    },
    overdue: {
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      className: "bg-red-100 text-red-700",
      label: "已逾期",
    },
  };
  const c = config[status] || config.pending;
  return (
    <span className={cn("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium", c.className)}>
      {c.icon} {c.label}
    </span>
  );
}
