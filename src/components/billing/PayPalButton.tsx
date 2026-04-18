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
      Buttons: (opts: unknown) => {
        render: (selector: string) => Promise<void>;
        isEligible: () => boolean;
      };
    };
  }
}

// ── Shared SDK loader ─────────────────────────────────────────────────────────
// All instances on the same page share one load promise so the script is only
// fetched once and every component correctly transitions to sdkReady=true.
let sdkLoadPromise: Promise<void> | null = null;

function loadPayPalSdk(clientId: string): Promise<void> {
  if (sdkLoadPromise) return sdkLoadPromise;
  if (typeof window !== "undefined" && window.paypal) {
    sdkLoadPromise = Promise.resolve();
    return sdkLoadPromise;
  }
  sdkLoadPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("paypal-sdk") as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded) { resolve(); return; }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("SDK load failed")));
      return;
    }
    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.async = true;
    script.onload = () => { script.dataset.loaded = "1"; resolve(); };
    script.onerror = () => { sdkLoadPromise = null; reject(new Error("SDK load failed")); };
    document.body.appendChild(script);
  });
  return sdkLoadPromise;
}

// ── Global render queue ───────────────────────────────────────────────────────
// PayPal's SDK throws when multiple .render() calls run simultaneously.
// Serialise them so only one renders at a time.
let renderQueue: Promise<void> = Promise.resolve();

function enqueueRender(fn: () => Promise<void>): Promise<void> {
  renderQueue = renderQueue.then(() => fn()).catch(() => {});
  return renderQueue;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function PayPalButton({
  planId,
  paypalPlanId,
  planLabel,
  priceUSD,
  onSuccess,
  onError,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendered = useRef(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  // Load SDK
  useEffect(() => {
    if (!clientId || !paypalPlanId) return;
    loadPayPalSdk(clientId)
      .then(() => setSdkReady(true))
      .catch(() => setSdkError(true));
  }, [clientId, paypalPlanId]);

  // Render PayPal buttons once SDK is ready
  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current || rendered.current) return;
    if (!paypalPlanId) return;

    rendered.current = true;
    const container = containerRef.current;

    enqueueRender(async () => {
      // Re-check: component may have unmounted while waiting in queue
      if (!container || !window.paypal) return;
      container.innerHTML = ""; // clear any previous render attempt

      try {
        await window.paypal.Buttons({
          style: { shape: "rect", color: "blue", layout: "vertical", label: "subscribe" },
          createSubscription: (
            _data: unknown,
            actions: { subscription: { create: (opts: unknown) => Promise<string> } }
          ) => actions.subscription.create({ plan_id: paypalPlanId }),
          onApprove: (data: { subscriptionID: string }) => onSuccess(data.subscriptionID),
          onError: (err: unknown) => {
            console.error("[PayPal] checkout error", err);
            onError("PayPal checkout failed. Please try again.");
          },
          onCancel: () => {},
        }).render(`#paypal-btn-${planId}`);
      } catch (err) {
        console.error("[PayPal] render error", err);
        rendered.current = false; // allow a retry
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady, paypalPlanId, planId]);

  // ── Plan ID missing (env var not set) ────────────────────────────────────────
  if (!paypalPlanId) {
    return (
      <div className="space-y-1.5">
        <button
          disabled
          className="w-full bg-[#0070ba] text-white py-2.5 rounded-lg text-sm font-bold opacity-50 flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <PayPalIcon />
          Subscribe with PayPal — ${priceUSD}/mo
        </button>
        <p className="text-xs text-amber-500 text-center">
          PayPal checkout for {planLabel} coming soon
        </p>
      </div>
    );
  }

  // ── PayPal client ID missing or SDK failed to load ────────────────────────────
  if (!clientId || sdkError) {
    return (
      <div className="space-y-1.5">
        <button
          disabled
          className="w-full bg-[#0070ba] text-white py-2.5 rounded-lg text-sm font-bold opacity-50 flex items-center justify-center gap-2 cursor-not-allowed"
        >
          <PayPalIcon />
          Subscribe with PayPal — ${priceUSD}/mo
        </button>
        <p className="text-xs text-gray-400 text-center">PayPal · Secure checkout</p>
      </div>
    );
  }

  // ── Normal: SDK loading or ready ──────────────────────────────────────────────
  return (
    <div className="min-h-[45px]">
      <div ref={containerRef} id={`paypal-btn-${planId}`} />
      {!sdkReady && (
        <div className="h-11 bg-blue-50 border border-blue-100 rounded-lg animate-pulse flex items-center justify-center">
          <span className="text-xs text-blue-300">Loading PayPal…</span>
        </div>
      )}
    </div>
  );
}

function PayPalIcon() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z" />
    </svg>
  );
}
