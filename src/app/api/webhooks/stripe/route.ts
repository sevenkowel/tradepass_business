import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe, isStripeConfigured } from "@/lib/stripe/config";
import { PLAN_LIMITS } from "@/lib/stripe/pricing";
import type Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

/**
 * Stripe Webhook handler
 * Processes checkout completion, payment success/failure, subscription events
 */
export async function POST(req: NextRequest) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") || "";

  if (!isStripeConfigured) {
    // In dev mode with placeholder keys, log and return 200 to avoid retries
    console.log("[Stripe Webhook] Dev mode — received payload (ignored):", payload.slice(0, 200));
    return NextResponse.json({ received: true, devMode: true });
  }

  if (!stripe) {
    return NextResponse.json({ error: "Stripe not initialized" }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  console.log(`[Stripe Webhook] Event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        await handleCheckoutCompleted(session);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as any;
        await handleInvoicePaid(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error(`[Stripe Webhook] Error processing ${event.type}:`, err);
    // Return 500 to trigger Stripe retry for critical events
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: any) {
  const metadata = session.metadata || {};
  const { tenantId, plan, yearly } = metadata;

  if (!tenantId || !plan) {
    console.warn("[Stripe Webhook] Missing metadata in checkout session");
    return;
  }

  // Update invoice
  await prisma.invoice.updateMany({
    where: { stripeCheckoutSessionId: session.id },
    data: {
      status: "paid",
      paidAt: new Date(),
      stripePaymentIntentId: session.payment_intent,
    },
  });

  // Update tenant plan
  const limits = PLAN_LIMITS[plan];
  await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      plan,
      maxUsers: limits.maxUsers,
      maxAccounts: limits.maxAccounts,
      status: "active",
      gracePeriodEndsAt: null,
      downgradeReason: null,
    },
  });

  // Update subscription
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { subscriptions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (tenant?.subscriptions[0]) {
    const sub = tenant.subscriptions[0];
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + (yearly === "true" ? 12 : 1));

    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        planName: plan,
        status: "active",
        seatLimit: limits.maxUsers,
        startsAt: now,
        endsAt: periodEnd,
      },
    });
  }

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tenantId,
      action: "subscription_activated",
      resource: "subscription",
      resourceId: session.id,
      metadata: JSON.stringify({ plan, yearly, amount: session.amount_total, currency: session.currency }),
    },
  });

  console.log(`[Stripe Webhook] Checkout completed for tenant ${tenantId}, plan: ${plan}`);
}

async function handleInvoicePaid(stripeInvoice: any) {
  // Update subscription period
  const subscriptionId = stripeInvoice.subscription;

  // Update related invoice
  await prisma.invoice.updateMany({
    where: { stripePaymentIntentId: stripeInvoice.payment_intent },
    data: { status: "paid", paidAt: new Date() },
  });

  console.log(`[Stripe Webhook] Invoice paid: ${stripeInvoice.id}`);
}

async function handleInvoicePaymentFailed(stripeInvoice: any) {
  await prisma.invoice.updateMany({
    where: { stripePaymentIntentId: stripeInvoice.payment_intent },
    data: { status: "failed" },
  });

  // Try to find related tenant from invoice and send notification
  const invoice = await prisma.invoice.findFirst({
    where: { stripePaymentIntentId: stripeInvoice.payment_intent },
  });

  if (invoice) {
    await prisma.tenantNotification.create({
      data: {
        tenantId: invoice.tenantId,
        type: "payment_failed",
        title: "支付失败",
        content: `您的订阅支付失败。请更新支付方式以避免服务中断。`,
        channel: "both",
        metadata: JSON.stringify({
          invoiceId: stripeInvoice.id,
          amount: stripeInvoice.amount_due,
          currency: stripeInvoice.currency,
        }),
      },
    });
  }

  console.log(`[Stripe Webhook] Invoice payment failed: ${stripeInvoice.id}`);
}

async function handleSubscriptionDeleted(stripeSubscription: any) {
  // We don't store stripeSubscriptionId in our Subscription model
  // In production, you would add this field. For now, we log and skip.
  // The customer ID can be used as a fallback to find the tenant.
  console.log(`[Stripe Webhook] Subscription deleted: ${stripeSubscription.id} — manual lookup needed`);
}

async function handleSubscriptionUpdated(stripeSubscription: any) {
  // Subscription updated — we don't have stripeSubscriptionId in our model
  // so we log and skip for now. In production, you would query by customer ID
  // or store the stripeSubscriptionId in the Subscription model.
  console.log(`[Stripe Webhook] Subscription updated: ${stripeSubscription.id} -> ${stripeSubscription.status}`);
}
