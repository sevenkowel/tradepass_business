import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentTenant } from "@/lib/api/tenant";

export async function POST(req: NextRequest) {
  const tenant = await getCurrentTenant(req);
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const onboarding = await prisma.tenantOnboarding.update({
    where: { tenantId: tenant.id },
    data: {
      status: "completed",
      step: 5,
    },
  });

  return NextResponse.json({ onboarding });
}
