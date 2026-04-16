import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PLANS } from "@/lib/plans";

// ── Razorpay payment shape ─────────────────────────────────────────────────────
type RzpPayment = {
  id: string;
  amount: number;        // paise
  currency: string;
  status: string;        // "captured" | "failed" | "refunded" | ...
  method: string;        // "card" | "upi" | "netbanking" | "wallet" | ...
  created_at: number;    // unix timestamp
  error_description: string | null;
};

// ── Fetch all payments for a Razorpay subscription ────────────────────────────
async function fetchSubscriptionPayments(
  subscriptionId: string
): Promise<{ payments: RzpPayment[]; error: string | null }> {
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return { payments: [], error: "Razorpay credentials not configured." };

  try {
    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    // Correct endpoint: GET /v1/subscriptions/{id}/payments
    const res = await fetch(
      `https://api.razorpay.com/v1/subscriptions/${subscriptionId}/payments`,
      {
        headers: { Authorization: `Basic ${basicAuth}` },
        next: { revalidate: 300 },
      }
    );

    const json = await res.json();
    if (!res.ok) {
      return { payments: [], error: json?.error?.description ?? `Razorpay error (${res.status})` };
    }

    return { payments: (json.items ?? []) as RzpPayment[], error: null };
  } catch (err) {
    return { payments: [], error: String(err) };
  }
}

// ── Derive a human plan label from the INR amount ─────────────────────────────
function planLabelFromAmount(amountINR: number): string {
  for (const plan of Object.values(PLANS)) {
    if (plan.priceINR > 0 && plan.priceINR === amountINR) return `${plan.label} plan`;
  }
  return "Nudge subscription";
}

// ── Status badge config ────────────────────────────────────────────────────────
function statusBadge(status: string) {
  switch (status) {
    case "captured":
      return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Paid</span>;
    case "failed":
      return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">Failed</span>;
    case "refunded":
      return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">Refunded</span>;
    default:
      return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full capitalize">{status}</span>;
  }
}

// ── Method label ──────────────────────────────────────────────────────────────
function methodLabel(method: string): string {
  const MAP: Record<string, string> = {
    card:        "Card",
    upi:         "UPI",
    netbanking:  "Net Banking",
    wallet:      "Wallet",
    emi:         "EMI",
    bank_transfer: "Bank Transfer",
  };
  return MAP[method] ?? method;
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) redirect("/onboard");

  const { payments, error: fetchError } = business.razorpaySubscriptionId
    ? await fetchSubscriptionPayments(business.razorpaySubscriptionId)
    : { payments: [], error: null };

  // Sort newest first
  const sorted = [...payments].sort((a, b) => b.created_at - a.created_at);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 text-sm mt-0.5">Your billing history on Nudge</p>
      </div>

      {fetchError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          Could not load transactions: {fetchError}
        </div>
      )}

      {sorted.length === 0 ? (
        /* ── Empty state ── */
        <div className="bg-white border border-gray-200 rounded-2xl p-14 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No transactions yet</h3>
          <p className="text-sm text-gray-500 mb-5">
            Your payment history will appear here once you subscribe to a plan.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 bg-teal-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-900 transition-colors"
          >
            View plans →
          </Link>
        </div>
      ) : (
        /* ── Transactions table ── */
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Summary bar */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {sorted.length} transaction{sorted.length !== 1 ? "s" : ""}
            </p>
            <p className="text-sm font-semibold text-gray-700">
              Total paid:{" "}
              <span className="text-teal-800">
                ₹{sorted
                  .filter((p) => p.status === "captured")
                  .reduce((sum, p) => sum + p.amount / 100, 0)
                  .toLocaleString("en-IN")}
              </span>
            </p>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="text-left px-6 py-3">Date</th>
                <th className="text-left px-6 py-3">Description</th>
                <th className="text-left px-6 py-3 hidden sm:table-cell">Method</th>
                <th className="text-right px-6 py-3">Amount</th>
                <th className="text-right px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((payment) => {
                const amountINR = payment.amount / 100;
                const date = new Date(payment.created_at * 1000);
                return (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                      <p className="font-medium">
                        {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{planLabelFromAmount(amountINR)}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">{payment.id}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 hidden sm:table-cell">
                      {methodLabel(payment.method)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900 whitespace-nowrap">
                      ₹{amountINR.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {statusBadge(payment.status)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">
        Payments processed securely via Razorpay.{" "}
        <Link href="/settings?tab=billing" className="hover:underline">Manage subscription →</Link>
      </p>
    </div>
  );
}
