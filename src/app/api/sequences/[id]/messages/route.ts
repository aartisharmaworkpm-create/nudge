import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH — update message bodies (called from preview screen before activation)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: sequenceId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "No business" }, { status: 404 });

  // Verify sequence belongs to this business
  const sequence = await db.sequence.findFirst({
    where: { id: sequenceId, invoice: { businessId: business.id } },
  });

  if (!sequence) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { edits }: { edits: { messageId: string; body: string }[] } = await req.json();

  await Promise.all(
    edits.map(({ messageId, body }) =>
      db.message.update({ where: { id: messageId, sequenceId }, data: { body } })
    )
  );

  return NextResponse.json({ ok: true });
}
