import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
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

  const { name, slug, region } = parsed.data;

  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 });
  }

  const tenant = await prisma.tenant.create({
    data: {
      name,
      slug,
      region,
      ownerId: user.id,
      status: "trial",
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.tenantMember.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      role: "owner",
      joinedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: tenant.id,
      userId: user.id,
      action: "tenant_created",
      resource: "tenant",
      resourceId: tenant.id,
    },
  });

  return NextResponse.json({ tenant });
}
