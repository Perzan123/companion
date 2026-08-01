import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "companion_session";
const PUBLIC_PATHS = ["/unlock", "/api/auth/verify"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublic) return NextResponse.next();

  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;
  const expectedToken = process.env.SESSION_TOKEN;

  if (!sessionCookie || !expectedToken || sessionCookie !== expectedToken) {
    const unlockUrl = new URL("/unlock", request.url);
    unlockUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(unlockUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except static assets and Next internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
