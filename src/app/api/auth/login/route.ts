import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken } from "@/lib/auth";
import { verifyToken as verifyTotp } from "@/lib/backoffice/twofa-utils";
import { generateCsrfToken, setCsrfCookie } from "@/lib/security";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  otpCode: z.string().length(6).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password, otpCode } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.status === "pending_verification") {
      return NextResponse.json({ error: "Please verify your email first" }, { status: 403 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // S10: 2FA enforcement — if enabled, require valid OTP before issuing token
    const user2fa = user as unknown as Record<string, unknown>;
    if (user2fa.twoFactorEnabled && user2fa.twoFactorSecret) {
      if (!otpCode) {
        return NextResponse.json(
          { success: false, require2FA: true, error: "2FA code required" },
          { status: 403 }
        );
      }
      const otpValid = verifyTotp(otpCode, user2fa.twoFactorSecret as string);
      if (!otpValid) {
        return NextResponse.json(
          { success: false, error: "Invalid 2FA code" },
          { status: 401 }
        );
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = signToken({ userId: user.id, email: user.email });
    const csrfToken = generateCsrfToken();

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
      },
    });

    // Auth token
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    // S6: CSRF token cookie
    setCsrfCookie(res, csrfToken);

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
