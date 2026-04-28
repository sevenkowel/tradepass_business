import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import {
  PRODUCT_CODES,
  type ProductCode,
  PRODUCT_CONFIG,
  BASE_LAYER_CODE,
  getAddOnModules,
} from "@/lib/products";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch only whitelisted products (filter out stale data like Broker OS)
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        code: { in: [...PRODUCT_CODES] as string[] },
      },
      orderBy: [
        { code: "asc" }, // business first, then alphabetically
      ],
    });

    // 2. Get user's subscriptions via tenant ownership or membership
    const ownedTenants = await prisma.tenant.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    });
    const memberTenants = await prisma.tenantMember.findMany({
      where: { userId: user.id },
      select: { tenantId: true },
    });
    const tenantIds = Array.from(
      new Set([
        ...ownedTenants.map((t) => t.id),
        ...memberTenants.map((t) => t.tenantId),
      ])
    );

    const subscriptions =
      tenantIds.length > 0
        ? await prisma.subscription.findMany({
            where: { tenantId: { in: tenantIds } },
            select: { productId: true, status: true },
          })
        : [];
    const subscribedProductIds = new Set(
      subscriptions.map((s) => s.productId)
    );

    // 3. Build product list with config metadata
    const productList = products.map((p) => {
      const config = PRODUCT_CONFIG[p.code as ProductCode];
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        shortName: config?.shortName || p.name,
        description: p.description,
        basePrice: p.basePrice,
        seatPrice: p.seatPrice,
        currency: p.currency,
        isBaseLayer: config?.isBaseLayer ?? false,
        isSubscribed: subscribedProductIds.has(p.id),
        moduleCount: config?.modules.length ?? 0,
        modules:
          config?.modules.map((m) => ({
            id: m.id,
            name: m.name,
            description: m.description,
            isAddOn: m.isAddOn ?? false,
            addOnPrice: m.addOnPrice,
          })) ?? [],
      };
    });

    // 4. Separate base layer and extensions
    const baseLayer = productList.find((p) => p.code === BASE_LAYER_CODE);
    const extensions = productList.filter((p) => p.code !== BASE_LAYER_CODE);

    // 5. Add-on modules that can be purchased standalone
    const addOns = getAddOnModules().map(({ product, module }) => ({
      moduleId: module.id,
      name: module.name,
      description: module.description,
      icon: module.icon,
      parentProductCode: product.code,
      parentProductName: product.shortName,
      addOnPrice: module.addOnPrice ?? 0,
      currency: product.currency,
    }));

    return NextResponse.json({
      baseLayer,
      extensions,
      addOns,
    });
  } catch (err) {
    console.error("List products error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
