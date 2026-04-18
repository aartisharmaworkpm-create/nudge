export const runtime = "nodejs";

import { signOut } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  await signOut({ redirectTo: "/login" });
}
