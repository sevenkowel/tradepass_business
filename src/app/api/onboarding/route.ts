import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentTenant } from "@/lib/api/tenant";

export async function GET(req: NextRequest) {
  const tenant = await getCurrentTenant(req);
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const onboarding = await prisma.tenantOnboarding.findUnique({
    where: { tenantId: tenant.id },
  });

  if (!onboarding) {
    // Auto-create onboarding record
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 7);
    const created = await prisma.tenantOnboarding.create({
      data: {
        tenantId: tenant.id,
        status: "in_progress",
        step: 1,
        data: "{}",
        deadline,
      },
    });
    return NextResponse.json({ onboarding: created });
  }

  return NextResponse.json({ onboarding });
}

export async function POST(req: NextRequest) {
  const tenant = await getCurrentTenant(req);
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { step, data } = body;

  if (!step || step < 1 || step > 5) {
    return NextResponse.json({ error: "Invalid step" }, { status: 400 });
  }

  const onboarding = await prisma.tenantOnboarding.upsert({
    where: { tenantId: tenant.id },
    update: {
      step,
      data: JSON.stringify(data),
      status: "in_progress",
    },
    create: {
      tenantId: tenant.id,
      status: "in_progress",
      step,
      data: JSON.stringify(data),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({ onboarding });
}
