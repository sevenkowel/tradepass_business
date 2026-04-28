import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { checkBlacklist } from "@/lib/risk/engine";
import { verifyOTPCode } from "@/lib/otp";
import { parseAuthConfig } from "@/lib/auth-config";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(1),
  name: z.string().min(1),
  // 动态字段会作为额外字段传入
  otpCode: z.string().optional(),
  skipVerification: z.boolean().optional(),
  tenantId: z.string().nullish(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { email, phone, password, name, otpCode, skipVerification, tenantId } = parsed.data;

    // 必须提供 email 或 phone
    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone is required" },
        { status: 400 }
      );
    }

    // 读取租户认证配置（如果有 tenantId）
    let authConfig = parseAuthConfig(null);
    if (tenantId) {
      const tenantCfg = await prisma.tenantConfig.findUnique({
        where: { tenantId },
        select: { auth: true },
      });
      authConfig = parseAuthConfig(tenantCfg?.auth);
    }

    // 检查注册方式是否被允许
    const registerMethod = email ? "email" : "phone";
    if (!authConfig.registerMethods.includes(registerMethod as "email" | "phone")) {
      return NextResponse.json(
        { error: `Registration via ${registerMethod} is not allowed` },
        { status: 403 }
      );
    }

    // 黑名单检查
    const blacklist = await checkBlacklist({ email: email || undefined, phone: phone || undefined });
    if (blacklist.blocked) {
      return NextResponse.json({ error: "Registration not allowed" }, { status: 403 });
    }

    // 检查邮箱/手机是否已注册
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "Email already registered" }, { status: 409 });
      }
    }

    // Demo 模式：跳过验证标记
    const isDevSkip = skipVerification === true && authConfig.allowSkipVerification;

    // 如果要求邮箱验证且未跳过，验证 OTP
    if (authConfig.emailVerificationRequired && email && !isDevSkip) {
      if (!otpCode) {
        return NextResponse.json(
          { error: "Email verification required", requireOtp: true, otpType: "email" },
          { status: 400 }
        );
      }
      if (!verifyOTPCode(otpCode)) {
        return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
      }
    }

    // 如果要求手机验证且未跳过，验证 OTP
    if (authConfig.phoneVerificationRequired && phone && !isDevSkip) {
      if (!otpCode) {
        return NextResponse.json(
          { error: "Phone verification required", requireOtp: true, otpType: "phone" },
          { status: 400 }
        );
      }
      if (!verifyOTPCode(otpCode)) {
        return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
      }
    }

    const passwordHash = await hashPassword(password);

    // === 原子事务：创建用户 + Tenant + 订阅 ===
    const { user, tenant } = await prisma.$transaction(async (tx) => {
      // 创建用户
      const user = await tx.user.create({
        data: {
          email: email || `phone_${Date.now()}@placeholder.local`,
          phone: phone || null,
          passwordHash,
          name,
          status: isDevSkip ? "active" : "pending_verification",
          emailVerifiedAt: isDevSkip || (authConfig.emailVerificationRequired && email) ? new Date() : null,
          phoneVerified: isDevSkip || (authConfig.phoneVerificationRequired && phone) ? true : false,
        },
      });

      // 生成 Tenant 标识
      const tenantSlug = `tenant-${user.id.slice(0, 8)}`;
      const subdomainPrefix = name.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
      const subdomain = `${subdomainPrefix}-${user.id.slice(0, 6)}`;

      const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
      const gracePeriodEndsAt = new Date(trialEndsAt.getTime() + 7 * 24 * 60 * 60 * 1000);

      const tenant = await tx.tenant.create({
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
          trialEndsAt,
          gracePeriodEndsAt,
          onboardingLocked: true,
        },
      });

      await tx.tenantOnboarding.create({
        data: {
          tenantId: tenant.id,
          status: "in_progress",
          step: 1,
          data: JSON.stringify({}),
          isLocked: false,
        },
      });

      await tx.tenantConfig.create({
        data: {
          tenantId: tenant.id,
          brand: JSON.stringify({ name, primaryColor: "#1a73e8" }),
          auth: JSON.stringify({
            ...authConfig,
            registerMethods: ["email", "phone"],
            loginMethods: ["email", "phone"],
          }),
          kyc: JSON.stringify({ regions: ["VN"], level: "basic", amlEnabled: false }),
          trading: JSON.stringify({ groups: ["forex"], leverage: "1:100", spreadMode: "floating" }),
          payment: JSON.stringify({ currencies: ["USD"], depositChannels: ["usdt"], withdrawalChannels: ["usdt"] }),
          channels: JSON.stringify({ emailProvider: "tradepass_default", smsProvider: "tradepass_default", ekycProvider: "tradepass_default" }),
          mvpMode: true,
        },
      });

      // Ensure TradePass Business product exists
      const businessProduct = await tx.product.upsert({
        where: { code: "trade_pass_business" },
        update: {},
        create: {
          code: "trade_pass_business",
          name: "TradePass Business",
          description: "外汇经纪商业务系统基础层，包含 Portal、Backoffice 和核心运营功能",
          basePrice: 7000,
          seatPrice: 29,
          currency: "USD",
          isActive: true,
          features: JSON.stringify({
            modules: ["portal", "backoffice", "kyc", "funds", "trading_accounts"],
            plans: {
              free: { maxUsers: 10, maxAccounts: 5, maxDeposits: 100 },
              starter: { maxUsers: 50, maxAccounts: 100 },
              professional: { maxUsers: 200, maxAccounts: 500 },
              enterprise: { maxUsers: 1000, maxAccounts: 2000 },
              ultimate: { maxUsers: -1, maxAccounts: -1 },
            },
          }),
        },
      });

      if (businessProduct) {
        const subscription = await tx.subscription.create({
          data: {
            tenantId: tenant.id,
            productId: businessProduct.id,
            status: "trialing",
            planName: "mvp",
            seatLimit: 10,
            currentSeats: 1,
            trialEndsAt,
            gracePeriodEndsAt,
            features: JSON.stringify({ plan: "mvp", modules: ["portal", "kyc_basic", "funds_usdt"] }),
          },
        });

        await tx.license.create({
          data: {
            key: `tp-business-${tenant.id}-${Date.now()}`,
            tenantId: tenant.id,
            subscriptionId: subscription.id,
            productCode: "trade_pass_business",
            status: "active",
            features: JSON.stringify({ plan: "mvp" }),
          },
        });
      }

      return { user, tenant };
    });

    // Dev skip: auto-login
    if (isDevSkip) {
      const token = signToken({ userId: user.id, email: user.email });
      const res = NextResponse.json({
        success: true,
        autoLogin: true,
        token,
        tenantId: tenant.id,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          status: user.status,
        },
        message: "Registration successful. Redirecting to portal...",
      });
      res.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      res.cookies.set("onboarding_completed", "false", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      // 设置 portal_tenant cookie，使 portal 页面可访问
      res.cookies.set("portal_tenant", tenant.id, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return res;
    }

    // Normal flow: return success, user needs to verify
    return NextResponse.json({
      success: true,
      message: "Registration successful. Please verify your contact information.",
      requireVerification: true,
      tenantId: tenant.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    // 打印详细错误堆栈
    if (err instanceof Error) {
      console.error("Error stack:", err.stack);
    }
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: "Internal server error", detail: message }, { status: 500 });
  }
}
