import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { invoiceId, method } = body;
  if (!invoiceId || !method) {
    return NextResponse.json({ error: "Missing invoiceId or method" }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { tenant: true },
  });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  // Verify user has access to this tenant
  const hasAccess =
    invoice.tenant.ownerId === user.id ||
    (await prisma.tenantMember.findFirst({
      where: { tenantId: invoice.tenantId, userId: user.id },
    }));
  if (!hasAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Simulate payment processing
  await new Promise((r) => setTimeout(r, 800));

  const updated = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "paid", paidAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      tenantId: invoice.tenantId,
      userId: user.id,
      action: "invoice_paid",
      resource: "invoice",
      resourceId: invoiceId,
      metadata: JSON.stringify({ method, amount: invoice.amount }),
    },
  });

  return NextResponse.json({ invoice: updated });
}
