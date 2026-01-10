// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";



// Allow only common static file extensions (images, fonts, css, js)
const STATIC_FILE_EXT_RE = /\.(png|jpg|jpeg|webp|avif|svg|gif|ico|css|js|map|woff2?)$/i;

const PUBLIC_ASSET_PREFIXES = [
  "/favicon.ico",
  "/manifest.webmanifest",
  "/robots.txt",
  "/apple-touch-icon",
  "/android-chrome",
  "/sitemap",
  "/icon-",
];

const PUBLIC_PAGES = ["/", "/login", "/contactus", "/terms", "/privacy", "/refund", "/app/onboarding"];

// Public API routes that don't require authentication
const PUBLIC_API_ROUTES = [
  "/api/auth",
  // Removed /api/invite/accept - now uses /api/invite/join which requires auth
];

export default withAuth(
  (req) => {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If user is authenticated but doesn't have a firmId, redirect to onboarding
    if (token && !token.firmId && !pathname.startsWith("/app/onboarding") && pathname.startsWith("/app/")) {
      return NextResponse.redirect(new URL("/app/onboarding", req.url));
    }

    // If user has firmId and is on onboarding page, redirect to firm
    if (token?.firmId && pathname === "/app/onboarding") {
      return NextResponse.redirect(new URL("/app/firm", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ req, token }) {
        const { pathname } = req.nextUrl;

        // 1) static files (images, css, js) -> public
        if (STATIC_FILE_EXT_RE.test(pathname)) return true;

        // 2) specific public asset prefixes -> public
        if (PUBLIC_ASSET_PREFIXES.some(p => pathname.startsWith(p))) return true;

        // 3) public API routes (next-auth, invite accept) -> public
        if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) return true;

        // 4) public pages -> public
        if (PUBLIC_PAGES.some(p => pathname === p || pathname.startsWith(p + "/"))) return true;


        // 6) onboarding page -> allow authenticated users (will redirect if they have firm)
        if (pathname.startsWith("/app/onboarding")) return Boolean(token);

        // 7) otherwise, user must be logged in
        return Boolean(token);
      },
    },
  }
);

// Exclude heavy static folders from middleware entirely for performance
// Also exclude API routes (they handle auth internally)
export const config = {
  matcher: ['/((?!_next/static|_next/image|api/auth).*)'],
};
