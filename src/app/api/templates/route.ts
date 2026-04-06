import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Tone, Channel } from "@/generated/prisma/client";

/**
 * GET /api/templates
 * Returns the effective templates for the business — business-specific
 * overrides merged on top of global defaults.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Load global defaults
  const globals = await db.messageTemplate.findMany({
    where: { businessId: null },
    orderBy: [{ step: "asc" }, { tone: "asc" }],
  });

  // Load business overrides
  const overrides = await db.messageTemplate.findMany({
    where: { businessId: business.id },
    orderBy: [{ step: "asc" }, { tone: "asc" }],
  });

  // Merge: business-specific wins over global
  const overrideMap = new Map(overrides.map((t) => [`${t.step}:${t.tone}:${t.channel}`, t]));
  const merged = globals.map((g) => {
    const key = `${g.step}:${g.tone}:${g.channel}`;
    return overrideMap.get(key) ?? { ...g, isCustomised: false };
  }).map((t) => ({
    ...t,
    isCustomised: overrideMap.has(`${t.step}:${t.tone}:${t.channel}`),
  }));

  return NextResponse.json(merged);
}

/**
 * PATCH /api/templates
 * Upsert a business-level template override.
 * Body: { step, tone, channel, body }
 */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { step, tone, channel, body } = await req.json();

  if (!step || !tone || !channel || !body?.trim()) {
    return NextResponse.json({ error: "Missing fields." }, { status: 400 });
  }

  const template = await db.messageTemplate.upsert({
    where: {
      businessId_step_tone_channel: {
        businessId: business.id,
        step: Number(step),
        tone: tone as Tone,
        channel: channel as Channel,
      },
    },
    update: { body: body.trim() },
    create: {
      businessId: business.id,
      step: Number(step),
      tone: tone as Tone,
      channel: channel as Channel,
      body: body.trim(),
    },
  });

  return NextResponse.json(template);
}

/**
 * DELETE /api/templates
 * Reset a template back to the global default.
 * Body: { step, tone, channel }
 */
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const business = await db.business.findUnique({ where: { userId: session.user.id } });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { step, tone, channel } = await req.json();

  await db.messageTemplate.deleteMany({
    where: {
      businessId: business.id,
      step: Number(step),
      tone: tone as Tone,
      channel: channel as Channel,
    },
  });

  return NextResponse.json({ ok: true });
}
