import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateVerificationToken } from "@/lib/auth";
import { checkBlacklist } from "@/lib/risk/engine";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  company: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    // Check blacklist
    const blacklist = await checkBlacklist({ email });
    if (blacklist.blocked) {
      return NextResponse.json({ error: "Registration not allowed" }, { status: 403 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        status: "pending_verification",
      },
    });

    // === Auto-create MVP Tenant ===
    const tenantSlug = `tenant-${user.id.slice(0, 8)}`;
    const subdomain = `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}-${user.id.slice(0, 6)}`;

    const tenant = await prisma.tenant.create({
      data: {
        name: name,
        slug: tenantSlug,
        ownerId: user.id,
        status: "trial",
        plan: "mvp",
        maxUsers: 10,
        maxAccounts: 5,
        brandName: name,
        subdomain: subdomain,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        onboardingLocked: true,
      },
    });

    // Create TenantOnboarding
    await prisma.tenantOnboarding.create({
      data: {
        tenantId: tenant.id,
        status: "in_progress",
        step: 1,
        data: JSON.stringify({}),
        isLocked: false,
      },
    });

    // Create TenantConfig (default MVP config)
    await prisma.tenantConfig.create({
      data: {
        tenantId: tenant.id,
        brand: JSON.stringify({ name, primaryColor: "#1a73e8" }),
        auth: JSON.stringify({ methods: ["email"], loginFlow: "password" }),
        kyc: JSON.stringify({ regions: ["VN"], level: "basic", amlEnabled: false }),
        trading: JSON.stringify({ groups: ["forex"], leverage: "1:100", spreadMode: "floating" }),
        payment: JSON.stringify({ currencies: ["USD"], depositChannels: ["usdt"], withdrawalChannels: ["usdt"] }),
        channels: JSON.stringify({ emailProvider: "tradepass_default", smsProvider: "tradepass_default", ekycProvider: "tradepass_default" }),
        mvpMode: true,
      },
    });

    // Create Subscription for TradePass Business (MVP trial)
    const businessProduct = await prisma.product.findUnique({
      where: { code: "trade_pass_business" },
    });

    if (businessProduct) {
      await prisma.subscription.create({
        data: {
          tenantId: tenant.id,
          productId: businessProduct.id,
          status: "trialing",
          planName: "mvp",
          seatLimit: 10,
          currentSeats: 1,
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          features: JSON.stringify({ plan: "mvp", modules: ["portal", "kyc_basic", "funds_usdt"] }),
        },
      });

      // Create License
      await prisma.license.create({
        data: {
          key: `tp-business-${tenant.id}-${Date.now()}`,
          tenantId: tenant.id,
          subscriptionId: (await prisma.subscription.findFirst({ where: { tenantId: tenant.id } }))!.id,
          productCode: "trade_pass_business",
          status: "active",
          features: JSON.stringify({ plan: "mvp" }),
        },
      });
    }

    const verifyToken = generateVerificationToken();
    await prisma.emailVerification.create({
      data: {
        email,
        token: verifyToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please verify your email and complete onboarding.",
      verifyUrl: `/auth/verify-email?token=${verifyToken}`,
      tenantId: tenant.id,
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
