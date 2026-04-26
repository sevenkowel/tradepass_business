import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { stripe, isStripeConfigured } from "@/lib/stripe/config";
import { getPlanPrice, PLAN_LIMITS, getStripeAmount, type Currency } from "@/lib/stripe/pricing";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { plan, yearly = false, currency = "USD", successUrl, cancelUrl } = body;

  if (!plan || !PLAN_LIMITS[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const tenant = await prisma.tenant.findFirst({
    where: { ownerId: user.id },
    include: {
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
      stripeCustomer: true,
    },
  });

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  const priceInfo = getPlanPrice(plan, currency as Currency, yearly);
  const amount = yearly ? priceInfo.yearly : priceInfo.monthly;

  if (amount <= 0) {
    // Free plan — just upgrade without payment
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        plan,
        maxUsers: PLAN_LIMITS[plan].maxUsers,
        maxAccounts: PLAN_LIMITS[plan].maxAccounts,
        status: "active",
      },
    });

    const existingSub = tenant.subscriptions[0];
    if (existingSub) {
      await prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          planName: plan,
          status: "active",
          seatLimit: PLAN_LIMITS[plan].maxUsers,
        },
      });
    }

    return NextResponse.json({ success: true, plan, free: true });
  }

  // === Stripe Checkout Session ===
  let stripeCustomerId = tenant.stripeCustomer?.stripeCustomerId;

  if (isStripeConfigured && stripe) {
    // Create Stripe customer if not exists
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || tenant.name,
        metadata: { tenantId: tenant.id, userId: user.id },
      });
      stripeCustomerId = customer.id;

      await prisma.stripeCustomer.create({
        data: {
          tenantId: tenant.id,
          stripeCustomerId: customer.id,
          email: user.email,
          name: user.name || tenant.name,
          defaultCurrency: currency,
        },
      });
    }

    const stripePrice = getStripeAmount(amount, currency as Currency);
    const mode: "subscription" | "payment" = yearly ? "subscription" : "payment";

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: stripePrice.currency,
            product_data: {
              name: `TradePass ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
              description: yearly
                ? `Annual subscription - ${priceInfo.yearlyDiscount}% discount`
                : `Monthly subscription`,
            },
            unit_amount: stripePrice.amount,
            recurring: yearly ? { interval: "year" } : undefined,
          },
          quantity: 1,
        },
      ],
      mode,
      success_url: successUrl || `${req.headers.get("origin") || "http://localhost:3001"}/console/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.get("origin") || "http://localhost:3001"}/console/billing/cancel`,
      metadata: {
        tenantId: tenant.id,
        userId: user.id,
        plan,
        yearly: String(yearly),
        currency,
      },
    });

    // Create pending invoice
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + (yearly ? 12 : 1));

    await prisma.invoice.create({
      data: {
        tenantId: tenant.id,
        invoiceNumber: `INV-${Date.now()}`,
        periodStart: now,
        periodEnd,
        amount,
        currency,
        status: "pending",
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        stripeCustomerId,
        stripeCheckoutSessionId: session.id,
        paymentMethod: "card",
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
      stripeConfigured: true,
    });
  }

  // === Fallback: Dev mode — simulate checkout ===
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + (yearly ? 12 : 1));

  const invoice = await prisma.invoice.create({
    data: {
      tenantId: tenant.id,
      invoiceNumber: `INV-${Date.now()}`,
      periodStart: now,
      periodEnd,
      amount,
      currency,
      status: "pending",
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      stripeCustomerId: `cus_dev_${Date.now()}`,
      stripeCheckoutSessionId: `cs_dev_${Date.now()}`,
      paymentMethod: "card",
    },
  });

  return NextResponse.json({
    success: true,
    devMode: true,
    invoiceId: invoice.id,
    amount,
    currency,
    redirectUrl: `/console/billing/success?dev_invoice=${invoice.id}`,
  });
}
