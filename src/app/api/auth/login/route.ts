import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { verify2FACode } from "@/lib/otp";
import { generateCsrfToken, setCsrfCookie, setSecureCookie } from "@/lib/security";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(1),
  otpCode: z.string().length(6).optional(),
  loginStep: z.enum(["password", "2fa"]).optional().default("password"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, phone, password, otpCode, loginStep } = parsed.data;

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone is required" },
        { status: 400 }
      );
    }

    // 查找用户（优先 email，其次 phone）
    let user = null;
    if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    } else if (phone) {
      user = await prisma.user.findFirst({ where: { phone } });
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status === "pending_verification") {
      return NextResponse.json(
        { error: "Please verify your email or phone first" },
        { status: 403 }
      );
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        { error: "Account suspended. Please contact support." },
        { status: 403 }
      );
    }

    // 密码验证
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // S10: 2FA enforcement — MVP Demo 使用日期验证码
    if (user.twoFactorEnabled && loginStep === "password") {
      return NextResponse.json({
        success: false,
        require2FA: true,
        message: "2FA code required",
        hint: "请输入当天 2FA 验证码（6位：YYMMDD）",
      }, { status: 403 });
    }

    if (user.twoFactorEnabled && loginStep === "2fa") {
      if (!otpCode) {
        return NextResponse.json(
          { success: false, require2FA: true, error: "2FA code required" },
          { status: 403 }
        );
      }
      const otpValid = verify2FACode(otpCode);
      if (!otpValid) {
        return NextResponse.json(
          { success: false, error: "Invalid 2FA code" },
          { status: 401 }
        );
      }
    }

    // 更新最后登录时间
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // 检查 onboarding 状态
    const tenant = await prisma.tenant.findFirst({
      where: { ownerId: user.id },
      include: { onboarding: true },
    });

    const onboardingCompleted = tenant?.onboarding?.status === "completed";

    const token = signToken({ userId: user.id, email: user.email });
    const csrfToken = generateCsrfToken();

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        kycStatus: user.kycStatus,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      onboardingCompleted,
      redirectTo: onboardingCompleted ? "/portal" : "/console/onboarding",
    });

    setSecureCookie(res, "token", token, {
      httpOnly: true,
      domain: ".localhost",
    });

    setSecureCookie(res, "onboarding_completed", onboardingCompleted ? "true" : "false", {
      domain: ".localhost",
    });

    setCsrfCookie(res, csrfToken);

    // 设置 portal_tenant cookie，使 portal 页面可访问
    if (tenant) {
      setSecureCookie(res, "portal_tenant", tenant.id, {});
    }

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
