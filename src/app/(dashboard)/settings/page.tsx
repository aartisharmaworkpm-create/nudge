import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import SettingsClient from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) redirect("/onboard");

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
    <SettingsClient
      business={{
        id: business.id,
        name: business.name,
        currency: business.currency,
        emailDomain: business.emailDomain,
        whatsappNumber: business.whatsappNumber,
        whatsappVerified: business.whatsappVerified,
      }}
      templates={templates}
    />
  );
}
