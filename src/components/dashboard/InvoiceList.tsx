"use client";

import { useState } from "react";
import Link from "next/link";
import type { InvoiceStatus } from "@/generated/prisma/client";
import { formatCurrency, formatDate, daysOverdue } from "@/lib/currency";

type Invoice = {
  id: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  dueDate: Date | string;
  client: { name: string; email: string | null; whatsapp: string | null };
  sequence: {
    status: string;
    tone: string;
    messages: { status: string; scheduledAt: Date | string }[];
  } | null;
};

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  OUTSTANDING: { label: "Outstanding", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  OVERDUE:     { label: "Overdue",     className: "bg-red-50 text-red-700 border-red-200"         },
  RESOLVED:    { label: "Resolved",    className: "bg-green-50 text-green-700 border-green-200"   },
};

const FILTERS = [
  { label: "All",         value: null            },
  { label: "Outstanding", value: "OUTSTANDING"   },
  { label: "Overdue",     value: "OVERDUE"       },
  { label: "Paid",        value: "RESOLVED"      },
] as const;

export default function InvoiceList({
  invoices,
  businessName,
}: {
  invoices: Invoice[];
  businessName: string;
}) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = invoices.filter((i) => {
    if (activeFilter && i.status !== activeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const amount = formatCurrency(Number(i.amount), i.currency).toLowerCase();
      return (
        i.client.name.toLowerCase().includes(q) ||
        (i.client.email ?? "").toLowerCase().includes(q) ||
        (i.client.whatsapp ?? "").toLowerCase().includes(q) ||
        amount.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          {FILTERS.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setActiveFilter(value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilter === value
                  ? "bg-teal-800 text-white"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, amount…"
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 w-52"
            />
          </div>
          <p className="text-xs text-gray-400 flex-shrink-0">
            {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filtered.length === 0 && (
          <p className="px-5 py-8 text-sm text-center text-gray-400">
            No {activeFilter?.toLowerCase()} invoices.
          </p>
        )}
        {filtered.map((invoice) => {
          const cfg = STATUS_CONFIG[invoice.status];
          const overdueDays = daysOverdue(invoice.dueDate);
          const nextMessage = invoice.sequence?.messages.find((m) => m.status === "SCHEDULED");
          const initials = invoice.client.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

          return (
            <Link
              key={invoice.id}
              href={`/invoices/${invoice.id}`}
              className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-gray-900 text-sm truncate">{invoice.client.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex-shrink-0 ${cfg.className}`}>
                    {cfg.label}
                  </span>
                  {invoice.sequence?.status === "PAUSED" && (
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-50 text-gray-400 border-gray-200 font-medium flex-shrink-0">
                      Paused
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Due {formatDate(invoice.dueDate)}
                  {overdueDays > 0 && invoice.status !== "RESOLVED" && (
                    <span className="text-red-400 ml-1">· {overdueDays}d overdue</span>
                  )}
                  {nextMessage && (
                    <span className="text-teal-600 ml-1">· Next nudge {formatDate(nextMessage.scheduledAt)}</span>
                  )}
                  {invoice.sequence?.status === "ACTIVE" && !nextMessage && (
                    <span className="text-gray-300 ml-1">· All sent</span>
                  )}
                </p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900">
                  {formatCurrency(Number(invoice.amount), invoice.currency)}
                </p>
                <p className="text-xs text-gray-400 capitalize mt-0.5">
                  {invoice.sequence?.tone.toLowerCase() ?? "—"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
