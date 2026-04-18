/**
 * One-time script to create PayPal Products + Subscription Plans for Nudge.
 *
 * Run once (sandbox first, then production):
 *   PAYPAL_CLIENT_ID=xxx PAYPAL_CLIENT_SECRET=yyy PAYPAL_SANDBOX=true node scripts/setup-paypal-plans.mjs
 *
 * Copy the printed Plan IDs into your .env / Netlify env vars:
 *   PAYPAL_PLAN_STARTER=P-...
 *   PAYPAL_PLAN_GROWTH=P-...
 *   PAYPAL_PLAN_PRO=P-...
 */

const SANDBOX = process.env.PAYPAL_SANDBOX !== "false";
const BASE    = SANDBOX ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";

const CLIENT_ID     = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("❌  Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET before running.");
  process.exit(1);
}

// ── 1. Get access token ───────────────────────────────────────────────────────
async function getToken() {
  const creds = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res   = await fetch(`${BASE}/v1/oauth2/token`, {
    method:  "POST",
    headers: { Authorization: `Basic ${creds}`, "Content-Type": "application/x-www-form-urlencoded" },
    body:    "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(`Token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

// ── 2. Create a Product ───────────────────────────────────────────────────────
async function createProduct(token) {
  const res = await fetch(`${BASE}/v1/catalogs/products`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      name:        "Nudge",
      description: "Automated invoice follow-up SaaS",
      type:        "SERVICE",
      category:    "SOFTWARE",
    }),
  });
  const data = await res.json();
  if (!data.id) throw new Error(`Product error: ${JSON.stringify(data)}`);
  console.log(`✅  Product created: ${data.id}`);
  return data.id;
}

// ── 3. Create a Plan ──────────────────────────────────────────────────────────
async function createPlan(token, productId, { name, description, priceUSD }) {
  const res = await fetch(`${BASE}/v1/billing/plans`, {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id:  productId,
      name,
      description,
      status:      "ACTIVE",
      billing_cycles: [
        {
          frequency:      { interval_unit: "MONTH", interval_count: 1 },
          tenure_type:    "REGULAR",
          sequence:       1,
          total_cycles:   0, // 0 = infinite
          pricing_scheme: {
            fixed_price: { value: String(priceUSD), currency_code: "USD" },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding:     true,
        setup_fee:                 { value: "0", currency_code: "USD" },
        setup_fee_failure_action:  "CONTINUE",
        payment_failure_threshold: 3,
      },
    }),
  });
  const data = await res.json();
  if (!data.id) throw new Error(`Plan error for ${name}: ${JSON.stringify(data)}`);
  console.log(`✅  Plan "${name}": ${data.id}`);
  return data.id;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀  Setting up PayPal plans (${SANDBOX ? "SANDBOX" : "PRODUCTION"})…\n`);

  const token     = await getToken();
  const productId = await createProduct(token);

  const [starterId, growthId, proId] = await Promise.all([
    createPlan(token, productId, { name: "Nudge Starter",  description: "Up to 40 invoices/month",  priceUSD: 9  }),
    createPlan(token, productId, { name: "Nudge Growth",   description: "Up to 150 invoices/month", priceUSD: 19 }),
    createPlan(token, productId, { name: "Nudge Pro",      description: "Up to 400 invoices/month", priceUSD: 39 }),
  ]);

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Add these to your .env / Netlify env vars:

PAYPAL_PLAN_STARTER=${starterId}
PAYPAL_PLAN_GROWTH=${growthId}
PAYPAL_PLAN_PRO=${proId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main().catch((err) => { console.error("❌ ", err.message); process.exit(1); });
