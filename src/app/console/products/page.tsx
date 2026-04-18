"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, CheckCircle2, ArrowRight } from "lucide-react";

interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  basePrice: number;
  seatPrice: number | null;
  currency: string;
  isActive: boolean;
  isSubscribed: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/console/products")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  const subscribed = products.filter((p) => p.isSubscribed);
  const available = products.filter((p) => !p.isSubscribed);

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">产品管理</h1>
        <p className="text-sm text-slate-500 mt-1">浏览和订阅 TradePass 产品</p>
      </div>

      {subscribed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">已订阅</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscribed.map((p) => (
              <Card key={p.id} className="border-emerald-200 bg-emerald-50/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{p.name}</h3>
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                          <CheckCircle2 className="w-3 h-3" /> 已订阅
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{p.description || "-"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-bold text-slate-900">
                      {p.currency} {p.basePrice.toFixed(2)}
                      <span className="text-sm font-normal text-slate-400">/月</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">可订阅</h2>
        {available.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>暂无可订阅产品</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {available.map((p) => (
              <Card key={p.id} className="hover:border-slate-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-slate-900">{p.name}</h3>
                      <p className="text-sm text-slate-500">{p.description || "-"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-bold text-slate-900">
                      {p.currency} {p.basePrice.toFixed(2)}
                      <span className="text-sm font-normal text-slate-400">/月</span>
                    </p>
                    <Link href="/console/tenants">
                      <Button variant="outline" className="h-9 rounded-lg">
                        去订阅 <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                  {p.seatPrice && (
                    <p className="text-xs text-slate-400 mt-2">
                      额外席位: {p.currency} {p.seatPrice.toFixed(2)}/用户/月
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
