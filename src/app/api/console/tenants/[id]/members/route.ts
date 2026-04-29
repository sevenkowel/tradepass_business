import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

/**
 * GET /api/console/tenants/:id/members
 * 获取租户成员列表
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;

    // 验证用户身份
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.status !== "active") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证用户是否有权访问该租户
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const membership = await prisma.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: user.id,
        },
      },
    });

    if (!membership && tenant.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 获取成员列表
    const members = await prisma.tenantMember.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { invitedAt: "desc" },
    });

    // 添加所有者到列表
    const owner = await prisma.user.findUnique({
      where: { id: tenant.ownerId },
      select: { id: true, email: true, name: true },
    });

    const result = [
      ...(owner
        ? [
            {
              id: "owner",
              userId: owner.id,
              email: owner.email,
              name: owner.name,
              role: "owner" as const,
              joinedAt: tenant.createdAt.toISOString(),
            },
          ]
        : []),
      ...members.map((m) => ({
        id: m.id,
        userId: m.user.id,
        email: m.user.email,
        name: m.user.name,
        role: m.role as "admin" | "operator",
        joinedAt: m.joinedAt?.toISOString() || m.invitedAt.toISOString(),
      })),
    ];

    return NextResponse.json({
      success: true,
      members: result,
    });
  } catch (error: any) {
    console.error("[tenant members] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch members" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/console/tenants/:id/members
 * 邀请成员加入租户
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tenantId } = await params;
    const body = await req.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
        { status: 400 }
      );
    }

    // 验证用户身份
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!currentUser || currentUser.status !== "active") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 验证权限（只有 owner 和 admin 可以邀请成员）
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const isOwner = tenant.ownerId === currentUser.id;
    const membership = await prisma.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: currentUser.id,
        },
      },
    });

    if (!isOwner && (!membership || membership.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 查找被邀请用户
    const invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      return NextResponse.json(
        { error: "User not found with this email" },
        { status: 404 }
      );
    }

    // 检查是否已经是成员
    const existingMember = await prisma.tenantMember.findUnique({
      where: {
        tenantId_userId: {
          tenantId,
          userId: invitedUser.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this tenant" },
        { status: 400 }
      );
    }

    // 创建成员记录
    const newMember = await prisma.tenantMember.create({
      data: {
        tenantId,
        userId: invitedUser.id,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      member: {
        id: newMember.id,
        userId: newMember.user.id,
        email: newMember.user.email,
        name: newMember.user.name,
        role: newMember.role,
        joinedAt: newMember.joinedAt?.toISOString() || newMember.invitedAt.toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[invite member] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to invite member" },
      { status: 500 }
    );
  }
}
