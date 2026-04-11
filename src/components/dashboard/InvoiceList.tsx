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
  client: { name: string };
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

  const filtered = activeFilter
    ? invoices.filter((i) => i.status === activeFilter)
    : invoices;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between gap-3">
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
        <p className="text-xs text-gray-400 flex-shrink-0">
          {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
        </p>
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
