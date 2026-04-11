export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL
        ? `set (starts with: ${process.env.DATABASE_URL.slice(0, 20)}...)`
        : "MISSING",
      AUTH_SECRET: process.env.AUTH_SECRET ? "set" : "MISSING",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "not set",
      NODE_ENV: process.env.NODE_ENV,
    },
  };

  try {
    // Try a simple DB query
    const userCount = await db.user.count();
    checks.database = { status: "ok", userCount };
  } catch (err: unknown) {
    checks.database = {
      status: "error",
      message: err instanceof Error ? err.message : String(err),
    };
  }

  try {
    const templateCount = await db.messageTemplate.count();
    checks.seed = { messageTemplates: templateCount };
  } catch (err: unknown) {
    checks.seed = {
      status: "error",
      message: err instanceof Error ? err.message : String(err),
    };
  }

  const allOk =
    typeof checks.database === "object" &&
    checks.database !== null &&
    (checks.database as Record<string, unknown>).status === "ok";

  return NextResponse.json(checks, { status: allOk ? 200 : 500 });
}
