import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional(),
  region: z.string().default("ap-southeast-1"),
});

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.tenantMember.findMany({
    where: { userId: user.id },
    include: { tenant: true },
    orderBy: { invitedAt: "desc" },
  });

  const owned = await prisma.tenant.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const all = [
    ...owned,
    ...memberships.map((m) => m.tenant).filter((t) => !owned.some((o) => o.id === t.id)),
  ];

  return NextResponse.json({ tenants: all });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, slug: providedSlug, region } = parsed.data;

  // 生成 Tenant 标识
  const slug = providedSlug || `tenant-${user.id.slice(0, 8)}-${Date.now().toString(36)}`;
  const subdomainPrefix = name.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
  const subdomain = `${subdomainPrefix}-${user.id.slice(0, 6)}`;

  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const gracePeriodEndsAt = new Date(trialEndsAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  // 使用事务确保所有初始化操作原子性
  const { tenant } = await prisma.$transaction(async (tx) => {
    // 1. 创建租户
    const tenant = await tx.tenant.create({
      data: {
        name,
        slug,
        region,
        ownerId: user.id,
        status: "trial",
        plan: "mvp",
        maxUsers: 10,
        maxAccounts: 5,
        brandName: name,
        subdomain,
        trialEndsAt,
        gracePeriodEndsAt,
        onboardingLocked: true,
      },
    });

    // 2. 创建所有者成员关系
    await tx.tenantMember.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        role: "owner",
        joinedAt: new Date(),
      },
    });

    // 3. 创建 onboarding 记录
    await tx.tenantOnboarding.create({
      data: {
        tenantId: tenant.id,
        status: "in_progress",
        step: 1,
        data: JSON.stringify({}),
        isLocked: false,
      },
    });

    // 4. 创建租户配置
    await tx.tenantConfig.create({
      data: {
        tenantId: tenant.id,
        brand: JSON.stringify({ name, primaryColor: "#1a73e8" }),
        auth: JSON.stringify({
          registerMethods: ["email", "phone"],
          loginMethods: ["email", "phone"],
          emailVerificationRequired: true,
          phoneVerificationRequired: true,
        }),
        kyc: JSON.stringify({ regions: ["VN"], level: "basic", amlEnabled: false }),
        trading: JSON.stringify({ groups: ["forex"], leverage: "1:100", spreadMode: "floating" }),
        payment: JSON.stringify({ currencies: ["USD"], depositChannels: ["usdt"], withdrawalChannels: ["usdt"] }),
        channels: JSON.stringify({ emailProvider: "tradepass_default", smsProvider: "tradepass_default", ekycProvider: "tradepass_default" }),
        mvpMode: true,
      },
    });

    // 5. 确保 TradePass Business 产品存在并创建订阅
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

      // 6. 创建 license
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

    // 7. 记录审计日志
    await tx.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        action: "tenant_created",
        resource: "tenant",
        resourceId: tenant.id,
      },
    });

    return { tenant };
  });

  // 设置 onboarding cookie，确保用户完成 onboarding 流程
  const res = NextResponse.json({ tenant });
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
