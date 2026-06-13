import { NextResponse } from "next/server";

const SESSION_COOKIE = "yungdrip_session";

const protectedPrefixes = ["/account", "/checkout"];
const adminPrefix = "/admin";

function isProtectedPath(pathname) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isAdminPath(pathname) {
  return pathname === adminPrefix || pathname.startsWith(`${adminPrefix}/`);
}

async function fetchSessionUser(request) {
  const sessionUrl = new URL("/api/auth/session", request.url);

  try {
    const response = await fetch(sessionUrl, {
      headers: {
        cookie: request.headers.get("cookie") || ""
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return payload.user || null;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname) && !isAdminPath(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;

  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const user = await fetchSessionUser(request);

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
    return response;
  }

  if (isAdminPath(pathname) && !user.isAdmin) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/checkout/:path*", "/admin/:path*"]
};
