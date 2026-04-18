export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSubscription } from "@/lib/paypal";
import { PLANS, PAID_PLANS, type PlanId } from "@/lib/plans";

/**
 * POST /api/billing/paypal/verify
 *
 * Called by the PayPal onApprove callback after the user approves a subscription.
 * Verifies the subscription is ACTIVE with PayPal, then updates the business record.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const body = await req.json();
  const { subscriptionId, planId } = body as { subscriptionId: string; planId: PlanId };

  if (!subscriptionId || !planId || !PAID_PLANS.includes(planId)) {
    return NextResponse.json({ error: "Missing or invalid params" }, { status: 400 });
  }

  // Verify with PayPal that the subscription is active
  const subscription = await getSubscription(subscriptionId);
  if (subscription.status !== "ACTIVE" && subscription.status !== "APPROVED") {
    return NextResponse.json(
      { error: `Subscription not active (status: ${subscription.status})` },
      { status: 400 }
    );
  }

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const planConfig = PLANS[planId];
  const nextBilling = subscription.billing_info?.next_billing_time
    ? new Date(subscription.billing_info.next_billing_time)
    : null;

  // Determine amount from last payment or plan price
  const lastPayment = subscription.billing_info?.last_payment;
  const amountCents = lastPayment
    ? Math.round(parseFloat(lastPayment.amount.value) * 100)
    : planConfig.priceUSD * 100;

  await db.$transaction([
    db.business.update({
      where: { id: business.id },
      data: {
        plan: planId,
        paymentProvider: "PAYPAL",
        paypalSubscriptionId: subscriptionId,
        subscriptionStatus: "active",
        currentPeriodEnd: nextBilling,
      },
    }),
    db.transaction.create({
      data: {
        businessId: business.id,
        provider: "PAYPAL",
        paypalSubscriptionId: subscriptionId,
        paypalOrderId: `${subscriptionId}_${Date.now()}`, // unique per activation
        amount: amountCents,
        currency: "USD",
        status: "COMPLETED",
        method: "paypal",
        planId,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
