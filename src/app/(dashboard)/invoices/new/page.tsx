"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { daysOverdue } from "@/lib/currency";

type ToneSuggestion = { tone: "FRIENDLY" | "FIRM" | "FINAL"; reason: string; entryStep: number };
type Client = { id: string; name: string; email: string | null; whatsapp: string | null };

const TONE_LABELS = {
  FRIENDLY: { label: "Friendly", desc: "Warm, assumes positive intent", color: "bg-green-50 border-green-300 text-green-800" },
  FIRM:     { label: "Firm",     desc: "Clear and direct, no fluff",    color: "bg-amber-50 border-amber-300 text-amber-800" },
  FINAL:    { label: "Final",    desc: "Last attempt, includes out",    color: "bg-red-50 border-red-300 text-red-800" },
};

const STEP_LABELS: Record<number, string> = {
  1: "Day 1 — First reminder",
  2: "Day 7 — Follow-up",
  3: "Day 14 — Final notice",
};

export default function NewInvoicePage() {
  const router = useRouter();

  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [notes, setNotes] = useState("");
  const [tone, setTone] = useState<"FRIENDLY" | "FIRM" | "FINAL">("FRIENDLY");
  const [entryStep, setEntryStep] = useState(1);
  const [channel, setChannel] = useState<"EMAIL" | "WHATSAPP" | "BOTH">("BOTH");
  const [toneSuggestion, setToneSuggestion] = useState<ToneSuggestion | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [clientSuggestions, setClientSuggestions] = useState<Client[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const clientRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load clients for autocomplete
  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then(setClients).catch(() => {});
  }, []);

  // Client autocomplete
  useEffect(() => {
    if (!clientName.trim() || selectedClient) {
      setClientSuggestions([]);
      return;
    }
    const q = clientName.toLowerCase();
    setClientSuggestions(clients.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 5));
  }, [clientName, clients, selectedClient]);

  // Tone suggestion from due date
  useEffect(() => {
    if (!dueDate) return;
    const overdue = daysOverdue(dueDate);
    let suggestion: ToneSuggestion;
    if (overdue <= 3) {
      suggestion = { tone: "FRIENDLY", reason: "Invoice is recently due — a friendly opener is appropriate.", entryStep: 1 };
    } else if (overdue <= 14) {
      suggestion = { tone: "FIRM", reason: `${overdue} days overdue — your client has likely seen a friendly reminder already.`, entryStep: 2 };
    } else {
      suggestion = { tone: "FINAL", reason: `${overdue} days overdue — a firm final notice is appropriate.`, entryStep: 3 };
    }
    setToneSuggestion(suggestion);
    setTone(suggestion.tone);
    setEntryStep(suggestion.entryStep);
  }, [dueDate]);

  function selectClient(c: Client) {
    setSelectedClient(c);
    setClientName(c.name);
    setClientEmail(c.email ?? "");
    setClientWhatsapp(c.whatsapp ?? "");
    setShowSuggestions(false);
  }

  function clearClient() {
    setSelectedClient(null);
    setClientName("");
    setClientEmail("");
    setClientWhatsapp("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clientEmail && !clientWhatsapp) {
      setError("Add at least one contact — email or WhatsApp.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName,
        clientEmail: clientEmail || null,
        clientWhatsapp: clientWhatsapp || null,
        existingClientId: selectedClient?.id,
        amount: parseFloat(amount),
        dueDate,
        paymentLink,
        notes,
        tone,
        entryStep,
        channel,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push(`/invoices/${data.id}/preview`);
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add invoice</h1>
        <p className="text-gray-500 text-sm mt-1">5 fields. Nudge handles the rest.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client name with autocomplete */}
        <div ref={clientRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client name <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              value={clientName}
              onChange={(e) => { setClientName(e.target.value); setSelectedClient(null); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Meridian Studio"
            />
            {selectedClient && (
              <button type="button" onClick={clearClient} className="text-xs text-gray-400 hover:text-gray-600 px-2">
                Clear
              </button>
            )}
          </div>
          {showSuggestions && clientSuggestions.length > 0 && (
            <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
              {clientSuggestions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectClient(c)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-0"
                >
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{c.email ?? c.whatsapp}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Contact details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client email</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="sarah@client.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp number</label>
            <input
              type="tel"
              value={clientWhatsapp}
              onChange={(e) => setClientWhatsapp(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+44 7700 900000"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 -mt-4">Add at least one contact method.</p>

        {/* Amount + Due date */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Invoice amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="3200.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Payment link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            How should your client pay? <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            required
            value={paymentLink}
            onChange={(e) => setPaymentLink(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://pay.stripe.com/... or PayPal link"
          />
          <div className="flex gap-3 mt-2">
            <span className="text-xs text-gray-400">Examples:</span>
            {["Stripe", "PayPal", "GoCardless"].map((p) => (
              <span key={p} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{p}</span>
            ))}
          </div>
          {paymentLink && (
            <a
              href={paymentLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
            >
              Test this link
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>

        {/* Channel */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Send reminders via</label>
          <div className="flex gap-2">
            {(["BOTH", "EMAIL", "WHATSAPP"] as const).map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => setChannel(ch)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  channel === ch
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                }`}
              >
                {ch === "BOTH" ? "Email + WhatsApp" : ch === "EMAIL" ? "Email only" : "WhatsApp only"}
              </button>
            ))}
          </div>
        </div>

        {/* Tone suggestion */}
        {toneSuggestion && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-sm text-blue-800">
              <strong>Suggested tone:</strong> {toneSuggestion.tone.charAt(0) + toneSuggestion.tone.slice(1).toLowerCase()} —{" "}
              {toneSuggestion.reason}
            </p>
          </div>
        )}

        {/* Tone selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Starting tone</label>
          <div className="grid grid-cols-3 gap-2">
            {(["FRIENDLY", "FIRM", "FINAL"] as const).map((t) => {
              const cfg = TONE_LABELS[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    tone === t ? cfg.color + " border-current" : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="text-sm font-semibold">{cfg.label}</p>
                  <p className="text-xs mt-0.5 opacity-70">{cfg.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Entry step */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Start sequence at</label>
          <div className="space-y-2">
            {([1, 2, 3] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setEntryStep(s)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                  entryStep === s
                    ? "border-blue-500 bg-blue-50 text-blue-800"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <span className="font-medium">{STEP_LABELS[s]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes (internal, not sent)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="e.g. Client was chased in January, paid late"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Creating…" : "Preview sequence →"}
        </button>
      </form>
    </div>
  );
}
