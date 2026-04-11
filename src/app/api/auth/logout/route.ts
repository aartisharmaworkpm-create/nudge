export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  console.log("[logout] cookies found:", allCookies.map((c) => c.name));

  const response = NextResponse.json({ ok: true, cleared: allCookies.map((c) => c.name) });

  // Delete via response.cookies with all necessary attributes
  for (const cookie of allCookies) {
    response.cookies.set(cookie.name, "", {
      maxAge: 0,
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
  }

  return response;
}
