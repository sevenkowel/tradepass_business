import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateVerificationToken, signToken } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  company: z.string().optional(),
  skipVerification: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, password, name, skipVerification } = parsed.data;

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
        status: skipVerification ? "active" : "pending_verification",
      },
    });

    if (skipVerification) {
      const token = signToken({ userId: user.id, email: user.email });
      return NextResponse.json({
        success: true,
        message: "Registration successful.",
        token,
        autoLogin: true,
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

    // TODO: send real email
    console.log(`[EMAIL] Verification link: http://localhost:3001/auth/verify-email?token=${verifyToken}`);

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please verify your email.",
      verifyUrl: `/auth/verify-email?token=${verifyToken}`,
    });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
