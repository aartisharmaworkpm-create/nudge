"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CURRENCIES = [
  { code: "GBP", label: "£ GBP — British Pound" },
  { code: "USD", label: "$ USD — US Dollar" },
  { code: "EUR", label: "€ EUR — Euro" },
  { code: "AED", label: "د.إ AED — UAE Dirham" },
  { code: "INR", label: "₹ INR — Indian Rupee" },
  { code: "AUD", label: "A$ AUD — Australian Dollar" },
  { code: "CAD", label: "C$ CAD — Canadian Dollar" },
];

export default function OnboardClient({ userName }: { userName: string }) {
  const router = useRouter();
  const firstName = userName.split(" ")[0] || "there";

  const [businessName, setBusinessName] = useState("");
  const [currency, setCurrency] = useState("GBP");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim()) return;

    setLoading(true);
    setError("");

    const res = await fetch("/api/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessName, currency }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    router.push("/dashboard?welcome=1");
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl font-bold text-teal-800 tracking-tight">Nudge</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Greeting */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {firstName} 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1.5 leading-relaxed">
              Two quick questions and you&apos;ll be set up. No card needed.
            </p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1.5 flex-1 rounded-full bg-teal-800" />
            <div className="h-1.5 flex-1 rounded-full bg-teal-800" />
            <span className="text-xs text-gray-400 ml-1">Almost there</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Business name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What&apos;s your business called?
              </label>
              <input
                type="text"
                required
                autoFocus
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                placeholder="e.g. Meridian Studio"
              />
              <p className="text-xs text-gray-400 mt-1">
                This is how your clients will see your name on every reminder.
              </p>
            </div>

            {/* Currency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Which currency do you invoice in?
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                You can change this later in Settings.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !businessName.trim()}
              className="w-full bg-teal-800 text-white rounded-lg py-3 text-sm font-semibold hover:bg-teal-900 disabled:opacity-40 transition-colors"
            >
              {loading ? "Setting up…" : "Go to dashboard →"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          You can update these details any time in Settings.
        </p>
      </div>
    </div>
  );
}
