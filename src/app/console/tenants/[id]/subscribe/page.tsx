"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2 } from "lucide-react";

interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  basePrice: number;
  seatPrice: number | null;
}

export default function SubscribePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      });
  }, []);

  async function subscribe(productId: string) {
    setSubmitting(true);
    const res = await fetch(`/api/console/tenants/${id}/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    setSubmitting(false);

    if (res.ok) {
      router.push(`/console/tenants/${id}`);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-slate-900">选择订阅产品</h1>
      <p className="text-slate-500">为新租户选择需要开通的产品，试用期内免费体验。</p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((p) => (
            <Card
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`cursor-pointer transition-colors ${
                selected === p.id ? "border-slate-900 ring-1 ring-slate-900" : "hover:border-slate-300"
              }`}
            >
              <CardContent className="p-5 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{p.name}</h3>
                    {selected === p.id && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{p.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-sm">
                    <span className="font-medium text-slate-900">${p.basePrice}/月</span>
                    {p.seatPrice ? (
                      <span className="text-slate-500">+ ${p.seatPrice}/seat</span>
                    ) : null}
                  </div>
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    subscribe(p.id);
                  }}
                  disabled={submitting}
                  className="shrink-0 bg-slate-900 hover:bg-slate-800 text-white"
                >
                  {submitting && selected === p.id ? "开通中..." : "立即开通"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
