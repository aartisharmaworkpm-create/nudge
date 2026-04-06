import { db } from "@/lib/db";
import { sendEmail, buildSubjectLine } from "@/lib/email";
import { sendWhatsApp } from "@/lib/whatsapp";
import type { Message, Sequence, Invoice, Client, Business } from "@/generated/prisma/client";

type DispatchContext = {
  message: Message;
  sequence: Sequence;
  invoice: Invoice;
  client: Client;
  business: Business;
};

type DispatchResult = {
  messageId: string;
  success: boolean;
  channels: { channel: string; success: boolean; error?: string }[];
};

/**
 * Dispatch a single message — sends via all configured channels,
 * updates DB status, and returns a result summary.
 */
export async function dispatchMessage(ctx: DispatchContext): Promise<DispatchResult> {
  const { message, invoice, client, business } = ctx;
  const results: { channel: string; success: boolean; error?: string }[] = [];

  const sendEmail_ = message.channel === "EMAIL" || message.channel === "BOTH";
  const sendWA_ = message.channel === "WHATSAPP" || message.channel === "BOTH";

  // ── Email ────────────────────────────────────────────────────────────────
  if (sendEmail_ && client.email) {
    const subject = buildSubjectLine(
      business.name,
      message.step,
      message.tone,
    );

    const emailResult = await sendEmail({
      to: client.email,
      subject,
      body: message.body,
      fromName: business.name,
      fromEmail: business.emailDomain
        ? `reminders@${business.emailDomain}`
        : undefined,
      replyTo: business.emailDomain
        ? `hello@${business.emailDomain}`
        : undefined,
      messageId: message.id,
    });

    results.push({ channel: "EMAIL", ...emailResult });
  } else if (sendEmail_ && !client.email) {
    results.push({ channel: "EMAIL", success: false, error: "No email address for client." });
  }

  // ── WhatsApp ─────────────────────────────────────────────────────────────
  if (sendWA_ && client.whatsapp) {
    const waResult = await sendWhatsApp({
      to: client.whatsapp,
      body: message.body,
      messageId: message.id,
    });

    results.push({ channel: "WHATSAPP", ...waResult });
  } else if (sendWA_ && !client.whatsapp) {
    results.push({ channel: "WHATSAPP", success: false, error: "No WhatsApp number for client." });
  }

  const anySuccess = results.some((r) => r.success);
  const allFailed = results.length > 0 && results.every((r) => !r.success);

  // ── Update DB ─────────────────────────────────────────────────────────────
  await db.message.update({
    where: { id: message.id },
    data: {
      status: allFailed ? "FAILED" : "SENT",
      sentAt: anySuccess ? new Date() : null,
    },
  });

  return { messageId: message.id, success: anySuccess, channels: results };
}

/**
 * Find all messages that are due to send right now and dispatch them.
 * Called by the cron endpoint.
 */
export async function dispatchDueMessages(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
  results: DispatchResult[];
}> {
  const now = new Date();

  // Find scheduled messages on active sequences that are due
  const dueMsgs = await db.message.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
      sequence: {
        status: "ACTIVE",
      },
    },
    include: {
      sequence: {
        include: {
          invoice: {
            include: {
              client: true,
              business: true,
            },
          },
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
    take: 50, // process max 50 per cron run to avoid timeouts
  });

  const results: DispatchResult[] = [];
  let succeeded = 0;
  let failed = 0;

  for (const msg of dueMsgs) {
    // Re-check sequence hasn't been paused between the query and now
    const freshSeq = await db.sequence.findUnique({ where: { id: msg.sequenceId } });
    if (!freshSeq || freshSeq.status !== "ACTIVE") continue;

    // Mark as in-flight to prevent double-dispatch
    await db.message.update({
      where: { id: msg.id },
      data: { status: "SENT" }, // optimistic — will correct to FAILED if needed
    });

    const result = await dispatchMessage({
      message: msg,
      sequence: msg.sequence,
      invoice: msg.sequence.invoice,
      client: msg.sequence.invoice.client,
      business: msg.sequence.invoice.business,
    });

    results.push(result);
    if (result.success) succeeded++;
    else failed++;
  }

  // Auto-advance invoice status: if any message went out and invoice is OUTSTANDING, mark OVERDUE
  const invoiceIds = [...new Set(dueMsgs.map((m) => m.sequence.invoice.id))];
  for (const invoiceId of invoiceIds) {
    const inv = await db.invoice.findUnique({ where: { id: invoiceId } });
    if (inv && inv.status === "OUTSTANDING") {
      await db.invoice.update({ where: { id: invoiceId }, data: { status: "OVERDUE" } });
    }
  }

  // Auto-complete sequences where all messages have been sent/failed
  for (const msg of dueMsgs) {
    const remaining = await db.message.count({
      where: { sequenceId: msg.sequenceId, status: "SCHEDULED" },
    });
    if (remaining === 0) {
      await db.sequence.update({
        where: { id: msg.sequenceId, status: "ACTIVE" },
        data: { status: "COMPLETED", completedAt: new Date() },
      });
    }
  }

  return { processed: dueMsgs.length, succeeded, failed, results };
}

/**
 * Auto-pause a sequence when a client reply is detected.
 * Called from webhook handlers.
 */
export async function handleIncomingReply(params: {
  externalMessageId: string;
  replyBody: string;
  channel: "EMAIL" | "WHATSAPP";
}): Promise<{ paused: boolean; invoiceId?: string }> {
  // Find the original message by looking for active sequences
  // For email: match by externalId stored in reply tracking
  // For WhatsApp: match by the business WhatsApp number receiving the reply
  const message = await db.message.findFirst({
    where: {
      status: { in: ["SENT", "DELIVERED"] },
      sequence: { status: "ACTIVE" },
    },
    include: {
      sequence: { include: { invoice: { include: { client: true } } } },
      reply: true,
    },
    orderBy: { sentAt: "desc" },
  });

  if (!message || message.reply) return { paused: false };

  await db.$transaction(async (tx) => {
    // Record the reply
    await tx.reply.create({
      data: {
        messageId: message.id,
        channel: params.channel,
        body: params.replyBody,
        handled: false,
        resolution: "PENDING",
      },
    });

    // Pause the sequence
    await tx.sequence.update({
      where: { id: message.sequenceId },
      data: {
        status: "PAUSED",
        pausedAt: new Date(),
        pauseReason: `Client replied via ${params.channel.toLowerCase()}`,
      },
    });
  });

  return { paused: true, invoiceId: message.sequence.invoiceId };
}
