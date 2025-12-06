// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Matches any file with an extension (example: .png, .jpg, .webp, .css, .js)
// Means: all images/static files are allowed publicly
const PUBLIC_FILE = /\.(.*)$/;

// List of known static assets that should bypass auth
const PUBLIC_ASSET_PREFIXES = [
  "/_next/",
  "/favicon.ico",
  "/manifest.webmanifest",
  "/robots.txt",
  "/apple-touch-icon",
  "/android-chrome",
  "/sitemap",
  "/icon-",
];

// Wrap middleware with NextAuth for automatic token checking
export default withAuth(
  function middleware() {
    return NextResponse.next(); // just continue the request
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;

        // 1) Allow any static file (like /hero.webp or /images/ss.jpg)
        if (PUBLIC_FILE.test(pathname)) {
          return true;
        }

        // 2) Allow all known public assets and Next.js internals
        if (PUBLIC_ASSET_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
          return true;
        }

        // 3) Allow authentication API routes
        if (pathname.startsWith("/api/auth")) return true;

        // 4) Public pages that do not need login
        const publicPages = ["/", "/login", "/contactus"];
        if (publicPages.some(p => pathname === p || pathname.startsWith(p + "/"))) {
          return true;
        }

        // 5) All other routes require a valid login token
        return !!token;
      },
    },
  }
);

// Matcher tells which requests should run through middleware
export const config = {
  matcher: [
    // Run middleware on all routes EXCEPT next static, next image, favicon, manifest, robots, auth
    '/((?!_next/static|_next/image|favicon.ico|icon-|android-chrome|apple-touch-icon|manifest.webmanifest|robots.txt|api/auth).*)',
  ],
};
