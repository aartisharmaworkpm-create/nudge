export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildSequenceSteps, interpolateTemplate } from "@/lib/sequence";
import { formatCurrency, formatDate } from "@/lib/currency";
import type { Tone, Channel } from "@/generated/prisma/client";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const invoices = await db.invoice.findMany({
    where: { businessId: business.id },
    include: { client: true, sequence: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invoices);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business found" }, { status: 404 });

  const body = await req.json();
  const {
    clientName,
    clientEmail,
    clientWhatsapp,
    existingClientId,
    amount,
    dueDate,
    paymentLink,
    paymentType,
    notes,
    tone,
    entryStep,
    channel,
  } = body;

  if (!clientName || !amount || !dueDate || !paymentLink) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!clientEmail && !clientWhatsapp) {
    return NextResponse.json({ error: "Client needs at least one contact method." }, { status: 400 });
  }

  // Find or create client
  let clientId = existingClientId;
  if (!clientId) {
    const existing = clientEmail
      ? await db.client.findUnique({ where: { businessId_email: { businessId: business.id, email: clientEmail } } })
      : null;

    if (existing) {
      clientId = existing.id;
    } else {
      const newClient = await db.client.create({
        data: { businessId: business.id, name: clientName, email: clientEmail ?? null, whatsapp: clientWhatsapp ?? null },
      });
      clientId = newClient.id;
    }
  }

  // Load templates
  const templates = await db.messageTemplate.findMany({
    where: {
      OR: [{ businessId: business.id }, { businessId: null }],
      tone: tone as Tone,
    },
    orderBy: { businessId: "asc" }, // business-specific first
  });

  const dueDateObj = new Date(dueDate);
  const steps = buildSequenceSteps(tone as Tone, channel as Channel, entryStep, dueDateObj, templates);

  if (steps.length === 0) {
    return NextResponse.json({ error: "No message templates found for this tone." }, { status: 500 });
  }

  // Create invoice + sequence + messages in one transaction
  const invoice = await db.$transaction(async (tx) => {
    const inv = await tx.invoice.create({
      data: {
        businessId: business.id,
        clientId,
        amount,
        currency: business.currency,
        dueDate: dueDateObj,
        paymentLink,
        paymentType: paymentType ?? "LINK",
        notes: notes ?? null,
        status: dueDateObj < new Date() ? "OVERDUE" : "OUTSTANDING",
      },
    });

    const seq = await tx.sequence.create({
      data: {
        invoiceId: inv.id,
        tone: tone as Tone,
        entryStep,
        status: "PENDING",
      },
    });

    // Build and interpolate each message
    const client = await tx.client.findUnique({ where: { id: clientId } });
    for (const step of steps) {
      const interpolated = interpolateTemplate(step.body, {
        clientName: client!.name,
        businessName: business.name,
        amount: formatCurrency(amount, business.currency),
        currency: business.currency,
        dueDate: formatDate(dueDateObj),
        paymentLink,
        ownerName: business.name,
      });
      await tx.message.create({
        data: {
          sequenceId: seq.id,
          step: step.step,
          channel: channel as Channel,
          tone: tone as Tone,
          body: interpolated,
          scheduledAt: step.scheduledAt,
          status: "SCHEDULED",
        },
      });
    }

    return inv;
  });

  return NextResponse.json({ id: invoice.id }, { status: 201 });
}
