"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CreditCard, 
  Bitcoin, 
  Landmark,
  Plus,
  Trash2,
  Star,
  Check,
  AlertCircle,
  X,
  Copy,
  CheckCircle2,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type AccountType = "bank" | "crypto";

interface PaymentAccount {
  id: string;
  type: AccountType;
  name: string;
  isDefault: boolean;
  verified: boolean;
  details: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
    swiftCode?: string;
    currency?: string;
    cryptoSymbol?: string;
    network?: string;
    address?: string;
  };
}

const initialAccounts: PaymentAccount[] = [
  {
    id: "bank-1",
    type: "bank",
    name: "Chase Bank",
    isDefault: true,
    verified: true,
    details: {
      bankName: "Chase Bank",
      accountNumber: "****4521",
      accountHolder: "John Doe",
      swiftCode: "CHASUS33",
      currency: "USD"
    }
  },
  {
    id: "bank-2",
    type: "bank",
    name: "HSBC",
    isDefault: false,
    verified: true,
    details: {
      bankName: "HSBC",
      accountNumber: "****7890",
      accountHolder: "John Doe",
      swiftCode: "HBUKGB4B",
      currency: "GBP"
    }
  },
  {
    id: "crypto-1",
    type: "crypto",
    name: "BTC Wallet",
    isDefault: false,
    verified: true,
    details: {
      cryptoSymbol: "BTC",
      network: "Bitcoin",
      address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
    }
  }
];

const cryptoNetworks = [
  { id: "btc", name: "Bitcoin", symbol: "BTC" },
  { id: "eth", name: "Ethereum", symbol: "ETH" },
  { id: "usdt_erc20", name: "USDT (ERC20)", symbol: "USDT" },
  { id: "usdt_trc20", name: "USDT (TRC20)", symbol: "USDT" },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<PaymentAccount[]>(initialAccounts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState<AccountType>("bank");
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Bank form state
  const [bankForm, setBankForm] = useState({
    bankName: "",
    accountHolder: "",
    accountNumber: "",
    swiftCode: "",
    currency: "USD"
  });

  // Crypto form state
  const [cryptoForm, setCryptoForm] = useState({
    network: "btc",
    address: "",
    label: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const handleSetDefault = (id: string) => {
    setAccounts(prev => prev.map(acc => ({
      ...acc,
      isDefault: acc.id === id
    })));
  };

  const handleDelete = (id: string) => {
    setAccounts(prev => prev.filter(acc => acc.id !== id));
    setDeleteConfirm(null);
  };

  const handleAddBank = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newAccount: PaymentAccount = {
      id: `bank-${Date.now()}`,
      type: "bank",
      name: bankForm.bankName,
      isDefault: accounts.length === 0,
      verified: false,
      details: {
        bankName: bankForm.bankName,
        accountNumber: `****${bankForm.accountNumber.slice(-4)}`,
        accountHolder: bankForm.accountHolder,
        swiftCode: bankForm.swiftCode,
        currency: bankForm.currency
      }
    };
    
    setAccounts(prev => [...prev, newAccount]);
    setBankForm({ bankName: "", accountHolder: "", accountNumber: "", swiftCode: "", currency: "USD" });
    setShowAddModal(false);
    setIsSubmitting(false);
  };

  const handleAddCrypto = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const network = cryptoNetworks.find(n => n.id === cryptoForm.network);
    const newAccount: PaymentAccount = {
      id: `crypto-${Date.now()}`,
      type: "crypto",
      name: cryptoForm.label || `${network?.symbol} Wallet`,
      isDefault: accounts.length === 0,
      verified: true,
      details: {
        cryptoSymbol: network?.symbol,
        network: network?.name,
        address: cryptoForm.address
      }
    };
    
    setAccounts(prev => [...prev, newAccount]);
    setCryptoForm({ network: "btc", address: "", label: "" });
    setShowAddModal(false);
    setIsSubmitting(false);
  };

  const bankAccounts = accounts.filter(a => a.type === "bank");
  const cryptoAccounts = accounts.filter(a => a.type === "crypto");

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[rgba(var(--tp-accent-rgb),0.1)]">
              <CreditCard className="w-6 h-6 text-[rgb(var(--tp-accent-rgb))]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">Payment Accounts</h1>
              <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">Manage your withdrawal accounts and crypto wallets</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-[rgb(var(--tp-accent-rgb))] hover:bg-[rgba(var(--tp-accent-rgb),0.9)] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">{bankAccounts.length}</p>
                <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">Bank Accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Bitcoin className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">{cryptoAccounts.length}</p>
                <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">Crypto Wallets</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[rgb(var(--tp-fg-rgb))]">
                  {accounts.filter(a => a.verified).length}
                </p>
                <p className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">Verified Accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Accounts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({accounts.length})</TabsTrigger>
            <TabsTrigger value="bank">Bank ({bankAccounts.length})</TabsTrigger>
            <TabsTrigger value="crypto">Crypto ({cryptoAccounts.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {accounts.length === 0 ? (
              <EmptyState onAdd={() => setShowAddModal(true)} />
            ) : (
              accounts.map((account, index) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  index={index}
                  onSetDefault={handleSetDefault}
                  onDelete={setDeleteConfirm}
                  onCopy={handleCopy}
                  copiedAddress={copiedAddress}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="bank" className="space-y-4">
            {bankAccounts.length === 0 ? (
              <EmptyState type="bank" onAdd={() => { setAddType("bank"); setShowAddModal(true); }} />
            ) : (
              bankAccounts.map((account, index) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  index={index}
                  onSetDefault={handleSetDefault}
                  onDelete={setDeleteConfirm}
                  onCopy={handleCopy}
                  copiedAddress={copiedAddress}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="crypto" className="space-y-4">
            {cryptoAccounts.length === 0 ? (
              <EmptyState type="crypto" onAdd={() => { setAddType("crypto"); setShowAddModal(true); }} />
            ) : (
              cryptoAccounts.map((account, index) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  index={index}
                  onSetDefault={handleSetDefault}
                  onDelete={setDeleteConfirm}
                  onCopy={handleCopy}
                  copiedAddress={copiedAddress}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Add Account Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[rgb(var(--tp-bg-rgb))] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-[rgba(var(--tp-fg-rgb),0.1)] flex items-center justify-between">
                <h3 className="text-xl font-bold text-[rgb(var(--tp-fg-rgb))]">Add Payment Account</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6">
                <Tabs value={addType} onValueChange={(v) => setAddType(v as AccountType)} className="w-full">
                  <TabsList className="w-full mb-6">
                    <TabsTrigger value="bank" className="flex-1">
                      <Landmark className="w-4 h-4 mr-2" />
                      Bank Account
                    </TabsTrigger>
                    <TabsTrigger value="crypto" className="flex-1">
                      <Bitcoin className="w-4 h-4 mr-2" />
                      Crypto Wallet
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="bank" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Bank Name</Label>
                      <Input
                        placeholder="e.g., Chase Bank"
                        value={bankForm.bankName}
                        onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                        className="bg-[rgb(var(--tp-surface-rgb))]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Holder Name</Label>
                      <Input
                        placeholder="Full name on account"
                        value={bankForm.accountHolder}
                        onChange={(e) => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                        className="bg-[rgb(var(--tp-surface-rgb))]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input
                        placeholder="Enter account number"
                        value={bankForm.accountNumber}
                        onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                        className="bg-[rgb(var(--tp-surface-rgb))]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SWIFT/BIC Code</Label>
                      <Input
                        placeholder="e.g., CHASUS33"
                        value={bankForm.swiftCode}
                        onChange={(e) => setBankForm({ ...bankForm, swiftCode: e.target.value })}
                        className="bg-[rgb(var(--tp-surface-rgb))]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select 
                        value={bankForm.currency} 
                        onValueChange={(v) => setBankForm({ ...bankForm, currency: v })}
                      >
                        <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-600 text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Bank accounts require verification. We'll make a small deposit to verify ownership.</span>
                    </div>
                    <Button 
                      onClick={handleAddBank}
                      disabled={!bankForm.bankName || !bankForm.accountHolder || !bankForm.accountNumber || isSubmitting}
                      className="w-full h-12 bg-[rgb(var(--tp-accent-rgb))] hover:bg-[rgba(var(--tp-accent-rgb),0.9)] text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Bank Account"
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="crypto" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Network</Label>
                      <Select 
                        value={cryptoForm.network} 
                        onValueChange={(v) => setCryptoForm({ ...cryptoForm, network: v })}
                      >
                        <SelectTrigger className="bg-[rgb(var(--tp-surface-rgb))]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {cryptoNetworks.map(network => (
                            <SelectItem key={network.id} value={network.id}>
                              {network.name} ({network.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Wallet Address</Label>
                      <Input
                        placeholder="Enter wallet address"
                        value={cryptoForm.address}
                        onChange={(e) => setCryptoForm({ ...cryptoForm, address: e.target.value })}
                        className="bg-[rgb(var(--tp-surface-rgb))]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Label (Optional)</Label>
                      <Input
                        placeholder="e.g., My BTC Wallet"
                        value={cryptoForm.label}
                        onChange={(e) => setCryptoForm({ ...cryptoForm, label: e.target.value })}
                        className="bg-[rgb(var(--tp-surface-rgb))]"
                      />
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10 text-red-600 text-sm flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Double-check the address and network. Crypto transactions cannot be reversed.</span>
                    </div>
                    <Button 
                      onClick={handleAddCrypto}
                      disabled={!cryptoForm.address || isSubmitting}
                      className="w-full h-12 bg-[rgb(var(--tp-accent-rgb))] hover:bg-[rgba(var(--tp-accent-rgb),0.9)] text-white"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Crypto Wallet"
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[rgb(var(--tp-bg-rgb))] p-6 rounded-2xl max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-[rgb(var(--tp-fg-rgb))] mb-2">Delete Account?</h3>
              <p className="text-[rgba(var(--tp-fg-rgb),0.6)] mb-6">
                This action cannot be undone. The account will be permanently removed from your payment methods.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleDelete(deleteConfirm)}
                  variant="destructive"
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AccountCard({ 
  account, 
  index, 
  onSetDefault, 
  onDelete, 
  onCopy,
  copiedAddress 
}: { 
  account: PaymentAccount;
  index: number;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (address: string) => void;
  copiedAddress: string | null;
}) {
  const isCrypto = account.type === "crypto";
  const Icon = isCrypto ? Bitcoin : Landmark;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "p-4 rounded-xl border-2 transition-all",
        account.isDefault 
          ? "border-[rgb(var(--tp-accent-rgb))] bg-[rgba(var(--tp-accent-rgb),0.03)]" 
          : "border-[rgba(var(--tp-fg-rgb),0.1)] hover:border-[rgba(var(--tp-fg-rgb),0.2)]"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            isCrypto ? "bg-orange-500/10" : "bg-blue-500/10"
          )}>
            <Icon className={cn("w-6 h-6", isCrypto ? "text-orange-500" : "text-blue-500")} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[rgb(var(--tp-fg-rgb))]">{account.name}</h3>
              {account.isDefault && (
                <span className="px-2 py-0.5 rounded-full bg-[rgb(var(--tp-accent-rgb))] text-white text-xs">
                  Default
                </span>
              )}
              {!account.verified && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500 text-xs">
                  Pending
                </span>
              )}
            </div>
            
            {isCrypto ? (
              <div className="mt-2 flex items-center gap-2">
                <code className="text-sm text-[rgba(var(--tp-fg-rgb),0.6)] bg-[rgba(var(--tp-fg-rgb),0.05)] px-2 py-1 rounded">
                  {account.details.address?.slice(0, 12)}...{account.details.address?.slice(-8)}
                </code>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => onCopy(account.details.address || "")}
                >
                  {copiedAddress === account.details.address ? (
                    <Check className="w-3 h-3 text-green-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
                <span className="text-xs text-[rgba(var(--tp-fg-rgb),0.5)]">{account.details.network}</span>
              </div>
            ) : (
              <div className="mt-1 text-sm text-[rgba(var(--tp-fg-rgb),0.6)]">
                <p>{account.details.bankName} • {account.details.accountNumber}</p>
                <p className="text-xs">{account.details.accountHolder} • {account.details.currency}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!account.isDefault && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onSetDefault(account.id)}
            >
              <Star className="w-4 h-4 mr-1" />
              Set Default
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onDelete(account.id)}
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ type, onAdd }: { type?: "bank" | "crypto"; onAdd: () => void }) {
  const isCrypto = type === "crypto";
  const Icon = isCrypto ? Bitcoin : type === "bank" ? Landmark : CreditCard;
  const title = type ? `${isCrypto ? "Crypto" : "Bank"} Accounts` : "Payment Accounts";
  const description = type 
    ? `No ${isCrypto ? "crypto wallets" : "bank accounts"} added yet.` 
    : "No payment accounts added yet.";

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full bg-[rgba(var(--tp-fg-rgb),0.05)] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-8 h-8 text-[rgba(var(--tp-fg-rgb),0.4)]" />
      </div>
      <h3 className="text-lg font-medium text-[rgb(var(--tp-fg-rgb))] mb-1">{title}</h3>
      <p className="text-sm text-[rgba(var(--tp-fg-rgb),0.5)] mb-4">{description}</p>
      <Button onClick={onAdd} variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        Add {type ? (isCrypto ? "Wallet" : "Account") : "Account"}
      </Button>
    </div>
  );
}
