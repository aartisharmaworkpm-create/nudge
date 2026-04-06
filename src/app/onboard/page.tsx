import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import OnboardClient from "./OnboardClient";

export default async function OnboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Already onboarded — skip
  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (business) redirect("/dashboard");

  return <OnboardClient userName={session.user.name ?? session.user.email ?? ""} />;
}
