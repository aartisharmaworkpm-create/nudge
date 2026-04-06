import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business" }, { status: 404 });

  const { resumeAt, pauseReason } = await req.json();

  const invoice = await db.invoice.findUnique({
    where: { id, businessId: business.id },
    include: { sequence: true },
  });

  if (!invoice?.sequence) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.sequence.update({
    where: { id: invoice.sequence.id },
    data: {
      status: "PAUSED",
      pausedAt: new Date(),
      resumeAt: resumeAt ? new Date(resumeAt) : null,
      pauseReason: pauseReason || null,
    },
  });

  return NextResponse.json({ ok: true });
}
