import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { APP_ROLES, authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/features",
  "/pricing",
  "/faq",
  "/blog",
  "/contact",
  "/book-demo",
  "/download-apk",
  "/patient/register",
  "/api/clinics/public",
];

const authApiRoutes = [
  "/api/auth/register",
  "/api/auth/register-patient",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/resend-verification",
];

function isPublicRoute(pathname: string) {
  return (
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    ) || authApiRoutes.some((route) => pathname.startsWith(route))
  );
}

function applyCorsHeaders(req: Request, res: NextResponse) {
  const origin = req.headers.get("origin");
  if (origin) {
    res.headers.set("Access-Control-Allow-Origin", origin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Accept, X-Requested-With"
    );
  }
  return res;
}

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (req.method === "OPTIONS" && pathname.startsWith("/api/")) {
    const preflight = new NextResponse(null, { status: 204 });
    return applyCorsHeaders(req, preflight);
  }

  if (pathname.startsWith("/api/auth")) {
    return applyCorsHeaders(req, NextResponse.next());
  }

  if (pathname.startsWith("/api/") && isPublicRoute(pathname)) {
    return applyCorsHeaders(req, NextResponse.next());
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== APP_ROLES.SUPER_ADMIN) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/patient") && !pathname.startsWith("/patient/register")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role === APP_ROLES.SUPER_ADMIN) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    }
    if (role === APP_ROLES.PATIENT) {
      return NextResponse.redirect(new URL("/patient/dashboard", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (
    (pathname.startsWith("/api/clinics") && !pathname.startsWith("/api/clinics/public")) ||
    pathname.startsWith("/api/admin")
  ) {
    if (!isLoggedIn || role !== APP_ROLES.SUPER_ADMIN) {
      return applyCorsHeaders(
        req,
        NextResponse.json(
          { success: false, message: "Forbidden" },
          { status: 403 }
        )
      );
    }
    return applyCorsHeaders(req, NextResponse.next());
  }

  if (
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/settings") ||
    pathname.startsWith("/api/sessions") ||
    pathname.startsWith("/api/me") ||
    pathname.startsWith("/api/roles") ||
    pathname.startsWith("/api/permissions") ||
    pathname.startsWith("/api/patients") ||
    pathname.startsWith("/api/appointments") ||
    pathname.startsWith("/api/doctors") ||
    pathname.startsWith("/api/dashboard") ||
    pathname.startsWith("/api/treatments") ||
    pathname.startsWith("/api/prescriptions") ||
    pathname.startsWith("/api/notifications") ||
    pathname.startsWith("/api/patient")
  ) {
    if (!isLoggedIn) {
      return applyCorsHeaders(
        req,
        NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        )
      );
    }
    return applyCorsHeaders(req, NextResponse.next());
  }

  if (isPublicRoute(pathname)) {
    if (
      isLoggedIn &&
      (pathname === "/login" || pathname === "/register")
    ) {
      const redirectUrl =
        role === APP_ROLES.SUPER_ADMIN
          ? "/admin"
          : role === APP_ROLES.PATIENT
          ? "/patient/dashboard"
          : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/patient/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/api/:path*",
  ],
};
