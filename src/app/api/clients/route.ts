import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json([], { status: 200 });

  const clients = await db.client.findMany({
    where: { businessId: business.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, whatsapp: true, avgDaysToPay: true },
  });

  return NextResponse.json(clients);
}
