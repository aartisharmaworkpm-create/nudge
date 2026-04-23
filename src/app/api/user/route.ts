export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

/** PATCH /api/user — update name, email, or password */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, email, currentPassword, newPassword } = await req.json();

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const updates: { name?: string; email?: string; passwordHash?: string } = {};

  if (name?.trim()) updates.name = name.trim();

  if (email?.trim() && email.trim() !== user.email) {
    const existing = await db.user.findUnique({ where: { email: email.trim() } });
    if (existing) return NextResponse.json({ error: "Email already in use." }, { status: 400 });
    updates.email = email.trim();
  }

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }
    if (!user.passwordHash) {
      return NextResponse.json({ error: "Cannot set password for OAuth accounts." }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    }
    updates.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  await db.user.update({ where: { id: session.user.id }, data: updates });
  return NextResponse.json({ ok: true });
}
