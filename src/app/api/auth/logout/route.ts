export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * GET /api/auth/logout
 *
 * Clears all NextAuth session cookies and redirects to /login.
 *
 * Two Netlify-specific fixes:
 *  1. Uses NEXTAUTH_URL (or x-forwarded headers) for the redirect URL so the
 *     browser goes to the canonical domain — NOT the deploy-preview subdomain
 *     (e.g. 69e3339e95fe...--nudge-dev.netlify.app).
 *  2. Reads actual cookie names from the incoming request rather than
 *     hard-coding names, so it always clears whatever is present.
 */
export async function GET(req: NextRequest) {
  // Always redirect to the canonical domain from NEXTAUTH_URL.
  // On Netlify, req.nextUrl.origin may be a deploy-preview URL which is a
  // different domain — cookies set on the main domain cannot be cleared there.
  const canonicalOrigin =
    process.env.NEXTAUTH_URL ??
    (() => {
      const proto = req.headers.get("x-forwarded-proto") ?? "https";
      const host  = req.headers.get("x-forwarded-host") ?? req.nextUrl.host;
      return `${proto}://${host}`;
    })();

  const res = NextResponse.redirect(new URL("/login", canonicalOrigin));

  // Clear every auth cookie present in this request using raw Set-Cookie
  // headers — gives full control over attributes for __Host- and __Secure- prefixes.
  for (const cookie of req.cookies.getAll()) {
    const { name } = cookie;
    if (!name.includes("authjs") && !name.includes("next-auth")) continue;

    if (name.startsWith("__Host-")) {
      // __Host- requires Secure, Path=/, and no Domain
      res.headers.append(
        "Set-Cookie",
        `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
      );
    } else if (name.startsWith("__Secure-")) {
      res.headers.append(
        "Set-Cookie",
        `${name}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
      );
    } else {
      // Plain cookie (HTTP / local dev)
      res.headers.append(
        "Set-Cookie",
        `${name}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`
      );
    }
  }

  return res;
}
