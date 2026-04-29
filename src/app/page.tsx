import { headers } from "next/headers";
import { Suspense } from "react";
import TradePassHome from "./(marketing)/page";
import BrokerContent from "./broker/BrokerContent";

/**
 * Phase 2: Dynamic Root Page
 * - localhost:3002/ → TradePass Marketing Website
 * - dupoin.localhost:3002/ → Tenant Website (Broker)
 */
function detectAppFromHost(host: string): { app: string; tenantSubdomain?: string } {
  const hostname = host.split(":")[0];

  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return { app: "website" };
  }

  const parts = hostname.split(".");

  // 三级子域名: portal.tenant.localhost, crm.tenant.localhost
  if (parts.length >= 3 && parts[parts.length - 1] === "localhost") {
    const [sub, tenantDomain] = parts;
    if (sub === "portal" || sub === "crm") {
      return { app: sub, tenantSubdomain: tenantDomain };
    }
  }

  // 二级子域名: tenant.localhost → Tenant Website
  if (parts.length === 2 && parts[1] === "localhost") {
    return { app: "tenant-website", tenantSubdomain: parts[0] };
  }

  return { app: "unknown" };
}

export default async function RootPage() {
  const headersList = await headers();
  const host = headersList.get("host") || "";
  const { app, tenantSubdomain } = detectAppFromHost(host);

  // Tenant Website (Broker)
  if (app === "tenant-website" && tenantSubdomain) {
    return (
      <div className="min-h-screen bg-slate-950 text-white antialiased">
        <Suspense
          fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <BrokerContent />
        </Suspense>
      </div>
    );
  }

  // TradePass Website (Marketing)
  return <TradePassHome />;
}
