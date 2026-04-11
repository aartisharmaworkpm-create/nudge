export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const response = NextResponse.redirect(new URL("/login", origin));

  // NextAuth v5 (auth.js) uses "authjs" prefix, not "next-auth"
  const cookieNames = [
    "authjs.session-token",
    "__Secure-authjs.session-token",
    "authjs.csrf-token",
    "__Secure-authjs.csrf-token",
    "__Host-authjs.csrf-token",
    "authjs.callback-url",
    "__Secure-authjs.callback-url",
    // legacy v4 names just in case
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "next-auth.csrf-token",
    "__Secure-next-auth.csrf-token",
  ];

  for (const name of cookieNames) {
    response.cookies.set(name, "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: req.nextUrl.protocol === "https:",
      sameSite: "lax",
    });
  }

  return response;
}
