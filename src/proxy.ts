import { NextRequest, NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/login", "/signup", "/", "/api/auth", "/api/webhooks"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Handle logout: clear session cookies and redirect to login
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.set("__Secure-authjs.session-token", "", { maxAge: 0, path: "/", secure: true, httpOnly: true, sameSite: "lax" });
    response.cookies.set("__Host-authjs.csrf-token", "", { maxAge: 0, path: "/", secure: true, httpOnly: true, sameSite: "lax" });
    response.cookies.set("__Secure-authjs.callback-url", "", { maxAge: 0, path: "/", secure: true, sameSite: "lax" });
    return response;
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!req.auth && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (req.auth && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
