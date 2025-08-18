import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if admin routes are enabled
  const adminEnabled = process.env.ADMIN_ENABLED === "true";

  // Block all admin routes if ADMIN_ENABLED is false
  if (pathname.startsWith("/admin") || pathname.startsWith("/register")) {
    if (!adminEnabled) {
      // Option 1: Return 404 (makes it look like route doesn't exist)
      //   return new NextResponse("Not Found", { status: 404 });

      // Option 2: Redirect to home page
      return NextResponse.redirect(new URL("/_not-found", request.url));

      // Option 3: Return a custom "Feature Disabled" page
      // return NextResponse.redirect(new URL('/feature-disabled', request.url));

      // Option 4: Return custom response with message
      // return NextResponse.json(
      //   { error: 'Admin panel is currently disabled' },
      //   { status: 403 }
      // );
    }

    // If admin is enabled, continue with normal admin route protection
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Check for admin token in cookies or headers for other admin routes
    const token =
      request.cookies.get("adminToken")?.value ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/register",
    // Add other protected routes here
  ],
};
