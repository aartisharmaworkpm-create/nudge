export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Prevent creating a second business
  const existing = await db.business.findUnique({ where: { userId: session.user.id } });
  if (existing) {
    return NextResponse.json({ error: "Business already exists." }, { status: 409 });
  }

  const { businessName, currency } = await req.json();

  if (!businessName?.trim()) {
    return NextResponse.json({ error: "Business name is required." }, { status: 400 });
  }

  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days from now

  const business = await db.business.create({
    data: {
      userId: session.user.id,
      name: businessName.trim(),
      currency: currency ?? "GBP",
      trialEndsAt,
    },
  });

  return NextResponse.json({ id: business.id }, { status: 201 });
}
