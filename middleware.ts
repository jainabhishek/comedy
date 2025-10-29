import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = new Set(["/", "/favicon.ico", "/auth/signin", "/auth/error"]);
const PUBLIC_PREFIXES = ["/api/auth/", "/_next/", "/icon", "/apple-icon"];

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) {
    return true;
  }

  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith("/auth/");
  const isPublic = isPublicPath(pathname);

  const secret = process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET;

  const cookieName = req.cookies.has("__Secure-authjs.session-token")
    ? "__Secure-authjs.session-token"
    : req.cookies.has("authjs.session-token")
      ? "authjs.session-token"
      : undefined;

  const token = await getToken({
    req,
    secret,
    cookieName,
  });

  if (isAuthPage) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (!isPublic && !token) {
    const signInUrl = new URL("/auth/signin", req.url);
    const search = req.nextUrl.search || "";
    const hash = req.nextUrl.hash || "";
    const callbackUrl = `${pathname}${search}${hash}` || "/dashboard";
    signInUrl.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

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
