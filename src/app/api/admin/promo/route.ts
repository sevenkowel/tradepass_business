import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/promo
 * List all promo codes (admin only).
 */
export async function GET(_req: NextRequest) {
  const promos = await prisma.promoCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    promos: promos.map((p) => ({
      ...p,
      applicablePlans: p.applicablePlans ? JSON.parse(p.applicablePlans) : [],
      applicableModules: p.applicableModules ? JSON.parse(p.applicableModules) : [],
    })),
  });
}

/**
 * POST /api/admin/promo
 * Create a new promo code (admin only).
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    code,
    description,
    discountType,
    discountValue,
    maxUses,
    validFrom,
    validUntil,
    applicablePlans,
    applicableModules,
    minAmount,
    currency,
  } = body;

  if (!code || !discountType || discountValue === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const promo = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue,
        maxUses: maxUses || 0,
        validFrom: validFrom ? new Date(validFrom) : new Date(),
        validUntil: validUntil ? new Date(validUntil) : null,
        applicablePlans: applicablePlans ? JSON.stringify(applicablePlans) : "[]",
        applicableModules: applicableModules ? JSON.stringify(applicableModules) : "[]",
        minAmount: minAmount || null,
        currency: currency || "USD",
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, promo });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "优惠码已存在" }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
