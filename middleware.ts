import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    // the callback authorized runs first then after middleware function in runned
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;
        if (pathname.startsWith("/api/auth")) return true;

        // Explicit public pages that should NOT require auth
        const publicPages = [
          "/",         // homepage
          "/login",    // login page
          "/contactus" // contact page
        ];

        if (publicPages.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
          return true;
        }

        return !!token
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|manifest.webmanifest).*)",
  ],
};