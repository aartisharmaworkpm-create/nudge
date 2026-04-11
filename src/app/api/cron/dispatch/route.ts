export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { dispatchDueMessages } from "@/lib/dispatcher";

/**
 * GET /api/cron/dispatch
 *
 * Called on a schedule (every 5–15 minutes) to dispatch any messages that are
 * due to send. Secured by a shared CRON_SECRET header.
 *
 * Set up in vercel.json — schedule: every 10 minutes.
 * Or call from an external cron service with header: Authorization: Bearer CRON_SECRET
 */
export async function GET(req: Request) {
  // Verify cron secret to prevent unauthorised triggering
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();

  try {
    const result = await dispatchDueMessages();

    return NextResponse.json({
      ok: true,
      processed: result.processed,
      succeeded: result.succeeded,
      failed: result.failed,
      durationMs: Date.now() - start,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[cron/dispatch] Error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
