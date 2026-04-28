import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentTenant } from "@/lib/api/tenant";

export async function POST(req: NextRequest) {
  try {
    const tenant = await getCurrentTenant(req);
    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Upsert onboarding record — it may not exist if schema changed
    const onboarding = await prisma.tenantOnboarding.upsert({
      where: { tenantId: tenant.id },
      update: {
        status: "completed",
        step: 6,
        completedSteps: JSON.stringify([1, 2, 3, 4, 5, 6]),
        isLocked: false,
      },
      create: {
        tenantId: tenant.id,
        status: "completed",
        step: 6,
        completedSteps: JSON.stringify([1, 2, 3, 4, 5, 6]),
        isLocked: false,
        data: "{}",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Sync brand data from onboarding to Tenant + TenantConfig
    const onboardingData = onboarding.data ? JSON.parse(onboarding.data) : {};
    const brandData = {
      brandName: onboardingData.brandName || tenant.brandName || tenant.name,
      slogan: onboardingData.slogan || tenant.slogan || "",
      logoUrl: onboardingData.logoUrl || tenant.logoUrl || "",
      faviconUrl: onboardingData.faviconUrl || tenant.faviconUrl || "",
      primaryColor: onboardingData.primaryColor || tenant.primaryColor || "#1a73e8",
      subdomain: onboardingData.subdomain || tenant.subdomain || "",
    };

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        brandName: brandData.brandName,
        slogan: brandData.slogan,
        logoUrl: brandData.logoUrl,
        faviconUrl: brandData.faviconUrl,
        primaryColor: brandData.primaryColor,
        subdomain: brandData.subdomain,
        onboardingCompletedAt: new Date(),
        onboardingLocked: false,
      },
    });

    // Also sync to TenantConfig.brand for unified access
    await prisma.tenantConfig.upsert({
      where: { tenantId: tenant.id },
      update: {
        brand: JSON.stringify(brandData),
      },
      create: {
        tenantId: tenant.id,
        brand: JSON.stringify(brandData),
        auth: "{}",
        kyc: "{}",
        trading: "{}",
        payment: "{}",
        channels: "{}",
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
  } catch (err: any) {
    console.error("[onboarding/complete] error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to complete onboarding" },
      { status: 500 }
    );
  }
}
