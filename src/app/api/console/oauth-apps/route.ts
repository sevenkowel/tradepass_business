import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import crypto from "crypto";

function generateClientId(): string {
  return "tp_" + crypto.randomBytes(16).toString("hex");
}

function generateClientSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * GET /api/console/oauth-apps
 * List OAuth2 apps for current tenant.
 */
export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get("tenantId");

  if (!tenantId) {
    return NextResponse.json({ error: "tenantId required" }, { status: 400 });
  }

  const member = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId, userId: user.id } },
  });

  if (!member) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const apps = await prisma.oAuth2App.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    apps: apps.map((app) => ({
      id: app.id,
      name: app.name,
      description: app.description,
      clientId: app.clientId,
      clientSecret: "••••••••••••••••", // Masked
      redirectUris: JSON.parse(app.redirectUris || "[]"),
      scopes: JSON.parse(app.scopes || "[]"),
      status: app.status,
      rateLimit: app.rateLimit,
      lastUsedAt: app.lastUsedAt?.toISOString(),
      createdAt: app.createdAt.toISOString(),
    })),
  });
}

/**
 * POST /api/console/oauth-apps
 * Create a new OAuth2 app.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { tenantId, name, description, redirectUris, scopes, rateLimit } = body;

  if (!tenantId || !name || !redirectUris?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const member = await prisma.tenantMember.findUnique({
    where: { tenantId_userId: { tenantId, userId: user.id } },
  });

  if (!member || member.role !== "owner") {
    return NextResponse.json({ error: "Only owner can create apps" }, { status: 403 });
  }

  const clientId = generateClientId();
  const clientSecret = generateClientSecret();

  const app = await prisma.oAuth2App.create({
    data: {
      tenantId,
      name,
      description,
      clientId,
      clientSecret,
      redirectUris: JSON.stringify(redirectUris),
      scopes: JSON.stringify(scopes || ["read", "write"]),
      rateLimit: rateLimit || 1000,
    },
  });

  await prisma.auditLog.create({
    data: {
      tenantId,
      userId: user.id,
      action: "oauth_app_created",
      resource: "oauth2_app",
      resourceId: app.id,
      metadata: JSON.stringify({ name }),
    },
  });

  return NextResponse.json({
    success: true,
    app: {
      id: app.id,
      name: app.name,
      clientId: app.clientId,
      clientSecret, // Show once on creation
      redirectUris,
      scopes: scopes || ["read", "write"],
      status: app.status,
      rateLimit: app.rateLimit,
      createdAt: app.createdAt.toISOString(),
    },
  });
}
