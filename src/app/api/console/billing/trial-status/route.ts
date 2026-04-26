import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getTenantLifecycleState } from "@/lib/tenant/lifecycle";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await prisma.tenant.findFirst({
    where: { ownerId: user.id },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const state = await getTenantLifecycleState(tenant.id);

  // Fetch unread notifications
  const unreadNotifications = await prisma.tenantNotification.findMany({
    where: {
      tenantId: tenant.id,
      readAt: null,
    },
    orderBy: { sentAt: "desc" },
    take: 5,
  });

  return NextResponse.json({
    state: {
      ...state,
      trialEndsAt: state.trialEndsAt?.toISOString() || null,
      gracePeriodEndsAt: state.gracePeriodEndsAt?.toISOString() || null,
      retentionExpiresAt: state.retentionExpiresAt?.toISOString() || null,
    },
    notifications: unreadNotifications.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      content: n.content,
      sentAt: n.sentAt.toISOString(),
      metadata: n.metadata ? JSON.parse(n.metadata) : null,
    })),
  });
}
