import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { formatCurrency, daysOverdue, formatDate } from "@/lib/currency";
import type { InvoiceStatus } from "@/generated/prisma/client";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import EmptyState from "@/components/dashboard/EmptyState";

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  OUTSTANDING: { label: "Outstanding", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  OVERDUE:     { label: "Overdue",     className: "bg-red-50 text-red-700 border-red-200" },
  RESOLVED:    { label: "Resolved",    className: "bg-green-50 text-green-700 border-green-200" },
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) redirect("/onboard");

  const invoices = await db.invoice.findMany({
    where: { businessId: business.id },
    include: {
      client: true,
      sequence: { include: { messages: { orderBy: { scheduledAt: "asc" } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Stats
  const outstanding = invoices.filter((i) => i.status === "OUTSTANDING");
  const overdue = invoices.filter((i) => i.status === "OVERDUE");
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const resolvedThisMonth = invoices.filter(
    (i) => i.status === "RESOLVED" && i.paidAt && i.paidAt >= startOfMonth
  );
  const totalRecoveredThisMonth = resolvedThisMonth.reduce(
    (sum, i) => sum + Number(i.amount),
    0
  );

  const oldestUnresolved = [...outstanding, ...overdue].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )[0];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Welcome banner — shown once after onboarding */}
      <Suspense>
        <WelcomeBanner businessName={business.name} />
      </Suspense>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {business.name}
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-900 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Outstanding" value={outstanding.length.toString()} sub="invoices" color="yellow" />
        <StatCard label="Overdue" value={overdue.length.toString()} sub="need attention" color="red" />
        <StatCard label="Resolved this month" value={resolvedThisMonth.length.toString()} sub="invoices paid" color="green" />
        <StatCard
          label="Recovered this month"
          value={formatCurrency(totalRecoveredThisMonth, business.currency)}
          sub="total collected"
          color="blue"
        />
      </div>

      {/* Oldest unresolved alert */}
      {oldestUnresolved && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-amber-800">
              Oldest unresolved: <strong>{oldestUnresolved.client.name}</strong> —{" "}
              {formatCurrency(Number(oldestUnresolved.amount), oldestUnresolved.currency)},{" "}
              {daysOverdue(oldestUnresolved.dueDate)} days overdue
            </span>
          </div>
          <Link href={`/invoices/${oldestUnresolved.id}`} className="text-xs text-amber-700 font-medium hover:underline">
            View →
          </Link>
        </div>
      )}

      {/* Invoice list */}
      <div className="space-y-3">
        {invoices.length === 0 && <EmptyState businessName={business.name} />}

        {invoices.map((invoice) => {
          const cfg = STATUS_CONFIG[invoice.status];
          const overdueDays = daysOverdue(invoice.dueDate);
          const nextMessage = invoice.sequence?.messages.find(
            (m) => m.status === "SCHEDULED"
          );

          return (
            <Link
              key={invoice.id}
              href={`/invoices/${invoice.id}`}
              className="block bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-teal-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 truncate">{invoice.client.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.className}`}>
                      {cfg.label}
                    </span>
                    {invoice.sequence?.status === "PAUSED" && (
                      <span className="text-xs px-2 py-0.5 rounded-full border bg-cream text-gray-500 border-gray-200 font-medium">
                        Paused
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Due {formatDate(invoice.dueDate)}
                    {overdueDays > 0 && invoice.status !== "RESOLVED" && (
                      <span className="text-red-500 ml-1">· {overdueDays} days overdue</span>
                    )}
                  </p>
                  {nextMessage && (
                    <p className="text-xs text-teal-800 mt-1">
                      Next: {nextMessage.step === 1 ? "Day 1" : nextMessage.step === 2 ? "Day 7" : "Day 14"} reminder on{" "}
                      {formatDate(nextMessage.scheduledAt)}
                    </p>
                  )}
                  {invoice.sequence?.status === "ACTIVE" && !nextMessage && (
                    <p className="text-xs text-gray-400 mt-1">All reminders sent</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900 text-lg">
                    {formatCurrency(Number(invoice.amount), invoice.currency)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 capitalize">
                    {invoice.sequence ? invoice.sequence.tone.toLowerCase() : "No sequence"}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: "yellow" | "red" | "green" | "blue";
}) {
  const colors = {
    yellow: "bg-yellow-50 border-yellow-100",
    red: "bg-red-50 border-red-100",
    green: "bg-green-50 border-green-100",
    blue: "bg-teal-50 border-teal-100",
  };
  return (
    <div className={`rounded-xl border px-4 py-4 ${colors[color]}`}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
