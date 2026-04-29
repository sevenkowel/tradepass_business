import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

/**
 * PATCH /api/console/tenants/:id/members/:memberId
 * 更新成员角色
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id: tenantId, memberId } = await params;
    const body = await req.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
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

    // 验证权限
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

    // 更新成员角色
    const updatedMember = await prisma.tenantMember.update({
      where: { id: memberId },
      data: { role },
    });

    return NextResponse.json({
      success: true,
      member: updatedMember,
    });
  } catch (error: any) {
    console.error("[update member] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update member" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/console/tenants/:id/members/:memberId
 * 移除成员
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id: tenantId, memberId } = await params;

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

    // 验证权限
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

    // 删除成员
    await prisma.tenantMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("[delete member] error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to remove member" },
      { status: 500 }
    );
  }
}
