"use client";

import { useState } from "react";
import type { BusinessData } from "./SettingsClient";

const CURRENCIES = [
  { code: "GBP", label: "GBP — British Pound (£)" },
  { code: "USD", label: "USD — US Dollar ($)" },
  { code: "EUR", label: "EUR — Euro (€)" },
  { code: "AED", label: "AED — UAE Dirham (د.إ)" },
  { code: "INR", label: "INR — Indian Rupee (₹)" },
  { code: "AUD", label: "AUD — Australian Dollar (A$)" },
  { code: "CAD", label: "CAD — Canadian Dollar (C$)" },
];

export default function BusinessSettings({
  business,
  onSaved,
}: {
  business: BusinessData;
  onSaved: (b: BusinessData) => void;
}) {
  const [name, setName] = useState(business.name);
  const [currency, setCurrency] = useState(business.currency);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const isDirty = name !== business.name || currency !== business.currency;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");

    const res = await fetch("/api/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), currency }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save.");
      return;
    }

    onSaved({ ...business, name: data.name, currency: data.currency });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-1">Business profile</h2>
      <p className="text-sm text-gray-500 mb-6">
        Your business name appears on all reminders sent to clients.
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => { setName(e.target.value); setSaved(false); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Meridian Studio"
          />
          <p className="text-xs text-gray-400 mt-1">
            This is how your clients will see you — e.g. &ldquo;From: Meridian Studio&rdquo;.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            value={currency}
            onChange={(e) => { setCurrency(e.target.value); setSaved(false); }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Used as the default for new invoices.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            {saving ? "Saving…" : "Save changes"}
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
  );
}
