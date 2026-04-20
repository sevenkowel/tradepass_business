import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getCurrentTenant(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const payload = verifyToken(token);
    const member = await prisma.tenantMember.findFirst({
      where: { userId: payload.userId },
      include: { tenant: true },
    });
    if (!member) return null;
    return member.tenant;
  } catch {
    return null;
  }
}
