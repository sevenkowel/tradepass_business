"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  History, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const transactions = [
  { id: "TXN-001", type: "deposit", amount: 5000, currency: "USD", status: "completed", date: "2024-01-15 10:30", method: "Bank Transfer" },
  { id: "TXN-002", type: "withdraw", amount: 1000, currency: "USD", status: "pending", date: "2024-01-14 15:45", method: "Crypto" },
  { id: "TXN-003", type: "transfer", amount: 2500, currency: "USD", status: "completed", date: "2024-01-13 09:20", method: "Internal" },
  { id: "TXN-004", type: "deposit", amount: 10000, currency: "USDT", status: "completed", date: "2024-01-12 14:10", method: "Crypto" },
  { id: "TXN-005", type: "withdraw", amount: 500, currency: "USD", status: "failed", date: "2024-01-11 11:30", method: "Card" },
  { id: "TXN-006", type: "deposit", amount: 3000, currency: "EUR", status: "completed", date: "2024-01-10 16:00", method: "Bank Transfer" },
  { id: "TXN-007", type: "transfer", amount: 1500, currency: "USD", status: "completed", date: "2024-01-09 08:45", method: "Internal" },
  { id: "TXN-008", type: "deposit", amount: 2000, currency: "USD", status: "completed", date: "2024-01-08 13:20", method: "E-Wallet" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-500/10 text-green-500";
    case "pending":
      return "bg-yellow-500/10 text-yellow-500";
    case "failed":
      return "bg-red-500/10 text-red-500";
    default:
      return "bg-gray-500/10 text-gray-500";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "deposit":
      return ArrowDownLeft;
    case "withdraw":
      return ArrowUpRight;
    case "transfer":
      return ArrowLeftRight;
    default:
      return History;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "deposit":
      return "text-green-500 bg-green-500/10";
    case "withdraw":
      return "text-red-500 bg-red-500/10";
    case "transfer":
      return "text-blue-500 bg-blue-500/10";
    default:
      return "text-gray-500 bg-gray-500/10";
  }
};

export default function HistoryPage() {
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredTransactions = transactions.filter(txn => {
    if (filterType !== "all" && txn.type !== filterType) return false;
    if (filterStatus !== "all" && txn.status !== filterStatus) return false;
    if (searchQuery && !txn.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <History className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">Transaction History</h1>
            <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">View all your deposits, withdrawals, and transfers</p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs mb-2 block">Search</Label>
                <Input
                  placeholder="Search by transaction ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[rgb(var(--tp-surface-rgb))]"
                />
              </div>
              <div className="w-40">
                <Label className="text-xs mb-2 block">Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdraw">Withdraw</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Label className="text-xs mb-2 block">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" className="h-10">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="h-10">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transaction List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paginatedTransactions.map((txn, index) => {
                const Icon = getTypeIcon(txn.type);
                return (
                  <motion.div
                    key={txn.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-[rgba(var(--tp-fg-rgb),0.03)] hover:bg-[rgba(var(--tp-fg-rgb),0.05)] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getTypeColor(txn.type))}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-[rgb(var(--tp-fg-rgb))] capitalize">{txn.type}</p>
                        <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">{txn.id}</p>
                      </div>
                    </div>
                    <div className="text-center hidden md:block">
                      <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">{txn.method}</p>
                      <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.4)]">{txn.date}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "font-semibold",
                        txn.type === "deposit" ? "text-green-500" : txn.type === "withdraw" ? "text-red-500" : "text-blue-500"
                      )}>
                        {txn.type === "deposit" ? "+" : txn.type === "withdraw" ? "-" : ""}
                        {txn.amount.toLocaleString()} {txn.currency}
                      </p>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", getStatusColor(txn.status))}>
                        {txn.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[rgba(var(--tp-fg-rgb),0.1)]">
                <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.5)]">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        currentPage === page && "bg-tp-accent text-white"
                      )}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
