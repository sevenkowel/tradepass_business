import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/console/oauth-apps/:id
 * Update OAuth2 app (name, description, redirect URIs, scopes, status).
 */
export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const app = await prisma.oAuth2App.findUnique({ where: { id } });
  if (!app) {
    return NextResponse.json({ error: "App not found" }, { status: 404 });
  }

  const member = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId: app.tenantId, userId: user.id } },
  });

  if (!member || member.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.redirectUris !== undefined) updateData.redirectUris = JSON.stringify(body.redirectUris);
  if (body.scopes !== undefined) updateData.scopes = JSON.stringify(body.scopes);
  if (body.status !== undefined) updateData.status = body.status;
  if (body.rateLimit !== undefined) updateData.rateLimit = body.rateLimit;

  const updated = await prisma.oAuth2App.update({
    where: { id },
    data: updateData,
  });

  await prisma.auditLog.create({
    data: {
      tenantId: app.tenantId,
      userId: user.id,
      action: "oauth_app_updated",
      resource: "oauth2_app",
      resourceId: id,
      metadata: JSON.stringify(body),
    },
  });

  return NextResponse.json({ success: true, app: updated });
}

/**
 * DELETE /api/console/oauth-apps/:id
 * Delete an OAuth2 app.
 */
export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const app = await prisma.oAuth2App.findUnique({ where: { id } });
  if (!app) {
    return NextResponse.json({ error: "App not found" }, { status: 404 });
  }

  const member = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId: app.tenantId, userId: user.id } },
  });

  if (!member || member.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.oAuth2App.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      tenantId: app.tenantId,
      userId: user.id,
      action: "oauth_app_deleted",
      resource: "oauth2_app",
      resourceId: id,
      metadata: JSON.stringify({ name: app.name }),
    },
  });

  return NextResponse.json({ success: true });
}
