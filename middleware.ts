// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Allowlist for static/public assets we do NOT want auth to intercept.
 * Keep this list minimal but include favicon, icons, manifest, robots, and next internals.
 */
const PUBLIC_ASSET_PREFIXES = [
  "/_next/",            // next internals
  "/favicon.ico",
  "/icon-",             // icon-192.png, icon-512.png
  "/manifest.webmanifest",
  "/robots.txt",
  "/apple-touch-icon",  // some platforms
  "/android-chrome",    // android-chrome-192x192.png etc.
  "/sitemap",           // sitemap.xml
];

export default withAuth(
  function middleware() {
    // If you need any runtime logic after authorization, put it here.
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;

        // Always allow next internals and public assets (fast bypass)
        if (PUBLIC_ASSET_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
          return true;
        }

        // Allow auth-related endpoints
        if (pathname.startsWith("/api/auth")) return true;

        // Explicit public pages
        const publicPages = [
          "/",         // homepage
          "/login",    // login page
          "/contactus" // contact page
        ];
        if (publicPages.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
          return true;
        }

        // Otherwise require a token
        return !!token;
      },
    },
  }
);

/**
 * Config matcher: run middleware for everything EXCEPT the excluded static paths.
 * Note: keep this negative-lookahead list in sync with PUBLIC_ASSET_PREFIXES above.
 */
export const config = {
  matcher: [
    /*
     * Protect everything except:
     *  - _next/static and _next/image
     *  - favicon and icon-* and manifest and robots
     *  - api/auth
     */
    '/((?!_next/static|_next/image|favicon.ico|icon-|android-chrome|apple-touch-icon|manifest.webmanifest|robots.txt|api/auth).*)',
  ],
};
