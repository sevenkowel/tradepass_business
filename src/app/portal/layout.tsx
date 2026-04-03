import type { Metadata } from "next";
import { PortalShell } from "@/components/portal/layout/PortalShell";

export const metadata: Metadata = {
  title: {
    template: "%s | TradePass Portal",
    default: "TradePass Portal",
  },
  description: "TradePass Client Portal - Manage your trading accounts, wallet, and more.",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalShell>{children}</PortalShell>;
}
