export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleIncomingReply } from "@/lib/dispatcher";
import crypto from "crypto";

/**
 * POST /api/webhooks/resend
 *
 * Receives Resend webhook events:
 *   - email.delivered  → mark Message as DELIVERED
 *   - email.bounced    → mark Message as FAILED
 *   - email.opened     → (logged, no action)
 *
 * Configure in Resend dashboard:
 *   Endpoint: https://yourdomain.com/api/webhooks/resend
 *   Events: email.delivered, email.bounced
 *   Signing secret: set as RESEND_WEBHOOK_SECRET in .env
 */
export async function POST(req: Request) {
  const rawBody = await req.text();

  // Verify Resend signature
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (webhookSecret) {
    const sig = req.headers.get("svix-signature") ?? "";
    const msgId = req.headers.get("svix-id") ?? "";
    const timestamp = req.headers.get("svix-timestamp") ?? "";

    const isValid = verifyResendSignature(rawBody, sig, msgId, timestamp, webhookSecret);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let event: ResendWebhookEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const nudgeMessageId = event.data?.headers?.find(
    (h: { name: string; value: string }) => h.name === "x-nudge-message-id"
  )?.value;

  switch (event.type) {
    case "email.delivered": {
      if (nudgeMessageId) {
        await db.message.updateMany({
          where: { id: nudgeMessageId, status: { not: "FAILED" } },
          data: { status: "DELIVERED", deliveredAt: new Date() },
        });
      }
      break;
    }

    case "email.bounced": {
      if (nudgeMessageId) {
        await db.message.updateMany({
          where: { id: nudgeMessageId },
          data: { status: "FAILED" },
        });
      }
      break;
    }

    case "email.complained":
    case "email.opened":
    case "email.clicked":
      // Log only — no action needed for MVP
      break;

    default:
      // Unknown event type — ignore
      break;
  }

  return NextResponse.json({ received: true });
}

// ── Signature verification ───────────────────────────────────────────────────
// Resend uses Svix for webhook signing.
// See: https://resend.com/docs/dashboard/webhooks/signatures
function verifyResendSignature(
  payload: string,
  svixSignature: string,
  svixId: string,
  svixTimestamp: string,
  secret: string
): boolean {
  try {
    const toSign = `${svixId}.${svixTimestamp}.${payload}`;
    const secretBytes = Buffer.from(secret.replace("whsec_", ""), "base64");
    const computed = crypto.createHmac("sha256", secretBytes).update(toSign).digest("base64");
    const signatures = svixSignature.split(" ").map((s) => s.split(",")[1]);
    return signatures.some((sig) => sig === computed);
  } catch {
    return false;
  }
}

// ── Resend webhook event types ───────────────────────────────────────────────
type ResendWebhookEvent = {
  type: string;
  data: {
    email_id?: string;
    to?: string[];
    subject?: string;
    headers?: { name: string; value: string }[];
    [key: string]: unknown;
  };
};
