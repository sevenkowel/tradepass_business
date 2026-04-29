"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import {
  Palette,
  Shield,
  TrendingUp,
  CreditCard,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface ConfigPanelProps {
  tenantId: string;
  subdomain: string;
}

const configItems = [
  {
    id: "brand",
    title: "品牌配置",
    description: "配置租户品牌名称、Logo、主题色等",
    icon: Palette,
    href: "/console/onboarding",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    id: "kyc",
    title: "KYC 配置",
    description: "配置身份验证流程和合规要求",
    icon: Shield,
    href: "/console/onboarding",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    id: "trading",
    title: "交易配置",
    description: "配置交易产品、杠杆、手续费等",
    icon: TrendingUp,
    href: "/console/onboarding",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    id: "payment",
    title: "支付配置",
    description: "配置支付渠道、出入金方式等",
    icon: CreditCard,
    href: "/console/onboarding",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

export function ConfigPanel({ tenantId, subdomain }: ConfigPanelProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.protocol + "//" : "http://";
  const host = typeof window !== "undefined" ? window.location.host : "localhost:3002";
  const mainDomain = host.replace(/^[^.]+\./, "");

  const crmUrl = `${baseUrl}crm.${subdomain}.${mainDomain}/crm`;

  return (
    <div className="space-y-4">
      {/* Quick Link to CRM */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900">高级配置</h3>
              <p className="text-sm text-slate-500">
                更详细的业务配置请前往 CRM 后台
              </p>
            </div>
            <a
              href={crmUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                前往 CRM <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Config Items */}
      <div className="grid gap-3">
        {configItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id} className="hover:border-slate-300 transition-colors">
              <CardContent className="p-4">
                <Link href={`${item.href}?tenantId=${tenantId}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{item.title}</h4>
                        <p className="text-sm text-slate-500">{item.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Note */}
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="p-4">
          <p className="text-sm text-slate-600">
            <strong>提示：</strong>部分配置需要在租户完成 onboarding 后才能在 CRM 中进行。
            如果配置项不可用，请先完成租户初始化流程。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
