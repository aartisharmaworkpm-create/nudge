import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { formatCurrency, formatDate, daysOverdue } from "@/lib/currency";
import InvoiceDetailClient from "@/components/invoices/InvoiceDetailClient";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) redirect("/onboard");

  const invoice = await db.invoice.findUnique({
    where: { id, businessId: business.id },
    include: {
      client: true,
      sequence: {
        include: {
          messages: {
            include: { reply: true },
            orderBy: { step: "asc" },
          },
        },
      },
    },
  });

  if (!invoice) notFound();

  return (
    <InvoiceDetailClient
      invoice={{
        ...invoice,
        amount: Number(invoice.amount),
        formattedAmount: formatCurrency(Number(invoice.amount), invoice.currency),
        formattedDueDate: formatDate(invoice.dueDate),
        daysOverdue: daysOverdue(invoice.dueDate),
        paymentType: invoice.paymentType ?? "LINK",
      }}
      businessName={business.name}
    />
  );
}
