"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { API_SPEC } from "@/lib/api-docs/spec";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Code,
  Copy,
} from "lucide-react";

export default function ApiDocsPage() {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set([0]));
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  function toggleGroup(idx: number) {
    const next = new Set(expandedGroups);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setExpandedGroups(next);
  }

  function toggleEndpoint(key: string) {
    const next = new Set(expandedEndpoints);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setExpandedEndpoints(next);
  }

  function copyPath(path: string) {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 1500);
  }

  const methodColors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-700",
    POST: "bg-emerald-100 text-emerald-700",
    PATCH: "bg-amber-100 text-amber-700",
    PUT: "bg-orange-100 text-orange-700",
    DELETE: "bg-red-100 text-red-700",
  };

  return (
    <div className="p-6  mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))] flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-[rgb(var(--tp-accent-rgb))]" />
          API 文档
        </h1>
        <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)] mt-1">
          TradePass SaaS 平台完整 API 参考
        </p>
      </div>

      {/* Overview Card */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Code className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-[rgb(var(--tp-fg-rgb))]">{API_SPEC.reduce((acc, g) => acc + g.endpoints.length, 0)}</p>
                <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">API 端点</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-[rgb(var(--tp-fg-rgb))]">{API_SPEC.length}</p>
                <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">API 分组</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-[rgb(var(--tp-fg-rgb))]">JWT</p>
                <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">认证方式</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auth Note */}
      <Card className="mb-6 border-amber-200 bg-amber-50/50">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">认证说明</p>
            <p className="text-xs text-amber-700 mt-1">
              所有 API 请求需在 Header 中携带 <code className="bg-amber-100 px-1 rounded">Authorization: Bearer {'<token>'}</code>。
              Token 通过登录接口获取。Webhooks 使用 Stripe 签名验证。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* API Groups */}
      <div className="space-y-4">
        {API_SPEC.map((group, gIdx) => (
          <Card key={group.name} className="overflow-hidden">
            <button
              onClick={() => toggleGroup(gIdx)}
              className="w-full flex items-center justify-between p-4 hover:bg-[rgba(var(--tp-fg-rgb),0.02)] transition-colors"
            >
              <div className="text-left">
                <h3 className="font-bold text-[rgb(var(--tp-fg-rgb))]">{group.name}</h3>
                <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">{group.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[rgba(var(--tp-fg-rgb),0.4)]">{group.endpoints.length} 个端点</span>
                {expandedGroups.has(gIdx) ? (
                  <ChevronDown className="w-4 h-4 text-[rgba(var(--tp-fg-rgb),0.4)]" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-[rgba(var(--tp-fg-rgb),0.4)]" />
                )}
              </div>
            </button>

            {expandedGroups.has(gIdx) && (
              <div className="border-t border-[var(--tp-border)]">
                {group.endpoints.map((ep) => {
                  const key = `${group.name}-${ep.path}`;
                  const expanded = expandedEndpoints.has(key);

                  return (
                    <div key={key} className="border-b border-[var(--tp-border)] last:border-b-0">
                      <button
                        onClick={() => toggleEndpoint(key)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[rgba(var(--tp-fg-rgb),0.02)] transition-colors text-left"
                      >
                        <span
                          className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded min-w-[52px] text-center",
                            methodColors[ep.method] || "bg-gray-100 text-gray-700"
                          )}
                        >
                          {ep.method}
                        </span>
                        <code className="text-sm text-[rgb(var(--tp-fg-rgb))] font-mono">{ep.path}</code>
                        <span className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)] flex-1 truncate">{ep.description}</span>
                        <div className="flex items-center gap-1">
                          {ep.auth === "None" ? (
                            <Unlock className="w-3 h-3 text-[rgba(var(--tp-fg-rgb),0.3)]" />
                          ) : (
                            <Lock className="w-3 h-3 text-[rgba(var(--tp-fg-rgb),0.4)]" />
                          )}
                          <span className="text-xs text-[rgba(var(--tp-fg-rgb),0.4)]">{ep.auth}</span>
                        </div>
                      </button>

                      {expanded && (
                        <div className="px-4 pb-4 bg-[rgba(var(--tp-fg-rgb),0.01)]">
                          <div className="flex items-center gap-2 mb-3">
                            <code className="text-sm bg-slate-800 text-slate-200 px-3 py-1.5 rounded-md font-mono flex-1">
                              {ep.method} https://api.tradepass.io{ep.path}
                            </code>
                            <button
                              onClick={() => copyPath(`https://api.tradepass.io${ep.path}`)}
                              className="p-1.5 rounded-md hover:bg-[rgba(var(--tp-fg-rgb),0.05)] transition-colors"
                            >
                              {copiedPath === `https://api.tradepass.io${ep.path}` ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-[rgba(var(--tp-fg-rgb),0.4)]" />
                              )}
                            </button>
                          </div>

                          {ep.request && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-[rgba(var(--tp-fg-rgb),0.5)] uppercase mb-2">Request Body</p>
                              <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                                <pre className="text-xs text-slate-300 font-mono">
                                  {JSON.stringify(
                                    Object.fromEntries(
                                      Object.entries(ep.request).map(([k, v]) => [
                                        k,
                                        `${v.type}${v.required ? "" : "?"} // ${v.description}`,
                                      ])
                                    ),
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            </div>
                          )}

                          {ep.response && (
                            <div className="mb-3">
                              <p className="text-xs font-semibold text-[rgba(var(--tp-fg-rgb),0.5)] uppercase mb-2">Response</p>
                              <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                                <pre className="text-xs text-slate-300 font-mono">
                                  {JSON.stringify(
                                    Object.fromEntries(
                                      Object.entries(ep.response).map(([k, v]) => [k, `${v.type} // ${v.description}`])
                                    ),
                                    null,
                                    2
                                  )}
                                </pre>
                              </div>
                            </div>
                          )}

                          {ep.errors && ep.errors.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-[rgba(var(--tp-fg-rgb),0.5)] uppercase mb-2">Error Codes</p>
                              <div className="space-y-1">
                                {ep.errors.map((err) => (
                                  <div key={err.code} className="flex items-center gap-2 text-xs">
                                    <span className="text-red-500 font-mono">{err.code}</span>
                                    <span className="text-[rgba(var(--tp-fg-rgb),0.6)]">{err.message}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
