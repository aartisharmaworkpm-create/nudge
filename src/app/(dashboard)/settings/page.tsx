import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import SettingsClient from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [business, user] = await Promise.all([
    db.business.findUnique({ where: { userId: session.user.id } }),
    db.user.findUnique({ where: { id: session.user.id } }),
  ]);
  if (!business) redirect("/onboard");
  if (!user) redirect("/login");

  // Invoices created this calendar month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const invoicesThisMonth = await db.invoice.count({
    where: { businessId: business.id, createdAt: { gte: startOfMonth } },
  });

  const [globalTemplates, businessTemplates] = await Promise.all([
    db.messageTemplate.findMany({
      where: { businessId: null },
      orderBy: [{ step: "asc" }, { tone: "asc" }],
    }),
    db.messageTemplate.findMany({
      where: { businessId: business.id },
      orderBy: [{ step: "asc" }, { tone: "asc" }],
    }),
  ]);

  // Merge: business override wins
  const overrideMap = new Map(
    businessTemplates.map((t) => [`${t.step}:${t.tone}:${t.channel}`, t])
  );
  const templates = globalTemplates.map((g) => {
    const key = `${g.step}:${g.tone}:${g.channel}`;
    const override = overrideMap.get(key);
    return {
      ...g,
      body: override?.body ?? g.body,
      isCustomised: !!override,
    };
  });

  return (
    <Suspense>
    <SettingsClient
      user={{
        name: user.name,
        email: user.email,
        hasPassword: !!user.passwordHash,
      }}
      business={{
        id: business.id,
        name: business.name,
        currency: business.currency,
        emailDomain: business.emailDomain,
        whatsappNumber: business.whatsappNumber,
        whatsappVerified: business.whatsappVerified,
      }}
      templates={templates}
      billing={{
        plan: (business.plan ?? "TRIAL") as import("@/lib/plans").PlanId,
        trialEndsAt: business.trialEndsAt ?? null,
        subscriptionStatus: business.subscriptionStatus ?? null,
        currentPeriodEnd: business.currentPeriodEnd ?? null,
        invoicesThisMonth,
      }}
    />
    </Suspense>
  );
}
