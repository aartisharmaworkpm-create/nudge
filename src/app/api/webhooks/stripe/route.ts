export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import type Stripe from "stripe";
import type { PlanId } from "@/lib/plans";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  async function updateBusiness(customerId: string, data: Parameters<typeof db.business.update>[0]["data"]) {
    await db.business.updateMany({ where: { stripeCustomerId: customerId }, data });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const s = event.data.object as Stripe.Checkout.Session;
      if (s.mode === "subscription" && s.customer && s.subscription) {
        const sub = await getStripe().subscriptions.retrieve(s.subscription as string);
        const planId = (s.metadata?.planId ?? sub.metadata?.planId ?? "STARTER") as PlanId;
        await updateBusiness(s.customer as string, {
          plan: planId,
          stripeSubscriptionId: sub.id,
          subscriptionStatus: sub.status,
          currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000),
        });
      }
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const planId = (sub.metadata?.planId ?? "STARTER") as PlanId;
      await updateBusiness(sub.customer as string, {
        plan: sub.status === "canceled" ? "CANCELED" : planId,
        subscriptionStatus: sub.status,
        currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000),
      });
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await updateBusiness(sub.customer as string, {
        plan: "CANCELED",
        subscriptionStatus: "canceled",
        stripeSubscriptionId: null,
      });
      break;
    }
    case "invoice.payment_failed": {
      const inv = event.data.object as Stripe.Invoice;
      if (inv.customer) {
        await updateBusiness(inv.customer as string, { subscriptionStatus: "past_due" });
      }
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
