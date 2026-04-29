"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Package,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Shield,
  Puzzle,
  Zap,
  Info,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

interface ProductModule {
  id: string;
  name: string;
  description: string;
  isAddOn: boolean;
  addOnPrice?: number;
}

interface ProductItem {
  id: string;
  code: string;
  name: string;
  shortName: string;
  description: string | null;
  basePrice: number;
  seatPrice: number | null;
  currency: string;
  isBaseLayer: boolean;
  isSubscribed: boolean;
  moduleCount: number;
  modules: ProductModule[];
}

interface AddOnItem {
  moduleId: string;
  name: string;
  description: string;
  icon: string;
  parentProductCode: string;
  parentProductName: string;
  addOnPrice: number;
  currency: string;
}

interface ProductsData {
  baseLayer?: ProductItem;
  extensions: ProductItem[];
  addOns: AddOnItem[];
}

export default function ProductsPage() {
  const [data, setData] = useState<ProductsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/console/products")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400 mr-2" />
        <span className="text-sm text-slate-500">加载中...</span>
      </div>
    );
  }

  const { baseLayer, extensions = [], addOns = [] } = data || {};
  const availableExtensions = extensions.filter((p) => !p.isSubscribed);
  const subscribedExtensions = extensions.filter((p) => p.isSubscribed);

  return (
    <div className="space-y-10 w-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">产品管理</h1>
        <p className="text-sm text-slate-500 mt-1">
          浏览和订阅 TradePass 产品套件
        </p>
      </div>

      {/* === Base Layer === */}
      {baseLayer && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              基础层（已包含）
            </h2>
          </div>
          <Card className="border-blue-200 bg-blue-50/30">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">
                      {baseLayer.name}
                    </h3>
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                      <CheckCircle2 className="w-3 h-3" /> 已激活
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    {baseLayer.description || "-"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <p className="text-lg font-bold text-slate-900">
                  {baseLayer.currency} {baseLayer.basePrice.toFixed(2)}
                  <span className="text-sm font-normal text-slate-400">/月</span>
                </p>
                <span className="text-xs text-slate-400">
                  包含 {baseLayer.moduleCount} 个核心模块
                </span>
              </div>
              {/* Module chips */}
              <div className="mt-3 flex flex-wrap gap-2">
                {baseLayer.modules.map((m) => (
                  <span
                    key={m.id}
                    className="text-xs px-2 py-1 bg-white rounded-md border border-slate-200 text-slate-600"
                  >
                    {m.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* === Subscribed Extensions === */}
      {subscribedExtensions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              已订阅扩展
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subscribedExtensions.map((p) => (
              <Card
                key={p.id}
                className="border-emerald-200 bg-emerald-50/30"
              >
                <CardContent className="p-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {p.name}
                      </h3>
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                        <CheckCircle2 className="w-3 h-3" /> 已订阅
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {p.description || "-"}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-4">
                    <p className="text-lg font-bold text-slate-900">
                      {p.currency} {p.basePrice.toFixed(2)}
                      <span className="text-sm font-normal text-slate-400">
                        /月
                      </span>
                    </p>
                    <span className="text-xs text-slate-400">
                      {p.moduleCount} 个模块
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.modules.map((m) => (
                      <span
                        key={m.id}
                        className="text-xs px-2 py-1 bg-white rounded-md border border-emerald-200 text-emerald-700"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* === Available Extensions === */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Puzzle className="w-4 h-4 text-slate-600" />
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            可订阅扩展产品
          </h2>
        </div>
        {availableExtensions.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Package className="w-5 h-5" />}
              title="暂无扩展产品可订阅"
              description="您已订阅所有可用扩展产品。"
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableExtensions.map((p) => (
              <Card
                key={p.id}
                className="hover:border-slate-300 transition-colors"
              >
                <CardContent className="p-5">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-slate-900">
                      {p.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {p.description || "-"}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-4">
                    <p className="text-lg font-bold text-slate-900">
                      {p.currency} {p.basePrice.toFixed(2)}
                      <span className="text-sm font-normal text-slate-400">
                        /月
                      </span>
                    </p>
                    <span className="text-xs text-slate-400">
                      {p.moduleCount} 个模块
                    </span>
                  </div>

                  {/* Module chips */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.modules.map((m) => (
                      <span
                        key={m.id}
                        className="text-xs px-2 py-1 bg-slate-50 rounded-md border border-slate-200 text-slate-500"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>

                  {/* Dependency hint */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1.5 rounded-md">
                    <Info className="w-3 h-3" />
                    需 TradePass Business 基础层
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {p.seatPrice && p.seatPrice > 0 && (
                      <p className="text-xs text-slate-400">
                        额外席位: {p.currency} {p.seatPrice.toFixed(2)}/用户/月
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto rounded-lg"
                      onClick={() => alert("订阅流程待实现")}
                    >
                      去订阅 <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* === Add-ons === */}
      {addOns.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Add-on 模块（可单独购买）
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addOns.map((addon) => (
              <Card
                key={addon.moduleId}
                className="hover:border-amber-300 transition-colors"
              >
                <CardContent className="p-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {addon.name}
                      </h3>
                      <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">
                        Add-on
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {addon.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-lg font-bold text-slate-900">
                      {addon.currency} {addon.addOnPrice.toFixed(2)}
                      <span className="text-sm font-normal text-slate-400">
                        /月
                      </span>
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={() => alert("Add-on 购买流程待实现")}
                    >
                      单独购买
                    </Button>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    所属产品: {addon.parentProductName}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
