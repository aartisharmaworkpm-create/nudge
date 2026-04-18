"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { PLANS } from "@/lib/plans";
import type { ResolvedPlan } from "@/lib/razorpay-plans";
import { convertFromINR, type ExchangeRates } from "@/lib/exchange-rates";
import PayPalButton from "@/components/billing/PayPalButton";

const PLAN_HIGHLIGHTS: Record<string, { features: string[]; notIncluded?: string[] }> = {
  STARTER: {
    features: [
      "Up to 40 invoices/month",
      "Email chasing",
      "1 preset sequence (Day 1 → 7 → 14 → 21)",
      "Basic dashboard",
      "Internal notes",
    ],
    notIncluded: ["WhatsApp chasing"],
  },
  GROWTH: {
    features: [
      "Up to 150 invoices/month",
      "Email + WhatsApp chasing",
      "3 custom sequences",
      "Full dashboard",
      "Client reply handling",
      "Pause & resume sequences",
    ],
  },
  PRO: {
    features: [
      "Up to 400 invoices/month",
      "Email + WhatsApp chasing",
      "Unlimited sequences",
      "Full dashboard + analytics",
      "Priority support",
      "All future features",
    ],
  },
};

export default function PricingCards({
  plans,
  isLoggedIn,
  userCurrency = "INR",
  rates = {},
  paypalClientId = "",
}: {
  plans: ResolvedPlan[];
  isLoggedIn: boolean;
  userCurrency?: string;
  rates?: ExchangeRates;
  paypalClientId?: string;
}) {
  const router = useRouter();
  const { showToast, toastNode } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const usePayPal = userCurrency !== "INR";

  // ── Razorpay (logged-in INR users) ──────────────────────────────────────────
  async function handleRazorpayPlan(planId: string, planLabel: string, priceINR: number) {
    setLoading(planId);
    const res = await fetch("/api/billing/razorpay/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error ?? "Failed to start checkout.", "error"); setLoading(null); return; }

    const rzp = new (window as unknown as { Razorpay: new (opts: unknown) => { open: () => void } }).Razorpay({
      key: data.keyId,
      subscription_id: data.subscriptionId,
      name: "Nudge",
      description: `${planLabel} plan — ₹${priceINR.toLocaleString("en-IN")}/mo`,
      prefill: { name: data.businessName, email: data.email },
      theme: { color: "#0f5244" },
      handler: async (response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => {
        const verifyRes = await fetch("/api/billing/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...response, planId }),
        });
        if (verifyRes.ok) {
          showToast(`🎉 ${planLabel} plan activated! Taking you to your dashboard…`);
          setTimeout(() => router.push("/billing?success=1"), 2000);
        } else {
          showToast("Payment verification failed. Please contact support.", "error");
        }
      },
      modal: { ondismiss: () => setLoading(null) },
    });
    rzp.open();
    setLoading(null);
  }

  // ── PayPal (logged-in international users) ──────────────────────────────────
  async function handlePayPalSuccess(subscriptionId: string, planId: string, planLabel: string) {
    const res = await fetch("/api/billing/paypal/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId, planId }),
    });
    if (res.ok) {
      showToast(`🎉 ${planLabel} plan activated! Taking you to your dashboard…`);
      setTimeout(() => router.push("/billing?success=1"), 2000);
    } else {
      showToast("Payment verification failed. Please contact support.", "error");
    }
  }

  // ── Guest flow ──────────────────────────────────────────────────────────────
  function handleGuestPlan(planId: string) {
    router.push(`/signup?plan=${planId}`);
  }

  return (
    <>
      {!usePayPal && isLoggedIn && <script src="https://checkout.razorpay.com/v1/checkout.js" async />}
      {toastNode}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto px-6">
        {plans.map((plan) => {
          const highlights  = PLAN_HIGHLIGHTS[plan.id];
          const planConfig  = PLANS[plan.id as keyof typeof PLANS];
          const isPopular   = plan.id === "GROWTH";
          const isLoading   = loading === plan.id;

          // Price display: primary = user's preferred currency
          // priceUSD comes from ResolvedPlan (live from PayPal API, falls back to plans.ts)
          const primaryPrice  = usePayPal
            ? `$${plan.priceUSD}`
            : `₹${plan.priceINR.toLocaleString("en-IN")}`;
          const secondaryPrice = usePayPal
            ? convertFromINR(plan.priceINR, userCurrency, rates) ?? null
            : `$${plan.priceUSD}`;

          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl border p-6 flex flex-col ${
                isPopular
                  ? "border-teal-400 ring-2 ring-teal-400 shadow-lg shadow-teal-100"
                  : "border-gray-200"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-teal-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <h3 className="text-base font-bold text-gray-900 mb-3">{plan.label}</h3>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-black text-gray-900">{primaryPrice}</span>
                  <span className="text-gray-400 text-sm mb-1">/mo</span>
                </div>
                {secondaryPrice && userCurrency !== "USD" && (
                  <p className="text-xs text-gray-400 mb-1">≈ {secondaryPrice}/mo</p>
                )}
                {/* Payment method badge */}
                <div className="mt-2">
                  {usePayPal ? (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/></svg>
                      PayPal
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full">
                      ⚡ Razorpay · UPI / Cards
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-2 flex-1 mb-6">
                {highlights.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
                {highlights.notIncluded?.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isLoggedIn && usePayPal ? (
                <PayPalButton
                  planId={plan.id}
                  paypalPlanId={plan.paypalPlanId}
                  planLabel={plan.label}
                  priceUSD={plan.priceUSD}
                  clientIdOverride={paypalClientId}
                  onSuccess={(subId) => handlePayPalSuccess(subId, plan.id, plan.label)}
                  onError={(msg) => showToast(msg, "error")}
                />
              ) : isLoggedIn ? (
                <button
                  onClick={() => handleRazorpayPlan(plan.id, plan.label, plan.priceINR)}
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 cursor-pointer ${
                    isPopular ? "bg-teal-800 text-white hover:bg-teal-900" : "border-2 border-teal-800 text-teal-800 hover:bg-teal-50"
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Loading…
                    </span>
                  ) : "Subscribe now"}
                </button>
              ) : (
                <button
                  onClick={() => handleGuestPlan(plan.id)}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                    isPopular ? "bg-teal-800 text-white hover:bg-teal-900" : "border-2 border-teal-800 text-teal-800 hover:bg-teal-50"
                  }`}
                >
                  Get started
                </button>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
