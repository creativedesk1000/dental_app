import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

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
];

const authApiRoutes = [
  "/api/auth/register",
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

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/") && isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role !== Role.SUPER_ADMIN) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (role === Role.SUPER_ADMIN) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/clinics") ||
    pathname.startsWith("/api/admin")
  ) {
    if (!isLoggedIn || role !== Role.SUPER_ADMIN) {
      return NextResponse.json(
        { success: false, message: "Forbidden" },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/api/users") ||
    pathname.startsWith("/api/settings") ||
    pathname.startsWith("/api/sessions") ||
    pathname.startsWith("/api/me") ||
    pathname.startsWith("/api/roles") ||
    pathname.startsWith("/api/permissions")
  ) {
    if (!isLoggedIn) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    if (
      isLoggedIn &&
      (pathname === "/login" || pathname === "/register")
    ) {
      const redirectUrl =
        role === Role.SUPER_ADMIN ? "/admin" : "/dashboard";
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
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/api/clinics/:path*",
    "/api/admin/:path*",
    "/api/users/:path*",
    "/api/settings/:path*",
    "/api/sessions/:path*",
    "/api/me",
    "/api/roles",
    "/api/permissions",
    "/api/auth/change-password",
    "/api/auth/logout",
  ],
};
