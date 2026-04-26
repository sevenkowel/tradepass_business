import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentTenant } from "@/lib/api/tenant";

export async function POST(req: NextRequest) {
  const tenant = await getCurrentTenant(req);
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Update onboarding status
  const onboarding = await prisma.tenantOnboarding.update({
    where: { tenantId: tenant.id },
    data: {
      status: "completed",
      step: 6,
      completedSteps: JSON.stringify([1, 2, 3, 4, 5, 6]),
      isLocked: false,
    },
  });

  // Update tenant onboarding status
  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      onboardingCompletedAt: new Date(),
      onboardingLocked: false,
    },
  });

  // Set onboarding completed cookie
  const res = NextResponse.json({ onboarding, redirectTo: "/console" });
  res.cookies.set("onboarding_completed", "true", {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return res;
}
