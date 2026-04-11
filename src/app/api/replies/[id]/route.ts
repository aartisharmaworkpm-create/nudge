export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ReplyAction } from "@/generated/prisma/client";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business" }, { status: 404 });

  const { resolution } = await req.json() as { resolution: ReplyAction };

  const reply = await db.reply.findUnique({
    where: { id },
    include: { message: { include: { sequence: { include: { invoice: true } } } } },
  });

  if (!reply) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (reply.message.sequence.invoice.businessId !== business.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.$transaction(async (tx) => {
    await tx.reply.update({ where: { id }, data: { handled: true, resolution } });

    const sequenceId = reply.message.sequenceId;

    if (resolution === "MARK_RESOLVED") {
      await tx.invoice.update({
        where: { id: reply.message.sequence.invoiceId },
        data: { status: "RESOLVED", paidAt: new Date() },
      });
      await tx.sequence.update({ where: { id: sequenceId }, data: { status: "COMPLETED", completedAt: new Date() } });
    } else if (resolution === "RESUME_SEQUENCE") {
      await tx.sequence.update({ where: { id: sequenceId }, data: { status: "ACTIVE", pausedAt: null, resumeAt: null } });
    }
    // HANDLE_MANUALLY — just marks reply as handled, no sequence change
  });

  return NextResponse.json({ ok: true });
}
