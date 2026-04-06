import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business" }, { status: 404 });

  const invoice = await db.invoice.findUnique({
    where: { id, businessId: business.id },
    include: { sequence: true },
  });

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!invoice.sequence) return NextResponse.json({ error: "No sequence" }, { status: 400 });
  if (invoice.sequence.status === "ACTIVE") return NextResponse.json({ error: "Already active" }, { status: 400 });

  await db.sequence.update({
    where: { id: invoice.sequence.id },
    data: { status: "ACTIVE", pausedAt: null, resumeAt: null },
  });

  return NextResponse.json({ ok: true });
}
