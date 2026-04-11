export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business" }, { status: 404 });

  const invoice = await db.invoice.findUnique({
    where: { id, businessId: business.id },
    include: { sequence: true, client: true },
  });

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();

  await db.$transaction(async (tx) => {
    // Mark invoice resolved
    await tx.invoice.update({
      where: { id },
      data: { status: "RESOLVED", paidAt: now },
    });

    // Stop sequence
    if (invoice.sequence) {
      await tx.sequence.update({
        where: { id: invoice.sequence.id },
        data: { status: "COMPLETED", completedAt: now },
      });

      // Cancel all remaining scheduled messages
      await tx.message.updateMany({
        where: { sequenceId: invoice.sequence.id, status: "SCHEDULED" },
        data: { status: "FAILED" }, // mark as not-sent rather than delete
      });
    }

    // Update client avg days to pay
    const resolvedInvoices = await tx.invoice.findMany({
      where: { clientId: invoice.clientId, status: "RESOLVED", paidAt: { not: null } },
    });

    if (resolvedInvoices.length > 0) {
      const avgDays = Math.round(
        resolvedInvoices.reduce((sum, inv) => {
          const days = Math.max(0, Math.floor(
            (inv.paidAt!.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24)
          ));
          return sum + days;
        }, 0) / resolvedInvoices.length
      );
      await tx.client.update({ where: { id: invoice.clientId }, data: { avgDaysToPay: avgDays } });
    }
  });

  return NextResponse.json({ ok: true, amount: invoice.amount.toString(), currency: invoice.currency });
}
