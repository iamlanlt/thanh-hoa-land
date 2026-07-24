import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/auth-core";
import { MAP_SERVICES } from "@/lib/map-config";

function createRequestPolicy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const isDevelopment = process.env.NODE_ENV !== "production";
  const contentSecurityPolicy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.tile.openstreetmap.org https://unpkg.com",
    "font-src 'self' data:",
    `connect-src 'self'${isDevelopment ? " ws: wss:" : ""} https://api.cloudinary.com https://www.google-analytics.com https://region1.google-analytics.com https://vitals.vercel-insights.com ${MAP_SERVICES.nominatimOrigin}`,
    "frame-src https://www.google.com https://maps.google.com https://www.youtube-nocookie.com https://player.vimeo.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);
  return { contentSecurityPolicy, requestHeaders };
}

function applyPolicy(
  response: NextResponse,
  contentSecurityPolicy: string,
  noIndex = false,
) {
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  if (noIndex) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const policy = createRequestPolicy(request);
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
    return applyPolicy(
      NextResponse.next({ request: { headers: policy.requestHeaders } }),
      policy.contentSecurityPolicy,
      pathname.startsWith("/admin"),
    );
  }
  const valid = await verifyAdminSession(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (valid) {
    return applyPolicy(
      NextResponse.next({ request: { headers: policy.requestHeaders } }),
      policy.contentSecurityPolicy,
      isAdminPage,
    );
  }
  if (isAdminPage) {
    const response = NextResponse.redirect(
      new URL("/admin/login", request.url),
    );
    return applyPolicy(response, policy.contentSecurityPolicy, true);
  }
  return applyPolicy(
    NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    policy.contentSecurityPolicy,
  );
}

export const config = {
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|icon.svg|sitemap.xml|robots.txt).*)",
    },
  ],
};
