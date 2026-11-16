import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const role = token?.role;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isStudentRoute = pathname.startsWith("/student");
  const isTeacherRoute = pathname.startsWith("/teacher");
  const isAdminRoute = pathname.startsWith("/admin");

  // 1. If user is already authenticated and visits login/register, redirect to their role dashboard
  if (isAuthPage && isAuthenticated) {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    if (role === "TEACHER") {
      return NextResponse.redirect(new URL("/teacher/dashboard", req.url));
    }
    return NextResponse.redirect(new URL("/student/dashboard", req.url));
  }

  // 2. Protect Student routes
  if (isStudentRoute) {
    if (!isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname + search);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
    }
    if (role !== "STUDENT" && role !== "ADMIN") {
      // Forbidden: redirect to their own dashboard
      const redirectPath = role === "TEACHER" ? "/teacher/dashboard" : "/";
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
  }

  // 3. Protect Teacher routes
  if (isTeacherRoute) {
    if (!isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname + search);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
    }
    if (role !== "TEACHER" && role !== "ADMIN") {
      const redirectPath = role === "STUDENT" ? "/student/dashboard" : "/";
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
  }

  // 4. Protect Admin routes
  if (isAdminRoute) {
    if (!isAuthenticated) {
      const callbackUrl = encodeURIComponent(pathname + search);
      return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, req.url));
    }
    if (role !== "ADMIN") {
      const redirectPath = role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard";
      return NextResponse.redirect(new URL(redirectPath, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/student/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
