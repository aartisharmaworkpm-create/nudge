export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleIncomingReply } from "@/lib/dispatcher";
import crypto from "crypto";

/**
 * WhatsApp Cloud API webhook — two purposes:
 *
 * 1. GET  — webhook verification challenge (Meta requires this on setup)
 * 2. POST — receive delivery receipts and inbound messages
 *
 * Configure in Meta Developer Portal:
 *   Webhook URL: https://yourdomain.com/api/webhooks/whatsapp
 *   Verify token: value of WHATSAPP_WEBHOOK_VERIFY_TOKEN in .env
 *   Subscribe to: messages
 *
 * Required env vars:
 *   WHATSAPP_WEBHOOK_VERIFY_TOKEN  — token you set in Meta portal
 *   WHATSAPP_APP_SECRET            — app secret from Meta for signature verification
 */

// ── GET — webhook verification ───────────────────────────────────────────────
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// ── POST — receive events ─────────────────────────────────────────────────────
export async function POST(req: Request) {
  const rawBody = await req.text();

  // Verify Meta signature
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (appSecret) {
    const sig = req.headers.get("x-hub-signature-256") ?? "";
    const expected = "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
    if (sig !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let payload: WAWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Walk the nested Meta webhook structure
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      if (change.field !== "messages") continue;

      const value = change.value;

      // ── Delivery / read receipts ──────────────────────────────────────────
      for (const status of value.statuses ?? []) {
        await handleDeliveryStatus(status);
      }

      // ── Inbound messages (client replies) ────────────────────────────────
      for (const message of value.messages ?? []) {
        if (message.type === "text" && message.text?.body) {
          await handleInboundMessage(message, value.metadata?.phone_number_id ?? "");
        }
      }
    }
  }

  // Meta requires 200 OK immediately
  return NextResponse.json({ received: true });
}

// ── Handlers ─────────────────────────────────────────────────────────────────

async function handleDeliveryStatus(status: WAStatus) {
  // status.id = WhatsApp message ID (wamid)
  // We need to find our internal message by its external ID.
  // The dispatcher stores the wamid in the message when it calls sendWhatsApp.
  // For MVP we match by looking for messages sent around the same time.
  // A production version would store the wamid on the Message record.

  if (status.status === "delivered") {
    // Find the most recent sent message to this recipient number
    const phone = status.recipient_id;
    const client = await db.client.findFirst({ where: { whatsapp: { contains: phone.slice(-9) } } });
    if (!client) return;

    await db.message.updateMany({
      where: {
        status: "SENT",
        sequence: { invoice: { clientId: client.id }, status: "ACTIVE" },
      },
      data: { status: "DELIVERED", deliveredAt: new Date() },
    });
  }

  if (status.status === "failed") {
    const phone = status.recipient_id;
    const client = await db.client.findFirst({ where: { whatsapp: { contains: phone.slice(-9) } } });
    if (!client) return;

    await db.message.updateMany({
      where: {
        status: "SENT",
        sequence: { invoice: { clientId: client.id }, status: "ACTIVE" },
      },
      data: { status: "FAILED" },
    });
  }
}

async function handleInboundMessage(message: WAMessage, phoneNumberId: string) {
  const from = message.from; // sender's WhatsApp number
  const body = message.text?.body ?? "";

  if (!body.trim()) return;

  // Find the active sequence linked to this number
  const client = await db.client.findFirst({
    where: { whatsapp: { contains: from.slice(-9) } },
  });

  if (!client) {
    console.log(`[whatsapp/webhook] No client found for number ${from}`);
    return;
  }

  const result = await handleIncomingReply({
    externalMessageId: message.id,
    replyBody: body,
    channel: "WHATSAPP",
  });

  if (result.paused) {
    console.log(`[whatsapp/webhook] Sequence paused for invoice ${result.invoiceId} — client replied`);
  }
}

// ── Meta webhook payload types ───────────────────────────────────────────────

type WAWebhookPayload = {
  object: string;
  entry: Array<{
    id: string;
    changes: Array<{
      field: string;
      value: WAChangeValue;
    }>;
  }>;
};

type WAChangeValue = {
  messaging_product: string;
  metadata: { display_phone_number: string; phone_number_id: string };
  statuses?: WAStatus[];
  messages?: WAMessage[];
};

type WAStatus = {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  errors?: { code: number; title: string }[];
};

type WAMessage = {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: { body: string };
};
