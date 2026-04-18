import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getResolvedPlans } from "@/lib/razorpay-plans";
import { getINRRates } from "@/lib/exchange-rates";
import BillingSettings from "@/components/settings/BillingSettings";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) redirect("/onboard");

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [invoicesThisMonth, resolvedPlans, rates] = await Promise.all([
    db.invoice.count({ where: { businessId: business.id, createdAt: { gte: startOfMonth } } }),
    getResolvedPlans(),
    getINRRates(),
  ]);

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your subscription and plan</p>
      </div>
      <Suspense>
        <BillingSettings
          plan={(business.plan ?? "TRIAL") as import("@/lib/plans").PlanId}
          trialEndsAt={business.trialEndsAt ?? null}
          subscriptionStatus={business.subscriptionStatus ?? null}
          currentPeriodEnd={business.currentPeriodEnd ?? null}
          invoicesThisMonth={invoicesThisMonth}
          resolvedPlans={resolvedPlans}
          userCurrency={business.currency}
          rates={rates}
          paymentProvider={business.paymentProvider ?? null}
        />
      </Suspense>
    </div>
  );
}
