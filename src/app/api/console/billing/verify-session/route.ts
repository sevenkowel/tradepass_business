import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { stripe, isStripeConfigured } from "@/lib/stripe/config";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  if (!isStripeConfigured || !stripe) {
    return NextResponse.json({ devMode: true, sessionId });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      // Update invoice if not already updated by webhook
      await prisma.invoice.updateMany({
        where: { stripeCheckoutSessionId: sessionId, status: { not: "paid" } },
        data: {
          status: "paid",
          paidAt: new Date(),
          stripePaymentIntentId: session.payment_intent as string,
        },
      });

      return NextResponse.json({
        verified: true,
        status: session.payment_status,
        amount: session.amount_total,
        currency: session.currency,
      });
    }

    return NextResponse.json({
      verified: false,
      status: session.payment_status,
    });
  } catch (err: any) {
    console.error("[Verify Session] Error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
