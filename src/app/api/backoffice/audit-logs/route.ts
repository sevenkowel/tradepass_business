import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
      }),
      prisma.auditLog.count(),
    ]);

    return NextResponse.json({ logs, total });
  } catch (err) {
    console.error("Audit logs API error:", err);
    return NextResponse.json(
      { error: "Failed to load audit logs" },
      { status: 500 }
    );
  }
}
