"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle, Mail, Phone, FileText, Search, ChevronRight,
  HelpCircle, Book, Video, MessageSquare, Clock, CheckCircle2,
  AlertCircle, Send
} from "lucide-react";
import { PageHeader } from "@/components/portal/widgets/PageHeader";
import { cn } from "@/lib/utils";

const faqs = [
  { q: "How do I deposit funds?", a: "Go to Wallet → Deposit and select your preferred payment method. We support USDT, BTC, ETH, and bank wire transfers." },
  { q: "What is the minimum withdrawal amount?", a: "Minimum withdrawal is $50 for crypto and $1,000 for bank wire transfers. Fees vary by method." },
  { q: "How does copy trading work?", a: "Browse signal providers in Copy Trading → Discover, select a trader, and allocate funds to automatically copy their trades." },
  { q: "What leverage is available?", a: "Leverage ranges from 1:1 to 1:500 depending on the instrument and your account type." },
  { q: "How do I become an IB?", a: "Go to IB → Overview and click 'Become an IB'. You'll receive a referral link to share with potential clients." },
];

const tickets = [
  { id: "TKT001", subject: "Deposit not showing", status: "open", lastUpdate: "2h ago", priority: "high" },
  { id: "TKT002", subject: "Account verification", status: "resolved", lastUpdate: "1d ago", priority: "normal" },
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<"faq" | "tickets" | "contact">("faq");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-6">
      <PageHeader title="Support Center" description="Get help and find answers to your questions." />

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: MessageCircle, label: "Live Chat", desc: "24/7 support", color: "blue" },
          { icon: Mail, label: "Email Us", desc: "support@tradepass.com", color: "indigo" },
          { icon: Book, label: "Knowledge Base", desc: "Help articles", color: "emerald" },
          { icon: Video, label: "Video Tutorials", desc: "Learn to trade", color: "amber" },
        ].map(({ icon: Icon, label, desc, color }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "rounded-2xl bg-white border-2 p-4 text-left transition-all hover:shadow-sm",
              color === "blue" && "border-blue-200 hover:border-blue-300",
              color === "indigo" && "border-indigo-200 hover:border-indigo-300",
              color === "emerald" && "border-emerald-200 hover:border-emerald-300",
              color === "amber" && "border-amber-200 hover:border-amber-300",
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center mb-3 border",
              color === "blue" && "bg-blue-50 border-blue-200",
              color === "indigo" && "bg-indigo-50 border-indigo-200",
              color === "emerald" && "bg-emerald-50 border-emerald-200",
              color === "amber" && "bg-amber-50 border-amber-200",
            )}>
              <Icon size={18} className={cn(
                color === "blue" && "text-blue-600",
                color === "indigo" && "text-indigo-600",
                color === "emerald" && "text-emerald-600",
                color === "amber" && "text-amber-600",
              )} />
            </div>
            <p className="font-bold text-gray-900 text-sm">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        {[
          { id: "faq", label: "FAQ", icon: HelpCircle },
          { id: "tickets", label: "My Tickets", icon: MessageSquare },
          { id: "contact", label: "Contact Us", icon: Mail },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as "faq" | "tickets" | "contact")}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors",
              activeTab === id
                ? "text-blue-600 border-blue-600"
                : "text-gray-500 border-transparent hover:text-gray-700"
            )}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-2xl bg-white border-2 border-gray-200 overflow-hidden">
        {activeTab === "faq" && (
          <div className="divide-y divide-gray-100">
            {faqs.map((faq, i) => (
              <div key={i} className="p-4">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <span className="font-bold text-gray-900 text-sm">{faq.q}</span>
                  <ChevronRight size={16} className={cn("text-gray-400 transition-transform", openFaq === i && "rotate-90")} />
                </button>
                {openFaq === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-sm text-gray-600 mt-2"
                  >
                    {faq.a}
                  </motion.p>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="divide-y divide-gray-100">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center gap-4 p-4 hover:bg-blue-50/30 transition-colors">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border",
                  ticket.status === "open" ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
                )}>
                  <MessageSquare size={18} className={ticket.status === "open" ? "text-amber-600" : "text-emerald-600"} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{ticket.id}</span>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                      ticket.priority === "high" ? "bg-red-50 text-red-700 border-red-200" : "bg-gray-100 text-gray-600 border-gray-200"
                    )}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">{ticket.subject}</p>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-xs font-bold px-2 py-1 rounded-lg border",
                    ticket.status === "open" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  )}>
                    {ticket.status === "open" ? "Open" : "Resolved"}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{ticket.lastUpdate}</p>
                </div>
              </div>
            ))}
            <button className="w-full py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors">
              + Create New Ticket
            </button>
          </div>
        )}

        {activeTab === "contact" && (
          <div className="p-5 space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-800 block mb-2">Subject</label>
              <input placeholder="What is your question about?" className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-800 block mb-2">Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-sm focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Send size={16} /> Send Message
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
