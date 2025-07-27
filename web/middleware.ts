// middleware.ts (in your project root)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = [
    "/dashboard",
    "/bitdefender",
    "/encryptor",
    "/profile",
    // Add more protected routes as needed
  ];

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",
    "/auth/login",
    "/auth/register",
    "/api/auth/login",
    "/api/auth/register",
    "/api/mock/auth/login",
    "/api/mock/auth/register",
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  // Get token from cookies or localStorage (if using cookies)
  const token = request.cookies.get("auth-token")?.value;

  // If it's a protected route and no token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (token && (pathname === "/auth/login" || pathname === "/auth/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
