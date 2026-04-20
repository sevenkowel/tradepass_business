import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentTenant } from "@/lib/api/tenant";

export async function GET(req: NextRequest) {
  const tenant = await getCurrentTenant(req);
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apps = await prisma.tenantApp.findMany({
    where: { tenantId: tenant.id, status: "installed" },
    include: { tenant: false },
  });

  const appIds = apps.map((a) => a.appId);

  return NextResponse.json({ installedApps: appIds });
}
