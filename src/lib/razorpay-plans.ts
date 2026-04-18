/**
 * Server-side helpers to fetch plan amounts from Razorpay and PayPal.
 * Falls back to hardcoded prices from plans.ts if APIs are not configured.
 */
import { PLANS, type PlanId } from "./plans";

// ── Razorpay ──────────────────────────────────────────────────────────────────

type RazorpayPlanResponse = {
  id: string;
  item: { amount: number; currency: string; name: string };
};

async function fetchRazorpayPlanAmount(planId: string): Promise<number | null> {
  if (!planId || !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  try {
    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");
    const res = await fetch(`https://api.razorpay.com/v1/plans/${planId}`, {
      headers: { Authorization: `Basic ${auth}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data: RazorpayPlanResponse = await res.json();
    return data.item?.amount ? Math.round(data.item.amount / 100) : null; // paise → rupees
  } catch {
    return null;
  }
}

// ── PayPal ────────────────────────────────────────────────────────────────────

type PayPalPlanResponse = {
  id: string;
  status: string;
  billing_cycles: Array<{
    tenure_type: string;
    pricing_scheme: {
      fixed_price?: { value: string; currency_code: string };
    };
  }>;
};

let _paypalToken: string | null = null;
let _paypalTokenExpiry = 0;

async function getPayPalToken(): Promise<string | null> {
  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) return null;
  if (_paypalToken && Date.now() < _paypalTokenExpiry) return _paypalToken;

  const base = process.env.PAYPAL_SANDBOX === "false"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  try {
    const creds = Buffer.from(
      `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString("base64");
    const res = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials",
      next: { revalidate: 3000 }, // ~50 min cache (tokens last 9h)
    });
    const data = await res.json();
    _paypalToken = data.access_token ?? null;
    _paypalTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return _paypalToken;
  } catch {
    return null;
  }
}

async function fetchPayPalPlanAmount(planId: string): Promise<number | null> {
  if (!planId) return null;
  const token = await getPayPalToken();
  if (!token) return null;

  const base = process.env.PAYPAL_SANDBOX === "false"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  try {
    const res = await fetch(`${base}/v1/billing/plans/${planId}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data: PayPalPlanResponse = await res.json();
    // Find the REGULAR billing cycle price
    const regular = data.billing_cycles?.find((c) => c.tenure_type === "REGULAR");
    const value = regular?.pricing_scheme?.fixed_price?.value;
    return value ? Math.round(parseFloat(value)) : null; // USD whole dollars
  } catch {
    return null;
  }
}

// ── Resolved plans ────────────────────────────────────────────────────────────

export type ResolvedPlan = {
  id: PlanId;
  label: string;
  priceINR: number;
  priceUSD: number;
  invoicesPerMonth: number;
  whatsapp: boolean;
  sequences: number | "unlimited";
  overage: number;
  overageUSD: number;
  paypalPlanId: string;   // resolved server-side so client components can use it
};

export async function getResolvedPlans(): Promise<ResolvedPlan[]> {
  const paidPlanIds: PlanId[] = ["STARTER", "GROWTH", "PRO"];

  const resolved = await Promise.all(
    paidPlanIds.map(async (id) => {
      const plan = PLANS[id];
      const [dynamicINR, dynamicUSD] = await Promise.all([
        fetchRazorpayPlanAmount(plan.razorpayPlanId),
        fetchPayPalPlanAmount(plan.paypalPlanId),
      ]);
      return {
        id,
        label:            plan.label,
        priceINR:         dynamicINR ?? plan.priceINR,
        priceUSD:         dynamicUSD ?? plan.priceUSD,
        invoicesPerMonth: plan.invoicesPerMonth,
        whatsapp:         plan.whatsapp,
        sequences:        plan.sequences,
        overage:          plan.overage,
        overageUSD:       plan.overageUSD,
        paypalPlanId:     plan.paypalPlanId, // read server-side, passed to client as prop
      };
    })
  );

  return resolved;
}
