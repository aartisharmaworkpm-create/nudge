export type PlanId = "TRIAL" | "STARTER" | "GROWTH" | "PRO" | "CANCELED";

export type Plan = {
  id: PlanId;
  label: string;
  priceINR: number;
  priceUSD: number;        // for PayPal / international display
  invoicesPerMonth: number;
  whatsapp: boolean;
  sequences: number | "unlimited";
  overage: number;         // INR per invoice
  overageUSD: number;      // USD cents per invoice (displayed as $X)
  razorpayPlanId: string;
  paypalPlanId: string;
};

export const PLANS: Record<PlanId, Plan> = {
  TRIAL: {
    id: "TRIAL",
    label: "Trial",
    priceINR: 0,
    priceUSD: 0,
    invoicesPerMonth: 5,
    whatsapp: true,
    sequences: 1,
    overage: 0,
    overageUSD: 0,
    razorpayPlanId: "",
    paypalPlanId: "",
  },
  STARTER: {
    id: "STARTER",
    label: "Starter",
    priceINR: 4099,
    priceUSD: 49,
    invoicesPerMonth: 40,
    whatsapp: false,
    sequences: 1,
    overage: 125,
    overageUSD: 150,
    razorpayPlanId: process.env.RAZORPAY_PLAN_STARTER ?? "",
    paypalPlanId:   process.env.PAYPAL_PLAN_STARTER   ?? "",
  },
  GROWTH: {
    id: "GROWTH",
    label: "Growth",
    priceINR: 10799,
    priceUSD: 99,
    invoicesPerMonth: 150,
    whatsapp: true,
    sequences: 3,
    overage: 67,
    overageUSD: 80,
    razorpayPlanId: process.env.RAZORPAY_PLAN_GROWTH ?? "",
    paypalPlanId:   process.env.PAYPAL_PLAN_GROWTH   ?? "",
  },
  PRO: {
    id: "PRO",
    label: "Pro",
    priceINR: 20799,
    priceUSD: 129,
    invoicesPerMonth: 400,
    whatsapp: true,
    sequences: Infinity as unknown as "unlimited",
    overage: 50,
    overageUSD: 60,
    razorpayPlanId: process.env.RAZORPAY_PLAN_PRO ?? "",
    paypalPlanId:   process.env.PAYPAL_PLAN_PRO   ?? "",
  },
  CANCELED: {
    id: "CANCELED",
    label: "Canceled",
    priceINR: 0,
    priceUSD: 0,
    invoicesPerMonth: 0,
    whatsapp: false,
    sequences: 0,
    overage: 0,
    overageUSD: 0,
    razorpayPlanId: "",
    paypalPlanId: "",
  },
};

export const PAID_PLANS: PlanId[] = ["STARTER", "GROWTH", "PRO"];

export function getPlan(planId: string): Plan {
  return PLANS[(planId as PlanId)] ?? PLANS.TRIAL;
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
