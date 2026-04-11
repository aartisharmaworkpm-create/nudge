"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Client, Message, Reply, Sequence, InvoiceStatus, MessageStatus, ReplyAction } from "@/generated/prisma/client";
import { formatDate } from "@/lib/currency";

type InvoiceData = {
  id: string;
  status: InvoiceStatus;
  amount: number;
  formattedAmount: string;
  currency: string;
  formattedDueDate: string;
  daysOverdue: number;
  paymentLink: string;
  notes: string | null;
  client: Client;
  sequence: (Sequence & {
    messages: (Message & { reply: Reply | null })[];
  }) | null;
};

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  OUTSTANDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  OVERDUE:     "bg-red-50 text-red-700 border-red-200",
  RESOLVED:    "bg-green-50 text-green-700 border-green-200",
};

const MSG_STATUS_COLORS: Record<MessageStatus, string> = {
  SCHEDULED: "text-gray-400",
  SENT:      "text-teal-600",
  DELIVERED: "text-green-500",
  FAILED:    "text-red-500",
};

const MSG_STATUS_LABELS: Record<MessageStatus, string> = {
  SCHEDULED: "Scheduled",
  SENT:      "Sent",
  DELIVERED: "Delivered",
  FAILED:    "Failed",
};

const STEP_LABELS: Record<number, string> = {
  1: "Day 1 — First reminder",
  2: "Day 7 — Follow-up",
  3: "Day 14 — Final notice",
  4: "Day 21 — Extended follow-up",
};

export default function InvoiceDetailClient({
  invoice,
  businessName,
}: {
  invoice: InvoiceData;
  businessName: string;
}) {
  const router = useRouter();
  const { sequence } = invoice;

  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pauseDuration, setPauseDuration] = useState<"3" | "7" | "custom" | "manual">("7");
  const [pauseReason, setPauseReason] = useState("");
  const [pauseDate, setPauseDate] = useState("");
  const [pauseLoading, setPauseLoading] = useState(false);
  const [markPaidLoading, setMarkPaidLoading] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  const [notes, setNotes] = useState(invoice.notes ?? "");
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  async function handleMarkPaid() {
    setMarkPaidLoading(true);
    const res = await fetch(`/api/invoices/${invoice.id}/paid`, { method: "POST" });
    if (res.ok) {
      setCelebrating(true);
      setTimeout(() => router.refresh(), 1500);
    }
    setMarkPaidLoading(false);
  }

  async function handleSaveNotes() {
    setNotesLoading(true);
    await fetch(`/api/invoices/${invoice.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setNotesLoading(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }

  async function handlePause() {
    setPauseLoading(true);
    let resumeAt: string | null = null;
    if (pauseDuration === "3") resumeAt = new Date(Date.now() + 3 * 86400000).toISOString();
    else if (pauseDuration === "7") resumeAt = new Date(Date.now() + 7 * 86400000).toISOString();
    else if (pauseDuration === "custom" && pauseDate) resumeAt = new Date(pauseDate).toISOString();

    const res = await fetch(`/api/invoices/${invoice.id}/pause`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeAt, pauseReason }),
    });

    if (res.ok) {
      setShowPauseModal(false);
      router.refresh();
    }
    setPauseLoading(false);
  }

  async function handleDelete() {
    setDeleteLoading(true);
    const res = await fetch(`/api/invoices/${invoice.id}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard");
    else setDeleteLoading(false);
  }

  async function handleResume() {
    await fetch(`/api/invoices/${invoice.id}/resume`, { method: "POST" });
    router.refresh();
  }

  async function handleReplyAction(replyId: string, action: ReplyAction) {
    await fetch(`/api/replies/${replyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution: action }),
    });
    router.refresh();
  }

  const activeReply = sequence?.messages.find((m) => m.reply && !m.reply.handled)?.reply ?? null;
  const activeReplyMessage = activeReply
    ? sequence?.messages.find((m) => m.reply?.id === activeReply.id)
    : null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Celebration */}
      {celebrating && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white rounded-2xl px-8 py-8 shadow-xl text-center max-w-sm mx-4">
            <p className="text-4xl mb-3">🎉</p>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Invoice paid!</h2>
            <p className="text-gray-500 text-sm">Well done — {invoice.formattedAmount} recovered.</p>
          </div>
        </div>
      )}

      {/* Back */}
      <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-5">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Dashboard
      </Link>

      {/* Client reply alert */}
      {activeReply && activeReplyMessage && (
        <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-4 mb-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-800 mb-1">
                {invoice.client.name} replied — sequence paused
              </p>
              <p className="text-sm text-teal-900 bg-white/60 rounded-lg px-3 py-2 mb-3">
                &ldquo;{activeReply.body}&rdquo;
              </p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleReplyAction(activeReply.id, "MARK_RESOLVED")} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">Mark resolved</button>
                <button onClick={() => handleReplyAction(activeReply.id, "RESUME_SEQUENCE")} className="text-xs bg-teal-800 text-white px-3 py-1.5 rounded-lg hover:bg-teal-900">Resume sequence</button>
                <button onClick={() => handleReplyAction(activeReply.id, "HANDLE_MANUALLY")} className="text-xs bg-white border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50">Handle manually</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* LEFT — invoice info + actions + notes */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Invoice header card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 truncate">{invoice.client.name}</h1>
                <p className="text-gray-400 text-xs mt-0.5 truncate">{invoice.client.email ?? invoice.client.whatsapp}</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0 ml-3 ${STATUS_COLORS[invoice.status]}`}>
                {invoice.status.charAt(0) + invoice.status.slice(1).toLowerCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-gray-100 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Amount</p>
                <p className="text-xl font-bold text-gray-900">{invoice.formattedAmount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Due date</p>
                <p className="text-sm font-medium text-gray-700">{invoice.formattedDueDate}</p>
                {invoice.daysOverdue > 0 && invoice.status !== "RESOLVED" && (
                  <p className="text-xs text-red-500">{invoice.daysOverdue} days overdue</p>
                )}
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Payment link</p>
                <a href={invoice.paymentLink} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-800 hover:underline truncate block">
                  {invoice.paymentLink.replace(/^https?:\/\//, "").slice(0, 40)}{invoice.paymentLink.length > 46 ? "…" : ""} →
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {invoice.status !== "RESOLVED" && (
                <button
                  onClick={handleMarkPaid}
                  disabled={markPaidLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {markPaidLoading ? "Marking…" : "Mark as paid"}
                </button>
              )}
              {sequence?.status === "ACTIVE" && (
                <button
                  onClick={() => setShowPauseModal(true)}
                  className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Pause
                </button>
              )}
              {sequence?.status === "PAUSED" && (
                <button
                  onClick={handleResume}
                  className="border border-teal-200 text-teal-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors"
                >
                  Resume
                </button>
              )}
              {sequence && (
                <Link
                  href={`/invoices/${invoice.id}/preview`}
                  className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Preview
                </Link>
              )}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="ml-auto border border-red-200 text-red-500 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>

          {/* Notes card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex-1">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Internal notes</h2>
            <textarea
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }}
              rows={5}
              placeholder="e.g. Client called on 10 Apr, promised payment by end of month…"
              className="w-full text-sm text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-teal-600 placeholder-gray-300"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-300">Not sent to client</p>
              <button
                onClick={handleSaveNotes}
                disabled={notesLoading}
                className="text-xs bg-teal-800 text-white px-3 py-1.5 rounded-lg hover:bg-teal-900 disabled:opacity-50 transition-colors"
              >
                {notesSaved ? "Saved ✓" : notesLoading ? "Saving…" : "Save notes"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — sequence timeline */}
        <div className="lg:col-span-3">
          {sequence ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">Reminder sequence</h2>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  sequence.status === "ACTIVE"    ? "bg-teal-50 text-teal-900" :
                  sequence.status === "PAUSED"    ? "bg-gray-100 text-gray-500" :
                  sequence.status === "COMPLETED" ? "bg-green-50 text-green-700" :
                  "bg-gray-50 text-gray-400"
                }`}>
                  {sequence.status.charAt(0) + sequence.status.slice(1).toLowerCase()}
                </span>
              </div>

              {sequence.status === "PAUSED" && sequence.resumeAt && (
                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4">
                  Paused until {formatDate(sequence.resumeAt)}.
                  {sequence.pauseReason && ` Reason: ${sequence.pauseReason}`}
                </p>
              )}

              <div className="space-y-1">
                {sequence.messages.map((msg, idx) => (
                  <div key={msg.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full border-2 mt-1 flex-shrink-0 ${
                        msg.status === "DELIVERED" ? "bg-green-500 border-green-500" :
                        msg.status === "SENT"      ? "bg-teal-600 border-teal-600" :
                        msg.status === "FAILED"    ? "bg-red-500 border-red-500" :
                        "bg-white border-gray-300"
                      }`} />
                      {idx < sequence.messages.length - 1 && (
                        <div className="w-px flex-1 bg-gray-100 mt-1 mb-1" style={{ minHeight: 20 }} />
                      )}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-700">{STEP_LABELS[msg.step] ?? `Step ${msg.step}`}</p>
                        <span className={`text-xs font-medium flex-shrink-0 ${MSG_STATUS_COLORS[msg.status]}`}>
                          {MSG_STATUS_LABELS[msg.status]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {msg.status === "DELIVERED" && msg.deliveredAt
                          ? `Delivered ${formatDate(msg.deliveredAt)}`
                          : msg.status === "SENT" && msg.sentAt
                          ? `Sent ${formatDate(msg.sentAt)}`
                          : `Scheduled ${formatDate(msg.scheduledAt)}`}
                        {" · "}{msg.channel === "BOTH" ? "Email + WhatsApp" : msg.channel === "EMAIL" ? "Email" : "WhatsApp"}
                      </p>
                      {msg.reply && (
                        <div className="mt-1.5 bg-teal-50 rounded-lg px-3 py-1.5">
                          <p className="text-xs text-teal-900">
                            <strong>Reply:</strong> &ldquo;{msg.reply.body.slice(0, 80)}{msg.reply.body.length > 80 ? "…" : ""}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center justify-center h-32">
              <p className="text-sm text-gray-400">No reminder sequence</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Delete invoice</h3>
            <p className="text-sm text-gray-500 mb-6">
              This will permanently delete the invoice for <strong>{invoice.client.name}</strong> ({invoice.formattedAmount}) and all its reminders. This cannot be undone.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleteLoading} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                {deleteLoading ? "Deleting…" : "Delete invoice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Pause reminders</h3>
            <p className="text-sm text-gray-500 mb-4">
              No messages will be sent to {invoice.client.name} while paused.
            </p>

            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-gray-600 mb-1">Pause for</p>
              {([["3", "3 days"], ["7", "7 days"], ["custom", "Custom date"], ["manual", "Until I resume manually"]] as const).map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="pause" value={val} checked={pauseDuration === val} onChange={() => setPauseDuration(val)} />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
              {pauseDuration === "custom" && (
                <input type="date" value={pauseDate} onChange={(e) => setPauseDate(e.target.value)} className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600" />
              )}
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-gray-600 mb-1">Reason (optional)</p>
              <select value={pauseReason} onChange={(e) => setPauseReason(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600">
                <option value="">Select a reason</option>
                <option value="In conversation with client">In conversation with client</option>
                <option value="Payment plan agreed">Payment plan agreed</option>
                <option value="Internal dispute to resolve">Internal dispute to resolve</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowPauseModal(false)} className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
              <button onClick={handlePause} disabled={pauseLoading} className="flex-1 bg-teal-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-teal-900 disabled:opacity-50">
                {pauseLoading ? "Pausing…" : "Pause reminders"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
