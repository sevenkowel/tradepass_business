import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { MODULE_CODES } from "@/lib/modules/constants";

/**
 * PATCH /api/console/modules/config
 * Update module-specific configuration.
 */
export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { tenantId, moduleCode, config } = body;

  if (!tenantId || !moduleCode || !MODULE_CODES.includes(moduleCode)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const member = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId, userId: user.id } },
  });

  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const existing = await prisma.productModule.findUnique({
    where: { tenantId_moduleCode: { tenantId, moduleCode } },
  });

  if (!existing) {
    return NextResponse.json({ error: "Module not subscribed" }, { status: 404 });
  }

  const mergedConfig = existing.config
    ? { ...JSON.parse(existing.config), ...config }
    : config;

  await prisma.productModule.update({
    where: { tenantId_moduleCode: { tenantId, moduleCode } },
    data: {
      config: JSON.stringify(mergedConfig),
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: user.id,
      action: "module_config_updated",
      resource: "product_module",
      resourceId: moduleCode,
      metadata: JSON.stringify({ config }),
    },
  });

  return NextResponse.json({ success: true, config: mergedConfig });
}
