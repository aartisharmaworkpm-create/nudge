export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";
import type { PlanId } from "@/lib/plans";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature, planId } =
    await req.json() as {
      razorpay_payment_id: string;
      razorpay_subscription_id: string;
      razorpay_signature: string;
      planId: PlanId;
    };

  const secret = process.env.RAZORPAY_KEY_SECRET ?? "";
  const body = `${razorpay_payment_id}|${razorpay_subscription_id}`;
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  await db.business.update({
    where: { id: business.id },
    data: {
      plan: planId,
      razorpaySubscriptionId: razorpay_subscription_id,
      subscriptionStatus: "active",
      currentPeriodEnd: periodEnd,
    },
  });

  return NextResponse.json({ ok: true });
}
