import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { formatCurrency, daysOverdue, formatDate } from "@/lib/currency";
import type { InvoiceStatus } from "@/generated/prisma/client";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import EmptyState from "@/components/dashboard/EmptyState";
import InvoiceList from "@/components/dashboard/InvoiceList";

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

  const statsSource = invoices;
  const outstanding = statsSource.filter((i) => i.status === "OUTSTANDING");
  const overdue = statsSource.filter((i) => i.status === "OVERDUE");
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const resolvedThisMonth = statsSource.filter(
    (i) => i.status === "RESOLVED" && i.paidAt && i.paidAt >= startOfMonth
  );
  const totalRecoveredThisMonth = resolvedThisMonth.reduce(
    (sum, i) => sum + Number(i.amount),
    0
  );

  const totalPending = [...outstanding, ...overdue].reduce(
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Outstanding" value={outstanding.length.toString()} sub="invoices" icon="clock" color="yellow" />
        <StatCard label="Overdue" value={overdue.length.toString()} sub="need attention" icon="alert" color="red" />
        <StatCard
          label="Pending to recover"
          value={formatCurrency(totalPending, business.currency)}
          sub="outstanding + overdue"
          icon="pending"
          color="orange"
        />
        <StatCard label="Resolved this month" value={resolvedThisMonth.length.toString()} sub="invoices paid" icon="check" color="green" />
        <StatCard
          label="Recovered this month"
          value={formatCurrency(totalRecoveredThisMonth, business.currency)}
          sub="total collected"
          icon="money"
          color="teal"
        />
      </div>

      {/* Oldest unresolved alert */}
      {oldestUnresolved && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3.5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="text-sm text-amber-900">
              <strong>{oldestUnresolved.client.name}</strong> is{" "}
              <strong>{daysOverdue(oldestUnresolved.dueDate)} days overdue</strong> —{" "}
              {formatCurrency(Number(oldestUnresolved.amount), oldestUnresolved.currency)}
            </span>
          </div>
          <Link href={`/invoices/${oldestUnresolved.id}`} className="text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors whitespace-nowrap ml-4">
            View →
          </Link>
        </div>
      )}

      {/* Invoice list */}
      {invoices.length === 0 ? (
        <EmptyState businessName={business.name} />
      ) : (
        <InvoiceList invoices={invoices} businessName={business.name} />
      )}
    </div>
  );
}

const STAT_ICONS = {
  clock: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  alert: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  money: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pending: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
};

function StatCard({
  label,
  value,
  sub,
  icon,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  icon: keyof typeof STAT_ICONS;
  color: "yellow" | "red" | "green" | "teal" | "orange";
}) {
  const cfg = {
    yellow: { card: "bg-white border-gray-200", icon: "bg-yellow-50 text-yellow-500" },
    red:    { card: "bg-white border-gray-200", icon: "bg-red-50 text-red-500"       },
    green:  { card: "bg-white border-gray-200", icon: "bg-green-50 text-green-600"   },
    teal:   { card: "bg-white border-gray-200", icon: "bg-teal-50 text-teal-700"     },
    orange: { card: "bg-white border-gray-200", icon: "bg-orange-50 text-orange-500" },
  }[color];

  return (
    <div className={`rounded-2xl border px-5 py-4 ${cfg.card}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${cfg.icon}`}>
        {STAT_ICONS[icon]}
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-1.5">{label}</p>
    </div>
  );
}
