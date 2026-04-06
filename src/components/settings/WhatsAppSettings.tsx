"use client";

import { useState } from "react";
import type { BusinessData } from "./SettingsClient";

export default function WhatsAppSettings({
  business,
  onSaved,
}: {
  business: BusinessData;
  onSaved: (b: BusinessData) => void;
}) {
  const [whatsappNumber, setWhatsappNumber] = useState(business.whatsappNumber ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const isDirty = whatsappNumber !== (business.whatsappNumber ?? "");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsappNumber: whatsappNumber.trim() || null }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save.");
      return;
    }

    onSaved({ ...business, whatsappNumber: data.whatsappNumber });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-4">
      {/* Status banner */}
      <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${
        business.whatsappVerified
          ? "bg-green-50 border-green-200"
          : "bg-amber-50 border-amber-200"
      }`}>
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${business.whatsappVerified ? "bg-green-500" : "bg-amber-400"}`} />
        <p className={`text-sm font-medium ${business.whatsappVerified ? "text-green-800" : "text-amber-800"}`}>
          {business.whatsappVerified
            ? "WhatsApp Business number verified and active"
            : "WhatsApp not yet connected — follow the setup steps below"}
        </p>
      </div>

      {/* Number */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">WhatsApp Business number</h2>
        <p className="text-sm text-gray-500 mb-5">
          This is the verified number reminders will be sent from. It must be registered
          with the WhatsApp Business API via Meta or a BSP.
        </p>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number (E.164 format)
            </label>
            <input
              type="tel"
              value={whatsappNumber}
              onChange={(e) => { setWhatsappNumber(e.target.value); setSaved(false); }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="+447700900000"
            />
            <p className="text-xs text-gray-400 mt-1">
              Include country code with + prefix, e.g. +447700900000
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-900 disabled:opacity-40 transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {saved && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Saved
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Setup guide */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">How to connect WhatsApp Business API</h3>

        <div className="space-y-4">
          <Step n={1} title="Apply for WhatsApp Business API access">
            <p>
              Go to <strong>Meta for Developers</strong> → Create an app → Add the WhatsApp product.
              Approval can take 2–4 weeks. Apply early.
            </p>
            <div className="mt-2 bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
              <p className="text-xs text-blue-800">
                <strong>Faster option:</strong> Use a BSP (Business Solution Provider) like{" "}
                <strong>360dialog</strong> or <strong>Twilio</strong> — they provide sandbox
                access immediately while your Meta application is pending.
              </p>
            </div>
          </Step>

          <Step n={2} title="Get your credentials from Meta">
            <p>Once approved, from your Meta app dashboard copy:</p>
            <ul className="mt-1 space-y-1">
              {[
                ["WHATSAPP_PHONE_NUMBER_ID", "Phone Number ID (numeric)"],
                ["WHATSAPP_API_KEY", "System user access token (permanent)"],
                ["WHATSAPP_APP_SECRET", "App secret (for webhook verification)"],
              ].map(([key, desc]) => (
                <li key={key} className="flex items-start gap-2">
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-mono flex-shrink-0">{key}</code>
                  <span className="text-xs text-gray-500">{desc}</span>
                </li>
              ))}
            </ul>
          </Step>

          <Step n={3} title="Configure the webhook in Meta">
            <p>In Meta Developer Portal → WhatsApp → Configuration → Webhooks:</p>
            <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 space-y-1">
              <div>
                <span className="text-xs text-gray-400">Callback URL</span>
                <code className="block text-xs text-gray-800 font-mono">https://yourdomain.com/api/webhooks/whatsapp</code>
              </div>
              <div>
                <span className="text-xs text-gray-400">Verify token</span>
                <code className="block text-xs text-gray-800 font-mono">value of WHATSAPP_WEBHOOK_VERIFY_TOKEN in .env</code>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Subscribe to: <code className="text-xs bg-gray-100 px-1 rounded">messages</code>
            </p>
          </Step>

          <Step n={4} title="Add env vars and restart">
            <p>
              Add all credentials to your <code className="text-xs bg-gray-100 px-1 rounded">.env</code> file and
              restart the server. WhatsApp reminders will activate automatically.
            </p>
          </Step>
        </div>
      </div>

      {/* Webhook endpoint info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Reply detection (auto-pause)</h3>
        <p className="text-sm text-gray-500 mb-3">
          When a client replies to a WhatsApp reminder, Nudge automatically pauses the sequence.
          This is handled by the webhook above — no extra setup needed once the webhook is configured.
        </p>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-green-800">
            Auto-pause on client reply is built in — enabled as soon as the webhook is active.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-50 text-teal-900 text-xs font-bold flex items-center justify-center mt-0.5">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 mb-1">{title}</p>
        <div className="text-sm text-gray-500 space-y-1">{children}</div>
      </div>
    </div>
  );
}
