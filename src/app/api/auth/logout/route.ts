export const runtime = "nodejs";

import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "").split(":")[0];

  const base = `=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  const secure = `${base}; HttpOnly; Secure; SameSite=Lax`;
  const secureWithDomain = `${base}; Domain=${host}; HttpOnly; Secure; SameSite=Lax`;

  const cookiesToClear = [
    // __Host- prefix: must NOT have Domain attribute
    `__Host-authjs.csrf-token${secure}`,
    // __Secure- prefix: try both with and without Domain
    `__Secure-authjs.session-token${secure}`,
    `__Secure-authjs.session-token${secureWithDomain}`,
    `__Secure-authjs.callback-url${secure}`,
    `__Secure-authjs.callback-url${secureWithDomain}`,
  ];

  const headers = new Headers({
    "Content-Type": "text/html",
    "Cache-Control": "no-store",
  });

  for (const c of cookiesToClear) {
    headers.append("Set-Cookie", c);
  }

  return new Response(
    `<!DOCTYPE html><html><head>
      <meta http-equiv="refresh" content="0;url=/login">
    </head><body></body></html>`,
    { status: 200, headers }
  );
}
