import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await prisma.tenant.findFirst({
    where: { ownerId: user.id },
    include: {
      subscriptions: {
        where: { status: { in: ["active", "trialing"] } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      members: true,
    },
  });

  if (!tenant) {
    return NextResponse.json({ subscription: null });
  }

  const sub = tenant.subscriptions[0];
  const currentUsers = tenant.members.length + 1; // +1 for owner

  return NextResponse.json({
    subscription: {
      plan: tenant.plan,
      status: sub?.status || "trial",
      trialEndsAt: sub?.trialEndsAt?.toISOString() || tenant.trialEndsAt?.toISOString() || null,
      maxUsers: tenant.maxUsers,
      maxAccounts: tenant.maxAccounts,
      currentUsers,
    },
  });
}
