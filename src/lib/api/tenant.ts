import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentUserFromToken(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function getCurrentTenant(req: NextRequest) {
  const payload = await getCurrentUserFromToken(req);
  if (!payload) return null;

  try {
    // 1. Try tenantMember first
    const member = await prisma.tenantMember.findFirst({
      where: { userId: payload.userId },
      include: { tenant: true },
    });
    if (member) return member.tenant;

    // 2. Fallback: user is owner of a tenant but no member record
    const owned = await prisma.tenant.findFirst({
      where: { ownerId: payload.userId },
    });
    if (owned) return owned;

    return null;
  } catch {
    return null;
  }
}
