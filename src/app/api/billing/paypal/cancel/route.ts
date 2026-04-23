export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { cancelSubscription } from "@/lib/paypal";

/**
 * POST /api/billing/paypal/cancel
 * Cancels the active PayPal subscription and marks the business as CANCELED.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  if (!business.paypalSubscriptionId) {
    return NextResponse.json({ error: "No active PayPal subscription found" }, { status: 400 });
  }

  const ok = await cancelSubscription(business.paypalSubscriptionId);
  if (!ok) return NextResponse.json({ error: "PayPal cancellation failed" }, { status: 500 });

  await db.business.update({
    where: { id: business.id },
    data: {
      plan: "CANCELED",
      subscriptionStatus: "cancelled",
      paypalSubscriptionId: null,
    },
  });

  return NextResponse.json({ success: true });
}
