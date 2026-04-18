import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });

    // Get user's subscriptions to mark subscribed products
    const userTenants = await prisma.tenantMember.findMany({
      where: { userId: user.id },
      select: { tenantId: true },
    });
    const tenantIds = userTenants.map((t) => t.tenantId);

    const subscriptions = tenantIds.length > 0
      ? await prisma.subscription.findMany({
          where: { tenantId: { in: tenantIds } },
          select: { productId: true, status: true },
        })
      : [];
    const subscribedProductIds = new Set(subscriptions.map((s) => s.productId));

    return NextResponse.json({
      products: products.map((p) => ({
        ...p,
        isSubscribed: subscribedProductIds.has(p.id),
      })),
    });
  } catch (err) {
    console.error("List products error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
