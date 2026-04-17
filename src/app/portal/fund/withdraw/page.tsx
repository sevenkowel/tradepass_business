"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight, Landmark, Wallet,
  ChevronRight, AlertCircle, Shield, HelpCircle,
  BarChart3, MessageCircle, ChevronDown,
  AlertTriangle, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const allAccounts = [
  { id: "wallet-usd", platform: "", accountType: "Wallet", currency: "USD", equity: 12500 },
  { id: "7845321", platform: "MT4", accountType: "Standard", currency: "USD", equity: 8200 },
  { id: "7845322", platform: "MT4", accountType: "Raw", currency: "JPY", equity: 920000 },
  { id: "7845323", platform: "MT4", accountType: "ECN", currency: "EUR", equity: 5200 },
  { id: "7845324", platform: "MT4", accountType: "Pro", currency: "USD", equity: 3500 },
  { id: "7845325", platform: "MT4", accountType: "ECN", currency: "EUR", equity: 2800 },
  { id: "8999999", platform: "MT5", accountType: "Standard", currency: "USD", equity: 1000 },
  { id: "8999998", platform: "MT5", accountType: "Pro", currency: "JPY", equity: 1500000 },
  { id: "8999997", platform: "MT5", accountType: "ECN", currency: "EUR", equity: 8500 },
  { id: "8999996", platform: "MT5", accountType: "Pro", currency: "USD", equity: 5200 },
  { id: "8999995", platform: "MT5", accountType: "ECN", currency: "JPY", equity: 850000 },
  { id: "2000001", platform: "TP", accountType: "Classic", currency: "USD", equity: 15800 },
  { id: "2000002", platform: "TP", accountType: "VIP", currency: "JPY", equity: 2200000 },
  { id: "2000003", platform: "TP", accountType: "Pro", currency: "EUR", equity: 4200 },
  { id: "2000004", platform: "TP", accountType: "Classic", currency: "USD", equity: 9500 },
  { id: "2000005", platform: "TP", accountType: "ECN", currency: "EUR", equity: 3100 },
];

// Format helper
function fmtEquity(acc: typeof allAccounts[0]): string {
  const sym = acc.currency === "JPY" ? "¥" : acc.currency === "EUR" ? "€" : "$";
  return `${sym}${acc.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatAccountLabel(a: typeof allAccounts[0]): string {
  if (a.platform) return `${a.platform}-${a.id}-${a.accountType}-${fmtEquity(a)}`;
  return `${a.accountType}-Wallet-${a.currency}-${fmtEquity(a)}`;
}

function accountLabel(id: string): string {
  const a = allAccounts.find(x => x.id === id);
  return a ? formatAccountLabel(a) : "选择账户";
}

const walletAccounts = allAccounts.filter(a => a.platform === "");
const mt4Accounts = allAccounts.filter(a => a.platform === "MT4");
const mt5Accounts = allAccounts.filter(a => a.platform === "MT5");
const tpAccounts = allAccounts.filter(a => a.platform === "TP");
const recommendedAccount = mt5Accounts.find(a => a.currency === "JPY") || mt5Accounts[0];

const withdrawMethods = [
  { id: "crypto", name: "加密货币", icon: "💎", desc: "10-30分钟", items: [{ id: "btc", name: "BTC", fee: "$0.0005", kyc: 1 }, { id: "usdt", name: "USDT", fee: "免费", kyc: 0 }] },
  { id: "bank", name: "银行转账", icon: "🏦", desc: "1-3工作日", items: [{ id: "swift", name: "SWIFT", fee: "$25", kyc: 1 }, { id: "sepa", name: "SEPA", fee: "€15", kyc: 1 }] },
  { id: "ewallet", name: "电子钱包", icon: "📱", desc: "24小时", items: [{ id: "paypal", name: "PayPal", fee: "1.5%", kyc: 0 }, { id: "skrill", name: "Skrill", fee: "1.5%", kyc: 1 }] },
];

export default function WithdrawPage() {
  const [targetAccount, setTargetAccount] = useState(recommendedAccount.id);
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [expandedMethod, setExpandedMethod] = useState<string | null>("crypto");
  const [show2FA, setShow2FA] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedAcc = allAccounts.find(a => a.id === targetAccount);
  const accountSymbol = selectedAcc?.currency === "JPY" ? "¥" : selectedAcc?.currency === "EUR" ? "€" : "$";
  const numericBalance = selectedAcc?.equity || 0;
  const withdrawAmount = parseFloat(amount) || 0;
  const isOverLimit = withdrawAmount > numericBalance;
  const fee = selectedMethod === "swift" ? 25 : selectedMethod === "sepa" ? 15 : 0;
  const receiveAmount = withdrawAmount > 0 ? Math.max(0, withdrawAmount - fee) : 0;

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 rounded-xl bg-red-500/10">
            <ArrowUpRight className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">提款</h1>
            <p className="text-sm text-slate-500">安全快速的提款服务</p>
          </div>
        </div>
      </motion.div>

      {isSubmitted ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">提款申请已提交</h2>
              <p className="text-slate-500">您的提款申请已提交，将在 1-3 个工作日内处理。</p>
              <div className="pt-4 space-y-2 text-left border-t pt-4">
                <div className="flex justify-between text-sm"><span className="text-slate-500">提款金额</span><span className="font-medium">{accountSymbol}{withdrawAmount.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">手续费</span><span className="text-red-500">-{accountSymbol}{fee}</span></div>
                <div className="flex justify-between font-semibold pt-2 border-t"><span className="text-slate-900">实际到账</span><span className="text-lg">{accountSymbol}{receiveAmount.toLocaleString()}</span></div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => { setIsSubmitted(false); setAmount(""); setSelectedMethod(null); }} className="flex-1 h-12 rounded-xl">返回</Button>
                <Button className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl">查看详情</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-600" />选择账户</h2>
                  <Select value={targetAccount} onValueChange={setTargetAccount}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-80">
                      {recommendedAccount && (
                        <>
                          <div className="px-2 py-1.5 text-xs font-medium text-amber-600">⭐ 推荐账户</div>
                          <SelectItem value={recommendedAccount.id}>
                            <span className="font-mono text-sm text-slate-900">{formatAccountLabel(recommendedAccount)}</span>
                          </SelectItem>
                          <div className="h-px bg-slate-100 my-1" /><div className="px-2 py-1.5 text-xs font-medium text-slate-500">其他账户</div>
                        </>
                      )}
                      {walletAccounts.map(acc => (
                        <SelectItem key={acc.id} value={acc.id}>
                          <span className="font-mono text-sm text-slate-700">{formatAccountLabel(acc)}</span>
                        </SelectItem>
                      ))}
                      {mt4Accounts.filter(a => a.id !== recommendedAccount?.id).length > 0 && (<>
                        <div className="h-px bg-slate-100 my-1" />
                        <div className="px-2 py-1.5 text-xs font-medium text-slate-500 flex justify-between">
                          MT4 <span className="font-normal text-slate-400">({mt4Accounts.filter(a => a.id !== recommendedAccount?.id).length})</span>
                        </div>
                        {mt4Accounts.filter(a => a.id !== recommendedAccount?.id).map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>
                            <span className="font-mono text-sm text-slate-700">{formatAccountLabel(acc)}</span>
                          </SelectItem>
                        ))}
                      </>)}
                      {mt5Accounts.filter(a => a.id !== recommendedAccount?.id).length > 0 && (<>
                        <div className="h-px bg-slate-100 my-1" />
                        <div className="px-2 py-1.5 text-xs font-medium text-slate-500 flex justify-between">
                          MT5 <span className="font-normal text-slate-400">({mt5Accounts.filter(a => a.id !== recommendedAccount?.id).length})</span>
                        </div>
                        {mt5Accounts.filter(a => a.id !== recommendedAccount?.id).map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>
                            <span className="font-mono text-sm text-slate-700">{formatAccountLabel(acc)}</span>
                          </SelectItem>
                        ))}
                      </>)}
                      {tpAccounts.filter(a => a.id !== recommendedAccount?.id).length > 0 && (<>
                        <div className="h-px bg-slate-100 my-1" />
                        <div className="px-2 py-1.5 text-xs font-medium text-slate-500 flex justify-between">
                          TP <span className="font-normal text-slate-400">({tpAccounts.filter(a => a.id !== recommendedAccount?.id).length})</span>
                        </div>
                        {tpAccounts.filter(a => a.id !== recommendedAccount?.id).map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>
                            <span className="font-mono text-sm text-slate-700">{formatAccountLabel(acc)}</span>
                          </SelectItem>
                        ))}
                      </>)}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><Wallet className="w-5 h-5 text-slate-600" />提款金额</h2>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-400">{accountSymbol}</span>
                    <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-12 h-16 text-3xl font-bold" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">可提金额</span>
                    <button onClick={() => setAmount(numericBalance.toString())} className="text-red-500 font-medium hover:underline">{accountSymbol}{numericBalance.toLocaleString()} 全部</button>
                  </div>
                  {isOverLimit && amount && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" />超过可提金额
                    </div>
                  )}
                  <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />大额提款需人工审核，预计 1-3 个工作日到账
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><Landmark className="w-5 h-5 text-slate-600" />提款方式</h2>
                  <div className="space-y-2">
                    {withdrawMethods.map(method => {
                      const isExpanded = expandedMethod === method.id;
                      return (
                        <div key={method.id} className="border border-slate-200 rounded-xl overflow-hidden">
                          <button onClick={() => setExpandedMethod(isExpanded ? null : method.id)} className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-3"><span className="text-lg">{method.icon}</span><div className="text-left"><span className="font-medium text-slate-900">{method.name}</span><span className="ml-2 text-xs text-slate-500">{method.desc}</span></div></div>
                            {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                          </button>
                          {isExpanded && (
                            <div className="divide-y divide-slate-100">
                              {method.items.map(item => (
                                <button key={item.id} onClick={() => setSelectedMethod(item.id)} className={cn("w-full px-4 py-3 flex items-center justify-between transition-colors", selectedMethod === item.id ? "bg-slate-900 text-white" : "hover:bg-slate-50")}>
                                  <div className="flex items-center gap-2"><span className={selectedMethod === item.id ? "text-white" : "text-slate-700"}>{item.name}</span>{item.kyc > 0 && <span className="text-xs px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded">需 L{item.kyc}</span>}</div>
                                  <span className={selectedMethod === item.id ? "text-white/70" : "text-slate-500"}>{item.fee}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-200/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><Wallet className="w-5 h-5 text-red-600" /><h3 className="font-bold text-slate-900 text-sm">可提金额</h3></div>
                    <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><HelpCircle className="w-4 h-4" /></button>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{accountSymbol}{numericBalance.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">{accountLabel(targetAccount)}</p>
                </CardContent>
              </Card>

              {withdrawAmount > 0 && (
                <Card>
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-semibold text-slate-900 text-sm">费用明细</h3>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">提款金额</span><span className="font-medium">{accountSymbol}{withdrawAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">手续费</span><span className="text-red-500">{accountSymbol}{fee.toLocaleString()}</span></div>
                    <div className="border-t pt-2 flex justify-between font-semibold"><span className="text-slate-900">实际到账</span><span className="text-lg text-slate-900">{accountSymbol}{receiveAmount.toLocaleString()}</span></div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2"><Shield className="w-5 h-5 text-slate-600" /><h3 className="font-semibold text-slate-900 text-sm">安全提示</h3></div>
                  <ul className="space-y-2 text-xs text-slate-500">
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />提款需要二次验证（2FA）</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />大额提款需人工审核</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />新增收款账户需 24h 延迟</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3"><MessageCircle className="w-5 h-5 text-slate-600" /><h3 className="font-semibold text-slate-900 text-sm">常见问题</h3></div>
                  <div className="space-y-0">
                    {["提款多久到账？", "如何添加收款账户？", "提款限额是多少？"].map((q, i) => (
                      <div key={i} className="border-b border-slate-100 last:border-0">
                        <button className="w-full flex items-center justify-between py-3 text-sm text-slate-700 hover:text-slate-900 text-left">{q}<ChevronDown className="w-4 h-4 text-slate-400" /></button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button onClick={() => setShow2FA(true)} disabled={!amount || isOverLimit || !selectedMethod} className="w-full h-12 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl">
                确认提款<ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {show2FA && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 rounded-2xl max-w-md w-full mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4"><Shield className="w-8 h-8 text-slate-600" /></div>
              <h3 className="text-xl font-bold text-slate-900">安全验证</h3>
              <p className="text-sm text-slate-500 mt-1">请输入 6 位验证码</p>
            </div>
            <div className="space-y-4">
              <Input type="text" placeholder="000000" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} className="text-center text-2xl tracking-widest h-14" />
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setShow2FA(false)} className="flex-1 h-12 rounded-xl">取消</Button>
                <Button onClick={() => { setShow2FA(false); setIsSubmitted(true); }} disabled={otpCode.length !== 6} className="flex-1 h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl">确认</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
