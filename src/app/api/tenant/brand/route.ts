import { NextRequest, NextResponse } from "next/server";
import { resolveTenantFromRequest } from "@/lib/tenant/resolver";

export async function GET(req: NextRequest) {
  const subdomain = req.cookies.get("tenant_subdomain")?.value;
  const hostname = req.headers.get("host");

  // Also check x-tenant-subdomain header (set by middleware)
  const headerSubdomain = req.headers.get("x-tenant-subdomain");

  const tenant = await resolveTenantFromRequest(
    headerSubdomain || subdomain,
    hostname
  );

  if (!tenant) {
    return NextResponse.json({ brand: null });
  }

  return NextResponse.json({
    brand: {
      id: tenant.id,
      name: tenant.name,
      brandName: tenant.brandName,
      slogan: tenant.slogan,
      logoUrl: tenant.logoUrl,
      faviconUrl: tenant.faviconUrl,
      primaryColor: tenant.primaryColor,
      subdomain: tenant.subdomain,
      customDomain: tenant.customDomain,
    },
  });
}
