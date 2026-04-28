import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TradePass Broker - Global Trading Platform",
  description: "Trade 1000+ CFDs with ultra-low spreads, lightning-fast execution, and institutional-grade security.",
};

export default function BrokerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white antialiased">
      {children}
    </div>
  );
}
