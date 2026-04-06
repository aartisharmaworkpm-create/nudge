"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Channel, Tone, SequenceStatus } from "@/generated/prisma/client";

type Step = {
  id: string;
  step: number;
  channel: Channel;
  tone: Tone;
  body: string;
  scheduledAt: Date | string;
};

const STEP_LABELS: Record<number, string> = {
  1: "Day 1 — First reminder",
  2: "Day 7 — Follow-up",
  3: "Day 14 — Final notice",
};

const TONE_COLORS: Record<Tone, string> = {
  FRIENDLY: "bg-green-100 text-green-700",
  FIRM:     "bg-amber-100 text-amber-700",
  FINAL:    "bg-red-100 text-red-700",
};

export default function SequencePreviewClient({
  invoiceId,
  clientName,
  amount,
  sequenceId,
  tone,
  steps,
  sequenceStatus,
}: {
  invoiceId: string;
  clientName: string;
  amount: string;
  sequenceId: string;
  tone: Tone;
  steps: Step[];
  sequenceStatus: SequenceStatus;
}) {
  const router = useRouter();
  const [editedBodies, setEditedBodies] = useState<Record<string, string>>(
    Object.fromEntries(steps.map((s) => [s.id, s.body]))
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Record<string, "whatsapp" | "email">>(
    Object.fromEntries(steps.map((s) => [s.id, "whatsapp"]))
  );
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState("");

  const isAlreadyActive = sequenceStatus === "ACTIVE";

  async function handleActivate() {
    setActivating(true);
    setError("");

    // Save any edits first
    const edits = steps
      .filter((s) => editedBodies[s.id] !== s.body)
      .map((s) => ({ messageId: s.id, body: editedBodies[s.id] }));

    if (edits.length > 0) {
      await fetch(`/api/sequences/${sequenceId}/messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ edits }),
      });
    }

    const res = await fetch(`/api/invoices/${invoiceId}/activate`, { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to activate.");
      setActivating(false);
      return;
    }

    router.push(`/invoices/${invoiceId}`);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Preview sequence</h1>
        <p className="text-gray-500 text-sm mt-1 leading-relaxed">
          These messages will go out exactly as shown — {clientName}&apos;s name is already filled in.
          Edit any message, change the timing, or switch tone below.{" "}
          <strong className="text-gray-700">Nothing sends until you activate.</strong>
        </p>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6">
        <span className="text-sm font-medium text-gray-700">{clientName}</span>
        <span className="text-gray-300">·</span>
        <span className="text-sm text-gray-600">{amount}</span>
        <span className="text-gray-300">·</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TONE_COLORS[tone]}`}>
          {tone.charAt(0) + tone.slice(1).toLowerCase()} tone
        </span>
        <span className="ml-auto text-xs text-gray-400">{steps.length} message{steps.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-8">
        {steps.map((step) => {
          const isEditing = editingId === step.id;
          const tab = activeTab[step.id];
          const showBoth = step.channel === "BOTH";

          return (
            <div key={step.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {/* Step header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">{STEP_LABELS[step.step]}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TONE_COLORS[step.tone]}`}>
                    {step.tone.charAt(0) + step.tone.slice(1).toLowerCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(step.scheduledAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
              </div>

              {/* Channel tabs */}
              {showBoth && (
                <div className="flex border-b border-gray-100">
                  {(["whatsapp", "email"] as const).map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setActiveTab((p) => ({ ...p, [step.id]: ch }))}
                      className={`flex-1 py-2 text-xs font-medium transition-colors ${
                        tab === ch
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      {ch === "whatsapp" ? "WhatsApp" : "Email"}
                    </button>
                  ))}
                </div>
              )}

              {/* Message render */}
              <div className="p-4">
                {isEditing ? (
                  <div>
                    <textarea
                      value={editedBodies[step.id]}
                      onChange={(e) => setEditedBodies((p) => ({ ...p, [step.id]: e.target.value }))}
                      rows={6}
                      className="w-full border border-blue-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <button
                      onClick={() => setEditingId(null)}
                      className="mt-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    {(!showBoth || tab === "whatsapp") && (
                      <WhatsAppBubble body={editedBodies[step.id]} senderName={clientName} />
                    )}
                    {showBoth && tab === "email" && (
                      <EmailPreview body={editedBodies[step.id]} />
                    )}
                    {!showBoth && step.channel === "EMAIL" && (
                      <EmailPreview body={editedBodies[step.id]} />
                    )}
                    <button
                      onClick={() => setEditingId(step.id)}
                      className="mt-3 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit this message
                    </button>
                  </>
                )}
              </div>

              {/* Final notice warning */}
              {step.tone === "FINAL" && (
                <div className="px-4 pb-4">
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    This is your final notice — we&apos;ve kept it professional and left room for your client to respond.
                    You can add a personal note or edit the text above before it sends.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>
      )}

      {/* Activate button */}
      {!isAlreadyActive ? (
        <button
          onClick={handleActivate}
          disabled={activating}
          className="w-full bg-blue-600 text-white rounded-xl py-4 text-base font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
        >
          {activating ? "Activating…" : "Activate sequence"}
        </button>
      ) : (
        <div className="w-full bg-green-50 border border-green-200 rounded-xl py-4 text-center text-green-700 font-medium text-sm">
          Sequence is active
        </div>
      )}

      <p className="text-center text-xs text-gray-400 mt-3">
        Nothing sends until you tap &apos;Activate sequence&apos; above.
      </p>
    </div>
  );
}

function WhatsAppBubble({ body, senderName }: { body: string; senderName: string }) {
  return (
    <div className="bg-[#e7f8ee] rounded-2xl rounded-tl-none px-4 py-3 max-w-sm">
      <p className="text-xs font-semibold text-[#06c755] mb-1">{senderName}</p>
      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{body}</p>
      <p className="text-right text-[10px] text-gray-400 mt-1">10:42</p>
    </div>
  );
}

function EmailPreview({ body }: { body: string }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden text-sm">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <p className="text-xs text-gray-400">Subject: <span className="text-gray-700">Invoice reminder</span></p>
      </div>
      <div className="px-4 py-3 bg-white">
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{body}</p>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-[10px] text-gray-400">Sent via Nudge on behalf of your business.</p>
        </div>
      </div>
    </div>
  );
}
