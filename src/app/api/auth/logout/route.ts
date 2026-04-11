export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  const response = NextResponse.json({ ok: true });

  const expired = "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax";
  const expiredSecure = "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax";

  // NextAuth v5 cookie names (authjs prefix)
  response.headers.append("Set-Cookie", `authjs.session-token${expired}`);
  response.headers.append("Set-Cookie", `__Secure-authjs.session-token${expiredSecure}`);
  response.headers.append("Set-Cookie", `authjs.csrf-token${expired}`);
  response.headers.append("Set-Cookie", `__Secure-authjs.csrf-token${expiredSecure}`);
  response.headers.append("Set-Cookie", `authjs.callback-url${expired}`);
  response.headers.append("Set-Cookie", `__Secure-authjs.callback-url${expiredSecure}`);
  // NextAuth v4 names just in case
  response.headers.append("Set-Cookie", `next-auth.session-token${expired}`);
  response.headers.append("Set-Cookie", `__Secure-next-auth.session-token${expiredSecure}`);

  return response;
}
