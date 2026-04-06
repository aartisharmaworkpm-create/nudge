import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const business = await db.business.findUnique({
    where: { userId: session.user.id },
  });

  // First-time Google OAuth user — no business yet
  if (!business) redirect("/onboard");

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar businessName={business.name} userEmail={session.user.email ?? ""} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
