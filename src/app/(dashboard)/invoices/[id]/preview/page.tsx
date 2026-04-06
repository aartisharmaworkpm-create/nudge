import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { interpolateTemplate } from "@/lib/sequence";
import { formatCurrency, formatDate } from "@/lib/currency";
import SequencePreviewClient from "@/components/sequences/SequencePreviewClient";

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) redirect("/onboard");

  const invoice = await db.invoice.findUnique({
    where: { id, businessId: business.id },
    include: {
      client: true,
      sequence: { include: { messages: { orderBy: { step: "asc" } } } },
    },
  });

  if (!invoice || !invoice.sequence) notFound();

  const { sequence, client } = invoice;

  // Interpolate all message bodies
  const steps = sequence.messages.map((msg) => ({
    ...msg,
    body: interpolateTemplate(msg.body, {
      clientName: client.name,
      businessName: business.name,
      amount: formatCurrency(Number(invoice.amount), invoice.currency),
      currency: invoice.currency,
      dueDate: formatDate(invoice.dueDate),
      paymentLink: invoice.paymentLink,
      ownerName: business.name,
    }),
  }));

  return (
    <SequencePreviewClient
      invoiceId={invoice.id}
      clientName={client.name}
      amount={formatCurrency(Number(invoice.amount), invoice.currency)}
      sequenceId={sequence.id}
      tone={sequence.tone}
      steps={steps}
      sequenceStatus={sequence.status}
    />
  );
}
