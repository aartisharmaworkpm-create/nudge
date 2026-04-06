"use client";

import { useState } from "react";
import type { BusinessData } from "./SettingsClient";

export default function EmailSettings({
  business,
  onSaved,
}: {
  business: BusinessData;
  onSaved: (b: BusinessData) => void;
}) {
  const [emailDomain, setEmailDomain] = useState(business.emailDomain ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const isDirty = emailDomain !== (business.emailDomain ?? "");
  const fromAddress = emailDomain
    ? `reminders@${emailDomain}`
    : `reminders@nudge.so (default — branded to your business name)`;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailDomain: emailDomain.trim() || null }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save.");
      return;
    }

    onSaved({ ...business, emailDomain: data.emailDomain });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Email sending</h2>
        <p className="text-sm text-gray-500 mb-6">
          By default, reminders are sent from <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">reminders@nudge.so</code> with
          your business name as the display name. Add your own domain to send from your own address.
        </p>

        {/* Current from address preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
          <p className="text-xs text-gray-400 mb-0.5">Emails will appear as</p>
          <p className="text-sm font-medium text-gray-800">
            {business.name} &lt;{fromAddress}&gt;
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your sending domain <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">reminders@</span>
              <input
                type="text"
                value={emailDomain}
                onChange={(e) => { setEmailDomain(e.target.value); setSaved(false); }}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="yourdomain.com"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Leave blank to use the Nudge default. Add your domain to send from your own address.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
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

      {/* Domain verification instructions */}
      {emailDomain && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Domain verification (Resend)</h3>
          <p className="text-sm text-gray-500 mb-4">
            To send from <strong>{emailDomain}</strong>, you need to verify it in Resend and add DNS records.
          </p>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
              Go to your <strong>Resend dashboard</strong> → Domains → Add domain
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">2</span>
              Enter <strong>{emailDomain}</strong> and copy the DNS records Resend provides
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">3</span>
              Add the DNS records to your domain registrar (usually takes 5–30 minutes to verify)
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">4</span>
              Once verified, emails will send from <code className="text-xs bg-gray-100 px-1 rounded">reminders@{emailDomain}</code>
            </li>
          </ol>
        </div>
      )}

      {/* Webhook setup */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Delivery receipts (Resend webhook)</h3>
        <p className="text-sm text-gray-500 mb-3">
          To show &ldquo;Delivered&rdquo; status on your dashboard, configure a Resend webhook.
        </p>
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3">
          <p className="text-xs text-gray-400 mb-0.5">Webhook URL</p>
          <code className="text-sm text-gray-800 font-mono">
            https://yourdomain.com/api/webhooks/resend
          </code>
        </div>
        <p className="text-xs text-gray-400">
          In Resend → Webhooks → Add endpoint. Subscribe to:{" "}
          <code className="text-xs bg-gray-100 px-1 rounded">email.delivered</code>,{" "}
          <code className="text-xs bg-gray-100 px-1 rounded">email.bounced</code>.
          Copy the signing secret into <code className="text-xs bg-gray-100 px-1 rounded">RESEND_WEBHOOK_SECRET</code>.
        </p>
      </div>
    </div>
  );
}
