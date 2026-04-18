import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { tenantId } = body;
  if (!tenantId) {
    return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
  }

  const member = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId, userId: user.id } },
  });
  if (!member) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (member.joinedAt) {
    return NextResponse.json({ error: "Already joined" }, { status: 409 });
  }

  const updated = await prisma.tenantMember.update({
    where: { id: member.id },
    data: { joinedAt: new Date() },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { status: "active" },
  });

  return NextResponse.json({ success: true, member: updated });
}
