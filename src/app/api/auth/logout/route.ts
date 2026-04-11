export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Use NEXTAUTH_URL to avoid Netlify deploy-preview URL issues
  const base = process.env.NEXTAUTH_URL ?? `https://${req.headers.get("x-forwarded-host") ?? req.headers.get("host")}`;
  const response = NextResponse.redirect(`${base}/login`);

  // Parse every cookie from the request and delete them all
  const cookieHeader = req.headers.get("cookie") ?? "";
  if (cookieHeader) {
    const names = cookieHeader.split(";").map((c) => c.trim().split("=")[0]);
    for (const name of names) {
      response.cookies.set(name, "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
    }
  }

  return response;
}
