import { NextResponse } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = new Set(["/", "/favicon.ico", "/auth/signin", "/auth/error"]);
const PUBLIC_PREFIXES = ["/api/auth/", "/_next/", "/icon", "/apple-icon"];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith("/auth/");
  const isPublic = isPublicPath(pathname);
  const isAuthenticated = Boolean(req.auth);

  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (!isAuthPage && !isPublic && !isAuthenticated) {
    const signInUrl = new URL("/auth/signin", req.nextUrl);
    const search = req.nextUrl.search || "";
    const hash = req.nextUrl.hash || "";
    const callbackUrl = `${pathname}${search}${hash}` || "/dashboard";
    signInUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
