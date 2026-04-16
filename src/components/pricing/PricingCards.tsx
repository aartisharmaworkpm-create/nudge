"use client";

import { useRouter } from "next/navigation";
import type { ResolvedPlan } from "@/lib/razorpay-plans";

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
}: {
  plans: ResolvedPlan[];
  isLoggedIn: boolean;
}) {
  const router = useRouter();

  function handlePlanClick(planId: string) {
    if (isLoggedIn) {
      // Logged-in: go straight to billing settings and trigger checkout
      router.push(`/settings?tab=billing&plan=${planId}`);
    } else {
      // Not logged in: go to signup with plan pre-selected
      router.push(`/signup?plan=${planId}`);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-5xl mx-auto px-6">
      {plans.map((plan) => {
        const highlights = PLAN_HIGHLIGHTS[plan.id];
        const isPopular = plan.id === "GROWTH";

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
                <span className="text-3xl font-black text-gray-900">
                  ₹{plan.priceINR.toLocaleString("en-IN")}
                </span>
                <span className="text-gray-400 text-sm mb-1">/mo</span>
              </div>
              <p className="text-xs text-gray-400">
                Overage: ₹{plan.overage}/invoice above limit
              </p>
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

            <button
              onClick={() => handlePlanClick(plan.id)}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
                isPopular
                  ? "bg-teal-800 text-white hover:bg-teal-900"
                  : "border-2 border-teal-800 text-teal-800 hover:bg-teal-50"
              }`}
            >
              {isLoggedIn ? "Subscribe now" : "Get started"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
