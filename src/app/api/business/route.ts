import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({
    where: { userId: session.user.id },
  });

  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(business);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const { name, currency, emailDomain, whatsappNumber } = body;

  const updated = await db.business.update({
    where: { id: business.id },
    data: {
      ...(name && { name: name.trim() }),
      ...(currency && { currency }),
      ...(emailDomain !== undefined && { emailDomain: emailDomain?.trim() || null }),
      ...(whatsappNumber !== undefined && { whatsappNumber: whatsappNumber?.trim() || null }),
    },
  });

  return NextResponse.json(updated);
}
