"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeftRight, Wallet, TrendingUp, CreditCard,
  ChevronRight, Clock, HelpCircle, MessageCircle,
  ChevronDown, AlertCircle, CheckCircle2, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const allAccounts = [
  { id: "wallet-usd", name: "USD 钱包", type: "wallet" as const, currency: "USD", balance: "$12,500.00" },
  { id: "mt4-001", name: "MT4-001 Standard", type: "mt4" as const, currency: "USD", balance: "$8,200.00" },
  { id: "mt4-002", name: "MT4-002 Standard", type: "mt4" as const, currency: "JPY", balance: "¥920,000" },
  { id: "mt4-003", name: "MT4-003 ECN", type: "mt4" as const, currency: "EUR", balance: "€5,200.00" },
  { id: "mt4-004", name: "MT4-004 Pro", type: "mt4" as const, currency: "USD", balance: "$3,500.00" },
  { id: "mt4-005", name: "MT4-005 ECN", type: "mt4" as const, currency: "EUR", balance: "€2,800.00" },
  { id: "mt5-001", name: "MT5-001 Standard", type: "mt5" as const, currency: "USD", balance: "$12,500.00" },
  { id: "mt5-002", name: "MT5-002 Pro", type: "mt5" as const, currency: "JPY", balance: "¥1,500,000" },
  { id: "mt5-003", name: "MT5-003 ECN", type: "mt5" as const, currency: "EUR", balance: "€8,500.00" },
  { id: "mt5-004", name: "MT5-004 Pro", type: "mt5" as const, currency: "USD", balance: "$5,200.00" },
  { id: "mt5-005", name: "MT5-005 ECN", type: "mt5" as const, currency: "JPY", balance: "¥850,000" },
  { id: "tp-001", name: "TP-001 Standard", type: "tp" as const, currency: "USD", balance: "$15,800.00" },
  { id: "tp-002", name: "TP-002 Pro", type: "tp" as const, currency: "JPY", balance: "¥2,200,000" },
  { id: "tp-003", name: "TP-003 ECN", type: "tp" as const, currency: "EUR", balance: "€4,200.00" },
  { id: "tp-004", name: "TP-004 Pro", type: "tp" as const, currency: "USD", balance: "$9,500.00" },
  { id: "tp-005", name: "TP-005 Standard", type: "tp" as const, currency: "EUR", balance: "€3,100.00" },
];

const walletAccounts = allAccounts.filter(a => a.type === "wallet");
const mt4Accounts = allAccounts.filter(a => a.type === "mt4");
const mt5Accounts = allAccounts.filter(a => a.type === "mt5");
const tpAccounts = allAccounts.filter(a => a.type === "tp");

function AccountOption({ acc }: { acc: typeof allAccounts[0] }) {
  return (
    <SelectItem key={acc.id} value={acc.id} className="py-3">
      <span className="font-medium">{acc.name}</span>
      <span className="ml-2 text-sm text-slate-500">{acc.balance}</span>
    </SelectItem>
  );
}

export default function TransferPage() {
  const [direction, setDirection] = useState<"toAccount" | "toWallet">("toAccount");
  const [fromId, setFromId] = useState("wallet-usd");
  const [toId, setToId] = useState("mt5-001");
  const [amount, setAmount] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const fromAcc = allAccounts.find(a => a.id === fromId);
  const toAcc = allAccounts.find(a => a.id === toId);
  const fromSymbol = fromAcc?.currency === "JPY" ? "¥" : fromAcc?.currency === "EUR" ? "€" : "$";
  const fromBalance = fromAcc?.balance ? parseFloat(fromAcc.balance.replace(/[¥€$,]/g, "")) : 0;
  const transferAmount = parseFloat(amount) || 0;
  const isOverLimit = transferAmount > fromBalance;

  const handleSwap = () => {
    if (direction === "toAccount") {
      setDirection("toWallet");
      setFromId("mt5-001");
      setToId("wallet-usd");
    } else {
      setDirection("toAccount");
      setFromId("wallet-usd");
      setToId("mt5-001");
    }
  };

  const handleSubmit = () => {
    setIsSuccess(true);
  };

  const handleReset = () => {
    setAmount("");
    setIsSuccess(false);
  };

  const fromAccounts = direction === "toAccount" ? walletAccounts : mt5Accounts;
  const toAccounts = direction === "toAccount"
    ? [...mt4Accounts, ...mt5Accounts, ...tpAccounts].filter(a => a.id !== fromId)
    : walletAccounts.filter(a => a.id !== fromId);

  return (
    <div className="p-6 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 rounded-xl bg-blue-500/10">
            <ArrowLeftRight className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">划转</h1>
            <p className="text-sm text-slate-500">钱包与交易账户之间实时划转</p>
          </div>
        </div>
      </motion.div>

      {isSuccess ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">划转成功</h2>
              <p className="text-slate-500">划转已完成，资金即时到账</p>
              <div className="pt-4 space-y-2 text-left border-t">
                <div className="flex justify-between text-sm"><span className="text-slate-500">划转金额</span><span className="font-medium">{fromSymbol}{transferAmount.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">从</span><span className="font-medium">{fromAcc?.name}</span></div>
                <div className="flex justify-between text-sm"><span className="text-slate-500">到</span><span className="font-medium">{toAcc?.name}</span></div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleReset} className="flex-1 h-12 rounded-xl">继续划转</Button>
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
                <CardContent className="p-6 space-y-6">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-slate-600" />
                    划转方向
                  </h2>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => { setDirection("toAccount"); setFromId("wallet-usd"); setToId("mt5-001"); }}
                      className={cn("flex-1 p-4 rounded-xl text-center cursor-pointer transition-all border-2",
                        direction === "toAccount" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      )}
                    >
                      <Wallet className={cn("w-6 h-6 mx-auto mb-2", direction === "toAccount" ? "text-blue-500" : "text-slate-400")} />
                      <p className={cn("text-sm font-medium", direction === "toAccount" ? "text-blue-700" : "text-slate-600")}>钱包 → 账户</p>
                    </button>
                    <button onClick={handleSwap} className="p-3 rounded-xl hover:bg-slate-100 transition-colors">
                      <ArrowLeftRight className="w-5 h-5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => { setDirection("toWallet"); setFromId("mt5-001"); setToId("wallet-usd"); }}
                      className={cn("flex-1 p-4 rounded-xl text-center cursor-pointer transition-all border-2",
                        direction === "toWallet" ? "border-purple-500 bg-purple-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      )}
                    >
                      <CreditCard className={cn("w-6 h-6 mx-auto mb-2", direction === "toWallet" ? "text-purple-500" : "text-slate-400")} />
                      <p className={cn("text-sm font-medium", direction === "toWallet" ? "text-purple-700" : "text-slate-600")}>账户 → 钱包</p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-600" />从</h2>
                  <Select value={fromId} onValueChange={setFromId}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-80">
                      {fromAccounts.map(acc => <AccountOption key={acc.id} acc={acc} />)}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between">
                    <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><Wallet className="w-5 h-5 text-slate-600" />金额</h2>
                    <button onClick={() => setAmount(fromBalance.toString())} className="text-sm text-blue-600 hover:underline">
                      最大: {fromAcc?.balance}
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-slate-400">{fromSymbol}</span>
                    <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-12 h-16 text-3xl font-bold" />
                  </div>
                  {isOverLimit && amount && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />超过可用余额
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-slate-600" />到</h2>
                  <Select value={toId} onValueChange={setToId}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-80">
                      {toAccounts.map(acc => <AccountOption key={acc.id} acc={acc} />)}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                <Clock className="w-4 h-4 shrink-0" />
                划转即时到账，无手续费
              </div>
            </div>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-200/50">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2"><Wallet className="w-5 h-5 text-blue-600" /><h3 className="font-bold text-slate-900 text-sm">可用余额</h3></div>
                    <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"><HelpCircle className="w-4 h-4" /></button>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">{fromAcc?.balance}</p>
                  <p className="text-xs text-slate-500 mt-1">{fromAcc?.name}</p>
                </CardContent>
              </Card>

              {transferAmount > 0 && (
                <Card>
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-semibold text-slate-900 text-sm">划转明细</h3>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">划转金额</span><span className="font-medium">{fromSymbol}{transferAmount.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500">手续费</span><span className="text-emerald-500">免费</span></div>
                    <div className="border-t pt-2 flex justify-between font-semibold"><span className="text-slate-900">从账户扣除</span><span className="text-lg text-slate-900">{fromSymbol}{transferAmount.toLocaleString()}</span></div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-emerald-500" /><h3 className="font-semibold text-slate-900 text-sm">划转说明</h3></div>
                  <ul className="space-y-2 text-xs text-slate-500">
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />划转即时到账，无手续费</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />支持同币种及跨币种划转</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />交易账户需先完成入金才能划转</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3"><MessageCircle className="w-5 h-5 text-slate-600" /><h3 className="font-semibold text-slate-900 text-sm">常见问题</h3></div>
                  <div className="space-y-0">
                    {["划转多久到账？", "支持哪些币种？", "有手续费吗？"].map((q, i) => (
                      <div key={i} className="border-b border-slate-100 last:border-0">
                        <button className="w-full flex items-center justify-between py-3 text-sm text-slate-700 hover:text-slate-900 text-left">{q}<ChevronDown className="w-4 h-4 text-slate-400" /></button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleSubmit} disabled={!amount || isOverLimit} className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl">
                确认划转<ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
