export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getRazorpay } from "@/lib/razorpay";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  if (!business.razorpaySubscriptionId) {
    return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
  }

  const razorpay = getRazorpay();

  try {
    // cancel_at_cycle_end = true → subscription stays active until end of paid period
    await (razorpay.subscriptions as unknown as {
      cancel: (id: string, cancel_at_cycle_end: boolean) => Promise<void>;
    }).cancel(business.razorpaySubscriptionId, true);
  } catch {
    // If already cancelled on Razorpay side, proceed with DB update anyway
  }

  await db.business.update({
    where: { id: business.id },
    data: {
      plan: "CANCELED",
      subscriptionStatus: "cancelled",
      razorpaySubscriptionId: null,
    },
  });

  return NextResponse.json({ ok: true });
}
