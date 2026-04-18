const BASE = process.env.PAYPAL_SANDBOX === "true"
  ? "https://api-m.sandbox.paypal.com"
  : "https://api-m.paypal.com";

// ── OAuth token (short-lived, cached per process) ────────────────────────────
let _token: string | null = null;
let _tokenExpiry = 0;

async function getAccessToken(): Promise<string> {
  if (_token && Date.now() < _tokenExpiry) return _token;

  const credentials = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  _token = data.access_token as string;
  _tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // 1-min buffer
  return _token;
}

// ── Subscription helpers ─────────────────────────────────────────────────────

export async function getSubscription(subscriptionId: string) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json() as Promise<PayPalSubscription>;
}

export async function cancelSubscription(
  subscriptionId: string,
  reason = "Cancelled by user"
): Promise<boolean> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });
  return res.status === 204; // PayPal returns 204 No Content on success
}

// ── Types ────────────────────────────────────────────────────────────────────

export type PayPalSubscription = {
  id: string;
  status: "APPROVAL_PENDING" | "APPROVED" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "EXPIRED";
  plan_id: string;
  billing_info?: {
    next_billing_time?: string;
    last_payment?: {
      amount: { currency_code: string; value: string };
      time: string;
    };
  };
};
