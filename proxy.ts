import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip auth check for sign-in page, API routes, and static assets
  if (
    pathname.includes("/sign-in") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/_vercel") ||
    pathname.includes(".")
  ) {
    return intlMiddleware(request);
  }

  // Check for demo session cookie
  const session = request.cookies.get("marsshot_session")?.value;
  if (!session || session !== "demo_authenticated") {
    const signInUrl = new URL("/en/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
