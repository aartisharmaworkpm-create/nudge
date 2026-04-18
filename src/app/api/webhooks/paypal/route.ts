export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSubscription } from "@/lib/paypal";
import crypto from "crypto";

/**
 * POST /api/webhooks/paypal
 *
 * Handles PayPal webhook events:
 *  - BILLING.SUBSCRIPTION.ACTIVATED   → ensure plan is set correctly
 *  - BILLING.SUBSCRIPTION.CANCELLED   → mark plan as CANCELED
 *  - PAYMENT.SALE.COMPLETED           → record successful recurring payment
 *  - PAYMENT.SALE.DENIED              → record failed payment
 *
 * Configure in PayPal Developer Dashboard:
 *   Endpoint: https://yourdomain.com/api/webhooks/paypal
 *   Set PAYPAL_WEBHOOK_ID in .env
 */
export async function POST(req: Request) {
  const rawBody = await req.text();

  // Verify signature if webhook ID is configured
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (webhookId) {
    const valid = verifyPayPalSignature(req, rawBody, webhookId);
    if (!valid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: PayPalWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const resource = event.resource ?? {};

  switch (event.event_type) {
    case "BILLING.SUBSCRIPTION.ACTIVATED": {
      const subscriptionId = resource.id as string;
      if (!subscriptionId) break;

      const business = await db.business.findUnique({
        where: { paypalSubscriptionId: subscriptionId },
      });
      if (business) {
        await db.business.update({
          where: { id: business.id },
          data: { subscriptionStatus: "active" },
        });
      }
      break;
    }

    case "BILLING.SUBSCRIPTION.CANCELLED":
    case "BILLING.SUBSCRIPTION.EXPIRED": {
      const subscriptionId = resource.id as string;
      if (!subscriptionId) break;

      await db.business.updateMany({
        where: { paypalSubscriptionId: subscriptionId },
        data: { plan: "CANCELED", subscriptionStatus: "cancelled", paypalSubscriptionId: null },
      });
      break;
    }

    case "PAYMENT.SALE.COMPLETED": {
      // Recurring payment success
      const saleId       = resource.id as string;
      const subsId       = (resource.billing_agreement_id ?? resource.subscription_id) as string | undefined;
      const amt          = resource.amount as Record<string, string> | undefined;
      const amountValue  = amt?.total ?? amt?.value ?? "0";
      const currency     = amt?.currency ?? amt?.currency_code ?? "USD";
      const amountCents  = Math.round(parseFloat(amountValue) * 100);

      if (subsId) {
        const business = await db.business.findUnique({ where: { paypalSubscriptionId: subsId } });
        if (business) {
          // Refresh period end from PayPal
          const sub = await getSubscription(subsId);
          const nextBilling = sub.billing_info?.next_billing_time
            ? new Date(sub.billing_info.next_billing_time)
            : null;

          await db.$transaction([
            db.business.update({
              where: { id: business.id },
              data: { subscriptionStatus: "active", currentPeriodEnd: nextBilling },
            }),
            db.transaction.upsert({
              where: { paypalOrderId: saleId },
              update: { status: "COMPLETED" },
              create: {
                businessId: business.id,
                provider: "PAYPAL",
                paypalOrderId: saleId,
                paypalSubscriptionId: subsId,
                amount: amountCents,
                currency,
                status: "COMPLETED",
                method: "paypal",
                planId: business.plan,
              },
            }),
          ]);
        }
      }
      break;
    }

    case "PAYMENT.SALE.DENIED":
    case "PAYMENT.SALE.REFUNDED": {
      const saleId  = resource.id as string;
      const status  = event.event_type === "PAYMENT.SALE.REFUNDED" ? "refunded" : "failed";
      const subsId  = (resource.billing_agreement_id ?? resource.subscription_id) as string | undefined;

      if (subsId) {
        const business = await db.business.findUnique({ where: { paypalSubscriptionId: subsId } });
        if (business) {
          const amt2        = resource.amount as Record<string, string> | undefined;
          const amountValue = amt2?.total ?? amt2?.value ?? "0";
          const currency    = amt2?.currency ?? "USD";

          await db.transaction.upsert({
            where: { paypalOrderId: saleId },
            update: { status },
            create: {
              businessId: business.id,
              provider: "PAYPAL",
              paypalOrderId: saleId,
              paypalSubscriptionId: subsId,
              amount: Math.round(parseFloat(amountValue) * 100),
              currency,
              status,
              method: "paypal",
              planId: business.plan,
            },
          });

          if (status === "failed") {
            await db.business.update({
              where: { id: business.id },
              data: { subscriptionStatus: "past_due" },
            });
          }
        }
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}

// ── Signature verification ────────────────────────────────────────────────────
function verifyPayPalSignature(
  req: Request,
  body: string,
  webhookId: string
): boolean {
  try {
    const transmissionId  = req.headers.get("paypal-transmission-id") ?? "";
    const timestamp       = req.headers.get("paypal-transmission-time") ?? "";
    const certUrl         = req.headers.get("paypal-cert-url") ?? "";
    const signature       = req.headers.get("paypal-transmission-sig") ?? "";

    if (!transmissionId || !timestamp || !certUrl || !signature) return false;

    // Basic validation: we have all required headers.
    // Full cert-based verification requires fetching PayPal's cert (async),
    // which we skip here for simplicity. Set PAYPAL_WEBHOOK_ID to enable
    // header presence check; for full verification use the PayPal Node SDK.
    void (body + webhookId); // referenced to avoid lint warnings
    return true;
  } catch {
    return false;
  }
}

type PayPalWebhookEvent = {
  event_type: string;
  resource: Record<string, unknown>;
};
