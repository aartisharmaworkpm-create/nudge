"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  planId: string;
  paypalPlanId: string;
  planLabel: string;
  priceUSD: number;
  onSuccess: (subscriptionId: string) => void;
  onError: (msg: string) => void;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: unknown) => { render: (selector: string) => void; isEligible: () => boolean };
    };
  }
}

export default function PayPalButton({
  planId,
  paypalPlanId,
  planLabel,
  priceUSD,
  onSuccess,
  onError,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);
  const rendered = useRef(false);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  useEffect(() => {
    if (!clientId) return; // no client id — show fallback button
    if (window.paypal) { setSdkReady(true); return; }
    if (document.getElementById("paypal-sdk")) {
      // Script tag exists but may still be loading
      const existing = document.getElementById("paypal-sdk") as HTMLScriptElement;
      if (existing.dataset.loaded) { setSdkReady(true); return; }
      existing.addEventListener("load", () => setSdkReady(true));
      return;
    }

    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.async = true;
    script.onload = () => { script.dataset.loaded = "1"; setSdkReady(true); };
    script.onerror = () => setSdkError(true);
    document.body.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current || rendered.current) return;
    if (!paypalPlanId) return; // plan IDs not configured yet — fallback button shown

    rendered.current = true;
    window.paypal.Buttons({
      style: { shape: "rect", color: "blue", layout: "vertical", label: "subscribe" },
      createSubscription: (_data: unknown, actions: { subscription: { create: (opts: unknown) => Promise<string> } }) =>
        actions.subscription.create({ plan_id: paypalPlanId }),
      onApprove: (data: { subscriptionID: string }) => onSuccess(data.subscriptionID),
      onError: (err: unknown) => {
        console.error("PayPal error", err);
        onError("PayPal checkout failed. Please try again.");
      },
      onCancel: () => {},
    }).render(`#paypal-btn-${planId}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady, paypalPlanId, planId]);

  // ── Not configured yet (env vars missing) — show a clean subscribe button ──
  if (!clientId || !paypalPlanId || sdkError) {
    return (
      <div className="space-y-1.5">
        <button
          className="w-full bg-[#0070ba] hover:bg-[#003087] text-white py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          onClick={() => onError("PayPal payments are being set up. Please try again shortly or contact support.")}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
          </svg>
          Subscribe with PayPal — ${priceUSD}/mo
        </button>
        <p className="text-xs text-gray-400 text-center">PayPal · Secure checkout</p>
      </div>
    );
  }

  return (
    <div>
      <div ref={containerRef} id={`paypal-btn-${planId}`} />
      {!sdkReady && (
        <div className="h-10 bg-blue-50 border border-blue-100 rounded-lg animate-pulse flex items-center justify-center">
          <span className="text-xs text-blue-300">Loading PayPal…</span>
        </div>
      )}
    </div>
  );
}
