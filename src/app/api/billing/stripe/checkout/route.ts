export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getStripe } from "@/lib/stripe";
import { PLANS, PAID_PLANS, type PlanId } from "@/lib/plans";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { planId } = await req.json() as { planId: PlanId };
  if (!PAID_PLANS.includes(planId)) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const plan = PLANS[planId];
  if (!plan.stripePriceId) return NextResponse.json({ error: "Stripe not configured for this plan." }, { status: 400 });

  const stripe = getStripe();
  const origin = process.env.NEXTAUTH_URL ?? "https://nudge-dev.netlify.app";

  // Get or create Stripe customer
  let customerId = business.stripeCustomerId ?? undefined;
  if (!customerId) {
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    const customer = await stripe.customers.create({
      email: user?.email,
      name: business.name,
      metadata: { businessId: business.id },
    });
    customerId = customer.id;
    await db.business.update({ where: { id: business.id }, data: { stripeCustomerId: customerId } });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: `${origin}/settings?billing=success`,
    cancel_url: `${origin}/settings?billing=cancel`,
    metadata: { businessId: business.id, planId },
    subscription_data: { metadata: { businessId: business.id, planId } },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
