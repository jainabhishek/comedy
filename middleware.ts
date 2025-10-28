import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const PUBLIC_PATHS = new Set(["/", "/favicon.ico", "/auth/signin", "/auth/error"]);
const PUBLIC_PREFIXES = ["/api/auth/", "/_next/", "/icon", "/apple-icon"];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default withAuth(
  (req) => {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (pathname.startsWith("/auth/")) {
      if (token) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    if (!token && !isPublicPath(pathname)) {
      const signInUrl = new URL("/auth/signin", req.url);
      const search = req.nextUrl.search || "";
      const hash = req.nextUrl.hash || "";
      const callbackUrl = `${pathname}${search}${hash}` || "/dashboard";
      signInUrl.searchParams.set("callbackUrl", callbackUrl);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (pathname.startsWith("/auth/") || isPublicPath(pathname)) {
          return true;
        }

        return Boolean(token);
      },
    },
  }
);

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
