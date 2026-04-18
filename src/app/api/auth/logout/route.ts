export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * GET /api/auth/logout
 *
 * Clears all NextAuth session cookies and redirects to /login.
 * Works in both HTTP (dev) and HTTPS (prod) environments by clearing
 * both the plain and __Secure-/__Host- prefixed variants.
 */
export async function GET(req: NextRequest) {
  const loginUrl = new URL("/login", req.nextUrl.origin);
  const res = NextResponse.redirect(loginUrl);

  const cookieOpts = { maxAge: 0, path: "/" } as const;

  // HTTP (dev) variants
  res.cookies.set("authjs.session-token", "", cookieOpts);
  res.cookies.set("authjs.csrf-token", "", cookieOpts);
  res.cookies.set("authjs.callback-url", "", cookieOpts);

  // HTTPS (prod) variants
  res.cookies.set("__Secure-authjs.session-token", "", { ...cookieOpts, secure: true });
  res.cookies.set("__Host-authjs.csrf-token", "", { ...cookieOpts, secure: true });
  res.cookies.set("__Secure-authjs.callback-url", "", { ...cookieOpts, secure: true });

  return res;
}
