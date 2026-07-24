import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/auth-core";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminPage =
    pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isPropertyRead =
    pathname === "/api/properties" && request.method === "GET";
  const isPublicLeadCreate =
    pathname === "/api/leads" && request.method === "POST";
  const isAdminSession = pathname === "/api/admin/session";
  const isProtectedApi =
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/properties") ||
    pathname.startsWith("/api/leads");
  const needsAuth =
    isAdminPage ||
    (isProtectedApi &&
      !isAdminSession &&
      !isPropertyRead &&
      !isPublicLeadCreate);
  if (!needsAuth) {
    const response = NextResponse.next();
    if (pathname.startsWith("/admin"))
      response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }
  const valid = await verifyAdminSession(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (valid) {
    const response = NextResponse.next();
    if (isAdminPage)
      response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }
  if (isAdminPage) {
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url),
    );
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    return response;
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/properties",
    "/api/properties/:path*",
    "/api/leads",
    "/api/leads/:path*",
    "/api/admin/:path*",
  ],
};
