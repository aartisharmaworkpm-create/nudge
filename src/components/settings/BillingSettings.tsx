"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { PLANS, PAID_PLANS, isTrialActive, type PlanId } from "@/lib/plans";

type Props = {
  plan: PlanId;
  trialEndsAt: Date | string | null;
  subscriptionStatus: string | null;
  currentPeriodEnd: Date | string | null;
  invoicesThisMonth: number;
  currency: string; // business currency to decide Razorpay vs Stripe
};

const PLAN_HIGHLIGHTS: Record<string, string[]> = {
  STARTER: ["Up to 40 invoices/month", "Email chasing", "1 preset sequence", "Basic dashboard"],
  GROWTH:  ["Up to 150 invoices/month", "Email + WhatsApp chasing", "3 custom sequences", "Full dashboard"],
  PRO:     ["Up to 400 invoices/month", "Email + WhatsApp chasing", "Unlimited sequences", "Full dashboard + analytics", "Priority support"],
};

export default function BillingSettings({
  plan,
  trialEndsAt,
  subscriptionStatus,
  currentPeriodEnd,
  invoicesThisMonth,
  currency,
}: Props) {
  const { showToast, toastNode } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const useRazorpay = currency === "INR";

  const currentPlan = PLANS[plan] ?? PLANS.TRIAL;
  const trialActive = isTrialActive(trialEndsAt ? new Date(trialEndsAt) : null);
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0;

  async function handleStripePlan(planId: PlanId) {
    setLoading(planId);
    const res = await fetch("/api/billing/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const data = await res.json();
    if (!res.ok) { showToast(data.error ?? "Failed to start checkout.", "error"); setLoading(null); return; }
    window.location.href = data.url;
  }

  async function handleRazorpayPlan(planId: PlanId) {
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
      description: `${data.planLabel} plan`,
      prefill: { name: data.businessName, email: data.email },
      theme: { color: "#0f5244" },
      handler: async (response: { razorpay_payment_id: string; razorpay_subscription_id: string; razorpay_signature: string }) => {
        const verifyRes = await fetch("/api/billing/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...response, planId }),
        });
        if (verifyRes.ok) {
          showToast("Subscription activated!");
          setTimeout(() => window.location.reload(), 1200);
        } else {
          showToast("Payment verification failed.", "error");
        }
      },
    });
    rzp.open();
    setLoading(null);
  }

  async function handleManage() {
    setLoading("manage");
    if (useRazorpay) {
      showToast("Manage your subscription via Razorpay dashboard.", "error");
      setLoading(null);
      return;
    }
    const res = await fetch("/api/billing/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (!res.ok) { showToast(data.error ?? "Failed.", "error"); setLoading(null); return; }
    window.location.href = data.url;
  }

  return (
    <div className="space-y-4">
      {toastNode}

      {/* Current plan status */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Current plan</h2>

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold text-gray-900">{currentPlan.label}</span>
              {plan === "TRIAL" && trialActive && (
                <span className="text-xs bg-teal-50 text-teal-800 border border-teal-100 px-2 py-0.5 rounded-full">
                  {trialDaysLeft}d left
                </span>
              )}
              {subscriptionStatus === "past_due" && (
                <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full">
                  Payment overdue
                </span>
              )}
              {subscriptionStatus === "active" && (
                <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {invoicesThisMonth} / {currentPlan.invoicesPerMonth === Infinity ? "∞" : currentPlan.invoicesPerMonth} invoices this month
            </p>
            {currentPeriodEnd && plan !== "TRIAL" && (
              <p className="text-xs text-gray-400 mt-0.5">
                Renews {new Date(currentPeriodEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            )}
            {plan === "TRIAL" && !trialActive && (
              <p className="text-sm text-red-600 mt-1">Your trial has ended — choose a plan below to continue.</p>
            )}
          </div>

          {/* Usage bar */}
          <div className="flex-shrink-0 text-right">
            <div className="w-32">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-teal-600 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (invoicesThisMonth / (currentPlan.invoicesPerMonth || 1)) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 text-right">invoices used</p>
            </div>
          </div>
        </div>

        {PAID_PLANS.includes(plan as PlanId) && (
          <button
            onClick={handleManage}
            disabled={loading === "manage"}
            className="mt-4 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {loading === "manage" ? "Loading…" : "Manage subscription →"}
          </button>
        )}
      </div>

      {/* Razorpay script */}
      {useRazorpay && (
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-3">
        {(["STARTER", "GROWTH", "PRO"] as const).map((planId) => {
          const p = PLANS[planId];
          const isCurrent = plan === planId;
          const price = useRazorpay ? `₹${p.priceINR.toLocaleString("en-IN")}/mo` : `$${p.priceUSD}/mo`;
          const overage = useRazorpay ? `₹${p.overage.inr}/invoice` : `$${p.overage.usd}/invoice`;

          return (
            <div
              key={planId}
              className={`bg-white border rounded-2xl p-5 transition-all ${
                isCurrent ? "border-teal-400 ring-1 ring-teal-400" : "border-gray-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">{p.label}</span>
                    {isCurrent && (
                      <span className="text-xs bg-teal-50 text-teal-800 px-2 py-0.5 rounded-full border border-teal-100">Current</span>
                    )}
                    {planId === "GROWTH" && !isCurrent && (
                      <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100">Popular</span>
                    )}
                  </div>
                  <ul className="space-y-1 mb-3">
                    {PLAN_HIGHLIGHTS[planId].map((h) => (
                      <li key={h} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <svg className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        {h}
                      </li>
                    ))}
                    <li className="text-xs text-gray-400 mt-1">Overage: {overage}</li>
                  </ul>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold text-gray-900">{price}</p>
                  {!isCurrent && (
                    <button
                      onClick={() => useRazorpay ? handleRazorpayPlan(planId) : handleStripePlan(planId)}
                      disabled={!!loading}
                      className="mt-2 bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-900 disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                      {loading === planId ? "Loading…" : plan === "TRIAL" || plan === "CANCELED" ? "Subscribe" : "Switch"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">
        {useRazorpay ? "Payments processed by Razorpay." : "Payments processed by Stripe."} Cancel anytime.
      </p>
    </div>
  );
}
