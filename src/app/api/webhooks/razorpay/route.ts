export const runtime = "nodejs";

/**
 * Razorpay webhook handler.
 * Configure this URL in Razorpay Dashboard → Webhooks: /api/webhooks/razorpay
 * Events to enable: subscription.charged, subscription.cancelled, payment.failed
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

type RzpPaymentEntity = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  subscription_id?: string;
};

type RzpWebhookPayload = {
  event: string;
  payload: {
    payment?: { entity: RzpPaymentEntity };
    subscription?: { entity: { id: string; status: string; plan_id: string } };
  };
};

export async function POST(req: Request) {
  const rawBody  = await req.text();
  const sig      = req.headers.get("x-razorpay-signature") ?? "";
  const secret   = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

  // Verify signature if webhook secret is configured
  if (secret) {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    if (expected !== sig) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  let data: RzpWebhookPayload;
  try {
    data = JSON.parse(rawBody) as RzpWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { event, payload } = data;

  // ── subscription.charged: recurring payment captured ──────────────────────
  if (event === "subscription.charged") {
    const payment      = payload.payment?.entity;
    const subscription = payload.subscription?.entity;
    if (!payment || !subscription) return NextResponse.json({ ok: true });

    const business = await db.business.findFirst({
      where: { razorpaySubscriptionId: subscription.id },
    });
    if (!business) return NextResponse.json({ ok: true });

    await db.transaction.upsert({
      where:  { razorpayPaymentId: payment.id },
      update: { status: payment.status },
      create: {
        businessId:             business.id,
        razorpayPaymentId:      payment.id,
        razorpaySubscriptionId: subscription.id,
        amount:                 payment.amount,
        currency:               payment.currency,
        status:                 payment.status,
        method:                 payment.method,
        planId:                 business.plan,
      },
    });

    // Refresh period end on each successful charge
    if (payment.status === "captured") {
      const periodEnd = new Date();
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      await db.business.update({
        where: { id: business.id },
        data:  { subscriptionStatus: "active", currentPeriodEnd: periodEnd },
      });
    }
  }

  // ── subscription.cancelled ─────────────────────────────────────────────────
  if (event === "subscription.cancelled") {
    const subscription = payload.subscription?.entity;
    if (!subscription) return NextResponse.json({ ok: true });

    await db.business.updateMany({
      where: { razorpaySubscriptionId: subscription.id },
      data:  { subscriptionStatus: "cancelled", plan: "CANCELED" },
    });
  }

  // ── payment.failed (for subscription payments) ────────────────────────────
  if (event === "payment.failed") {
    const payment = payload.payment?.entity;
    if (!payment?.subscription_id) return NextResponse.json({ ok: true });

    const business = await db.business.findFirst({
      where: { razorpaySubscriptionId: payment.subscription_id },
    });
    if (!business) return NextResponse.json({ ok: true });

    await db.transaction.upsert({
      where:  { razorpayPaymentId: payment.id },
      update: { status: "failed" },
      create: {
        businessId:             business.id,
        razorpayPaymentId:      payment.id,
        razorpaySubscriptionId: payment.subscription_id,
        amount:                 payment.amount,
        currency:               payment.currency,
        status:                 "failed",
        method:                 payment.method,
        planId:                 business.plan,
      },
    });

    await db.business.updateMany({
      where: { razorpaySubscriptionId: payment.subscription_id },
      data:  { subscriptionStatus: "past_due" },
    });
  }

  return NextResponse.json({ ok: true });
}
