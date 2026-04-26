import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/promo/:id
 * Update promo code status.
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const promo = await prisma.promoCode.update({
    where: { id },
    data: {
      isActive: body.isActive,
      maxUses: body.maxUses,
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
    },
  });

  return NextResponse.json({ success: true, promo });
}

/**
 * DELETE /api/admin/promo/:id
 * Delete a promo code.
 */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;

  await prisma.promoCode.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
