export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  // Return 200 so the browser processes Set-Cookie before the client redirects
  const response = NextResponse.json({ ok: true });

  for (const cookie of allCookies) {
    response.cookies.delete(cookie.name);
  }

  return response;
}
