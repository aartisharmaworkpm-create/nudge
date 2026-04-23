export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRazorpay } from "@/lib/razorpay";
import { PLANS, PAID_PLANS, type PlanId } from "@/lib/plans";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { planId } = await req.json() as { planId: PlanId };
  if (!PAID_PLANS.includes(planId)) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const plan = PLANS[planId];
  if (!plan.razorpayPlanId) return NextResponse.json({ error: "Razorpay not configured for this plan." }, { status: 400 });

  const razorpay = getRazorpay();
  const user = await db.user.findUnique({ where: { id: session.user.id } });

  // Get or create Razorpay customer
  let customerId = business.razorpayCustomerId ?? undefined;
  if (!customerId) {
    const customer = await razorpay.customers.create({
      name: business.name,
      email: user?.email ?? "",
      fail_existing: 0,
    });
    customerId = customer.id;
    await db.business.update({ where: { id: business.id }, data: { razorpayCustomerId: customerId } });
  }

  // Create subscription
  const subscription = await razorpay.subscriptions.create({
    plan_id: plan.razorpayPlanId,
    customer_notify: 1,
    quantity: 1,
    total_count: 12, // 12 billing cycles (1 year)
    notes: { businessId: business.id, planId },
  });

  return NextResponse.json({
    subscriptionId: subscription.id,
    keyId: process.env.RAZORPAY_KEY_ID,
    businessName: business.name,
    email: user?.email ?? "",
    planLabel: plan.label,
    priceINR: plan.priceINR,
  });
}
