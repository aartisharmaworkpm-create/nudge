export const runtime = "nodejs";

import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const cookies = [
    `__Secure-authjs.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`,
    `__Host-authjs.csrf-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`,
    `__Secure-authjs.callback-url=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=Lax`,
  ];

  const headers = new Headers({
    "Content-Type": "text/html",
    "Cache-Control": "no-store",
  });

  for (const c of cookies) {
    headers.append("Set-Cookie", c);
  }

  // 200 HTML response — Netlify won't swallow Set-Cookie on a 200.
  // Meta-refresh navigates to /login after browser has applied the cookies.
  return new Response(
    `<!DOCTYPE html><html><head>
      <meta http-equiv="refresh" content="0;url=/login">
    </head><body></body></html>`,
    { status: 200, headers }
  );
}
