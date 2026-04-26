import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "operator", "viewer"]).default("viewer"),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: tenantId } = await params;

  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) return NextResponse.json({ error: "Tenant not found" }, { status: 404 });

  // Only owner or admin can invite
  const membership = await prisma.tenantMember.findFirst({
    where: { tenantId, userId: user.id },
  });
  const canInvite =
    tenant.ownerId === user.id || membership?.role === "admin" || membership?.role === "owner";
  if (!canInvite) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, role } = parsed.data;

  // Check if user already a member
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMember = await prisma.tenantMember.findUnique({
      where: { tenantId_userId: { tenantId, userId: existingUser.id } },
    });
    if (existingMember) {
      return NextResponse.json({ error: "User already a member" }, { status: 409 });
    }
  }

  // Create or update invite record (simplified - in production send email)
  const inviteToken = crypto.randomUUID();

  // Store invite in a simple way using audit log for now, or create a dedicated invite model
  // For MVP, we'll just create the tenant member with a pending state
  const inviteeUser =
    existingUser ||
    (await prisma.user.create({
      data: {
        email,
        passwordHash: "",
        status: "pending_invite",
      },
    }));

  await prisma.tenantMember.create({
    data: {
      tenantId,
      userId: inviteeUser.id,
      role,
      invitedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: user.id,
      action: "member_invited",
      resource: "tenant_member",
      resourceId: inviteeUser.id,
      metadata: JSON.stringify({ email, role, token: inviteToken }),
    },
  });

  // In production: send email with invite link /auth/invite/accept?token=xxx
  // TODO: integrate with email service
  // console.log(`[INVITE] Send invite email to ${email} with token ${inviteToken}`);

  return NextResponse.json({ success: true, inviteToken, message: "Invitation sent" });
}
