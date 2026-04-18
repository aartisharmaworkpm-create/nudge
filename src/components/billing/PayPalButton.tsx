"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  planId: string;        // our plan ID: STARTER | GROWTH | PRO
  paypalPlanId: string;  // PayPal plan ID: P-XXXX
  planLabel: string;
  onSuccess: (subscriptionId: string) => void;
  onError: (msg: string) => void;
};

declare global {
  interface Window {
    paypal?: {
      Buttons: (opts: unknown) => { render: (selector: string) => void };
    };
  }
}

export default function PayPalButton({
  planId,
  paypalPlanId,
  planLabel,
  onSuccess,
  onError,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const rendered = useRef(false);
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? "";

  // Load PayPal JS SDK once
  useEffect(() => {
    if (window.paypal) { setSdkReady(true); return; }
    if (document.getElementById("paypal-sdk")) { setSdkReady(true); return; }

    const script = document.createElement("script");
    script.id   = "paypal-sdk";
    script.src  = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => onError("Failed to load PayPal SDK");
    document.body.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  // Render buttons when SDK is ready
  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current || rendered.current) return;
    if (!paypalPlanId) {
      onError("PayPal plan not configured. Please contact support.");
      return;
    }

    rendered.current = true;
    window.paypal.Buttons({
      style: {
        shape: "rect",
        color: "blue",
        layout: "vertical",
        label: "subscribe",
      },
      createSubscription: (_data: unknown, actions: { subscription: { create: (opts: unknown) => Promise<string> } }) => {
        return actions.subscription.create({ plan_id: paypalPlanId });
      },
      onApprove: (data: { subscriptionID: string }) => {
        onSuccess(data.subscriptionID);
      },
      onError: (err: unknown) => {
        console.error("PayPal error", err);
        onError("PayPal checkout failed. Please try again.");
      },
      onCancel: () => {
        // User closed PayPal popup — do nothing
      },
    }).render(`#paypal-btn-${planId}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sdkReady, paypalPlanId, planId]);

  if (!clientId) {
    return (
      <p className="text-xs text-red-500 text-center">
        PayPal not configured. Contact support.
      </p>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-400 text-center mb-2">
        Subscribe to <strong>{planLabel}</strong> via PayPal
      </p>
      <div ref={containerRef} id={`paypal-btn-${planId}`} />
      {!sdkReady && (
        <div className="h-10 bg-gray-100 rounded animate-pulse" />
      )}
    </div>
  );
}
