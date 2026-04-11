export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const base = process.env.NEXTAUTH_URL ?? `https://${req.headers.get("host")}`;
  const res = NextResponse.redirect(`${base}/login`, { status: 302 });

  // Exact cookie names visible in browser (NextAuth v5 on HTTPS)
  res.headers.append(
    "Set-Cookie",
    `__Secure-authjs.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`
  );
  res.headers.append(
    "Set-Cookie",
    `__Host-authjs.csrf-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`
  );
  res.headers.append(
    "Set-Cookie",
    `__Secure-authjs.callback-url=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Lax`
  );

  return res;
}
