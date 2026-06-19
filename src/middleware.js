import { NextResponse } from "next/server";

const COOKIE_NAME = process.env.COOKIE_NAME || "bidlive_token";

/**
 * Edge middleware does coarse routing protection only — it cannot verify the
 * JWT signature (jsonwebtoken isn't edge-safe). It checks cookie presence and
 * decodes the unverified payload for role-based redirects. Real enforcement is
 * done server-side in route handlers via requireUser()/requireAdmin().
 */
function decodePayload(token) {
  try {
    const part = token.split(".")[1];
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? decodePayload(token) : null;

  const isAuthed = !!payload?.id;
  const isAdmin = payload?.role === "admin";

  // Protected user areas
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthed) return redirectToLogin(req);
  }

  // Admin area
  if (pathname.startsWith("/admin")) {
    if (!isAuthed) return redirectToLogin(req);
    if (!isAdmin) return NextResponse.redirect(new URL("/", req.url));
  }

  // Logged-in users shouldn't see auth pages
  if ((pathname === "/login" || pathname === "/register") && isAuthed) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

function redirectToLogin(req) {
  const url = new URL("/login", req.url);
  url.searchParams.set("next", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};
