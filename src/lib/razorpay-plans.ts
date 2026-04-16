/**
 * Server-side helper to fetch plan amounts dynamically from Razorpay.
 * Falls back to hardcoded prices from plans.ts if Razorpay is not configured.
 */
import { PLANS, type PlanId } from "./plans";

type RazorpayPlanResponse = {
  id: string;
  item: { amount: number; currency: string; name: string };
  interval: number;
  period: string;
};

async function fetchRazorpayPlanAmount(planId: string): Promise<number | null> {
  if (!planId || !process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  try {
    const auth = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");
    const res = await fetch(`https://api.razorpay.com/v1/plans/${planId}`, {
      headers: { Authorization: `Basic ${auth}` },
      next: { revalidate: 3600 }, // cache 1 hour
    });
    if (!res.ok) return null;
    const data: RazorpayPlanResponse = await res.json();
    return data.item?.amount ? Math.round(data.item.amount / 100) : null; // paise → rupees
  } catch {
    return null;
  }
}

export type ResolvedPlan = {
  id: PlanId;
  label: string;
  priceINR: number;
  invoicesPerMonth: number;
  whatsapp: boolean;
  sequences: number | "unlimited";
  overage: number;
};

export async function getResolvedPlans(): Promise<ResolvedPlan[]> {
  const paidPlanIds: PlanId[] = ["STARTER", "GROWTH", "PRO"];

  const resolved = await Promise.all(
    paidPlanIds.map(async (id) => {
      const plan = PLANS[id];
      const dynamicPrice = await fetchRazorpayPlanAmount(plan.razorpayPlanId);
      return {
        id,
        label: plan.label,
        priceINR: dynamicPrice ?? plan.priceINR,
        invoicesPerMonth: plan.invoicesPerMonth,
        whatsapp: plan.whatsapp,
        sequences: plan.sequences,
        overage: plan.overage,
      };
    })
  );

  return resolved;
}
