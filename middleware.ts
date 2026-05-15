import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ACCESS_TOKEN_COOKIE_NAME } from "@/lib/auth/access-token-cookie";

/**
 * Solo comprueba presencia del cookie HttpOnly `access_token`.
 * La autorización real sigue siendo GET /auth/profile en cliente (TanStack Query).
 */
export function middleware(request: NextRequest) {
  const hasToken = request.cookies.has(ACCESS_TOKEN_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    if (!hasToken) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname === "/register" && hasToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (pathname === "/login" && hasToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
