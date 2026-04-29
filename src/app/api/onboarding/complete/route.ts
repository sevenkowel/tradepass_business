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

    // Update tenant brand data (subdomain may conflict, handle gracefully)
    try {
      await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          brandName: brandData.brandName,
          slogan: brandData.slogan,
          logoUrl: brandData.logoUrl,
          faviconUrl: brandData.faviconUrl,
          primaryColor: brandData.primaryColor,
          subdomain: brandData.subdomain || tenant.subdomain || `tenant-${tenant.id.slice(0, 8)}`,
          onboardingCompletedAt: new Date(),
          onboardingLocked: false,
        },
      });
    } catch (subdomainError: any) {
      // If subdomain conflict, update without subdomain
      if (subdomainError.message?.includes("subdomain")) {
        await prisma.tenant.update({
          where: { id: tenant.id },
          data: {
            brandName: brandData.brandName,
            slogan: brandData.slogan,
            logoUrl: brandData.logoUrl,
            faviconUrl: brandData.faviconUrl,
            primaryColor: brandData.primaryColor,
            onboardingCompletedAt: new Date(),
            onboardingLocked: false,
          },
        });
      } else {
        throw subdomainError;
      }
    }

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

    // Sync auth config from onboarding to TenantConfig
    const authConfig = onboardingData.auth || {};
    const kycConfig = onboardingData.kyc || {};
    const tradingConfig = onboardingData.trading || {};
    const paymentConfig = onboardingData.payment || {};

    await prisma.tenantConfig.update({
      where: { tenantId: tenant.id },
      data: {
        auth: JSON.stringify({
          registerMethods: authConfig.registerMethods || ["email", "phone"],
          loginMethods: authConfig.loginMethods || ["email", "phone"],
          emailVerificationRequired: authConfig.emailVerificationRequired ?? true,
          phoneVerificationRequired: authConfig.phoneVerificationRequired ?? true,
          passwordPolicy: authConfig.passwordPolicy || { minLength: 8, requireUppercase: true, requireNumber: true },
        }),
        kyc: JSON.stringify({
          regions: kycConfig.regions || ["VN"],
          level: kycConfig.level || "basic",
          amlEnabled: kycConfig.amlEnabled ?? false,
        }),
        trading: JSON.stringify({
          groups: tradingConfig.groups || ["forex"],
          leverage: tradingConfig.leverage || "1:100",
          spreadMode: tradingConfig.spreadMode || "floating",
        }),
        payment: JSON.stringify({
          currencies: paymentConfig.currencies || ["USD"],
          depositChannels: paymentConfig.depositChannels || ["usdt"],
          withdrawalChannels: paymentConfig.withdrawalChannels || ["usdt"],
        }),
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
