import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentTenant } from "@/lib/api/tenant";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ appId: string }> }
) {
  const tenant = await getCurrentTenant(req);
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { appId } = await params;

  await prisma.tenantApp.updateMany({
    where: { tenantId: tenant.id, appId },
    data: {
      status: "uninstalled",
      uninstalledAt: new Date(),
    },
  });

  // Deactivate license
  await prisma.license.updateMany({
    where: { tenantId: tenant.id, productCode: appId },
    data: { status: "revoked", revokedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
