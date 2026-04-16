export type PlanId = "TRIAL" | "STARTER" | "GROWTH" | "PRO" | "CANCELED";

export type Plan = {
  id: PlanId;
  label: string;
  priceUSD: number;        // USD display price
  priceINR: number;        // INR display price
  invoicesPerMonth: number;
  whatsapp: boolean;
  sequences: number | "unlimited";
  overage: { usd: number; inr: number };
  // Stripe price IDs
  stripePriceId: string;
  // Razorpay plan IDs
  razorpayPlanId: string;
};

export const PLANS: Record<PlanId, Plan> = {
  TRIAL: {
    id: "TRIAL",
    label: "Trial",
    priceUSD: 0,
    priceINR: 0,
    invoicesPerMonth: 5,
    whatsapp: true,
    sequences: 1,
    overage: { usd: 0, inr: 0 },
    stripePriceId: "",
    razorpayPlanId: "",
  },
  STARTER: {
    id: "STARTER",
    label: "Starter",
    priceUSD: 49,
    priceINR: 4099,
    invoicesPerMonth: 40,
    whatsapp: false,
    sequences: 1,
    overage: { usd: 1.5, inr: 125 },
    stripePriceId: process.env.STRIPE_PRICE_STARTER ?? "",
    razorpayPlanId: process.env.RAZORPAY_PLAN_STARTER ?? "",
  },
  GROWTH: {
    id: "GROWTH",
    label: "Growth",
    priceUSD: 129,
    priceINR: 10799,
    invoicesPerMonth: 150,
    whatsapp: true,
    sequences: 3,
    overage: { usd: 0.8, inr: 67 },
    stripePriceId: process.env.STRIPE_PRICE_GROWTH ?? "",
    razorpayPlanId: process.env.RAZORPAY_PLAN_GROWTH ?? "",
  },
  PRO: {
    id: "PRO",
    label: "Pro",
    priceUSD: 249,
    priceINR: 20799,
    invoicesPerMonth: 400,
    whatsapp: true,
    sequences: Infinity as unknown as "unlimited",
    overage: { usd: 0.6, inr: 50 },
    stripePriceId: process.env.STRIPE_PRICE_PRO ?? "",
    razorpayPlanId: process.env.RAZORPAY_PLAN_PRO ?? "",
  },
  CANCELED: {
    id: "CANCELED",
    label: "Canceled",
    priceUSD: 0,
    priceINR: 0,
    invoicesPerMonth: 0,
    whatsapp: false,
    sequences: 0,
    overage: { usd: 0, inr: 0 },
    stripePriceId: "",
    razorpayPlanId: "",
  },
};

export const PAID_PLANS: PlanId[] = ["STARTER", "GROWTH", "PRO"];

export function getPlan(planId: string): Plan {
  return PLANS[(planId as PlanId) ?? "TRIAL"] ?? PLANS.TRIAL;
}

export function isTrialActive(trialEndsAt: Date | null): boolean {
  if (!trialEndsAt) return false;
  return new Date() < new Date(trialEndsAt);
}

export function canCreateInvoice(
  plan: PlanId,
  trialEndsAt: Date | null,
  invoicesThisMonth: number
): { allowed: boolean; reason?: string } {
  if (plan === "CANCELED") {
    return { allowed: false, reason: "Your subscription has been canceled. Please resubscribe to continue." };
  }
  if (plan === "TRIAL") {
    if (!isTrialActive(trialEndsAt)) {
      return { allowed: false, reason: "Your 14-day trial has ended. Please choose a plan to continue." };
    }
    if (invoicesThisMonth >= PLANS.TRIAL.invoicesPerMonth) {
      return { allowed: false, reason: `Trial is limited to ${PLANS.TRIAL.invoicesPerMonth} invoices. Please upgrade to continue.` };
    }
  } else {
    const limit = PLANS[plan]?.invoicesPerMonth ?? 0;
    if (invoicesThisMonth >= limit) {
      return { allowed: false, reason: `You've reached your ${limit} invoice/month limit on the ${getPlan(plan).label} plan.` };
    }
  }
  return { allowed: true };
}
