import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDiscount, type DiscountType } from "@/lib/promo/types";

/**
 * POST /api/console/promo/validate
 * Validate a promo code and calculate discount.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, amount, currency = "USD", plan, moduleCode } = body;

  if (!code || !amount) {
    return NextResponse.json({ error: "code and amount required" }, { status: 400 });
  }

  const promo = await prisma.promoCode.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!promo) {
    return NextResponse.json({ valid: false, message: "优惠码不存在" });
  }

  if (!promo.isActive) {
    return NextResponse.json({ valid: false, message: "优惠码已停用" });
  }

  const now = new Date();
  if (promo.validFrom && now < promo.validFrom) {
    return NextResponse.json({ valid: false, message: "优惠码尚未生效" });
  }
  if (promo.validUntil && now > promo.validUntil) {
    return NextResponse.json({ valid: false, message: "优惠码已过期" });
  }

  if (promo.maxUses > 0 && promo.usedCount >= promo.maxUses) {
    return NextResponse.json({ valid: false, message: "优惠码使用次数已达上限" });
  }

  if (promo.minAmount && amount < promo.minAmount) {
    return NextResponse.json({
      valid: false,
      message: `订单金额需满 ${promo.minAmount} ${promo.currency} 才能使用此优惠码`,
    });
  }

  const applicablePlans = promo.applicablePlans ? JSON.parse(promo.applicablePlans) : [];
  if (applicablePlans.length > 0 && plan && !applicablePlans.includes(plan)) {
    return NextResponse.json({ valid: false, message: "此优惠码不适用于当前套餐" });
  }

  const applicableModules = promo.applicableModules ? JSON.parse(promo.applicableModules) : [];
  if (applicableModules.length > 0 && moduleCode && !applicableModules.includes(moduleCode)) {
    return NextResponse.json({ valid: false, message: "此优惠码不适用于当前模块" });
  }

  const discountAmount = calculateDiscount(amount, promo.discountType as DiscountType, promo.discountValue);
  const finalAmount = Math.max(0, amount - discountAmount);

  return NextResponse.json({
    valid: true,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    appliedAmount: discountAmount,
    finalAmount,
    message: `优惠已应用：${promo.description || promo.code}`,
  });
}
