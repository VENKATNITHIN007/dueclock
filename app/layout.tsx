import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Script from "next/script";
import RegisterSW from "@/components/Register";

// Optimize font loading
const inter = Inter({ 
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// for google analytics
const MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// for pwa
export const metadata: Metadata = {
  title: "DueClock – Smart CA Due Date Tracker",
  description: "One simple place to manage due dates and client follow-ups.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {MEASUREMENT_ID && <link rel="preconnect" href="https://www.googletagmanager.com" />}
        
        {/* Force favicon / icons to be visible to crawlers and browsers */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icon-512x512.png"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="canonical" href="https://dueclock.in/" />

        {/* Social preview (helps Google choose correct title/description) */}
        <meta
          property="og:title"
          content="DueClock – Smart CA Due Date Tracker"
        />
        <meta
          property="og:description"
          content="One simple place to manage due dates and client follow-ups."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://dueclock.in/" />
        <meta name="twitter:card" content="summary" />

        {/* Google Analytics - only load config if MEASUREMENT_ID exists */}
        {MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
      </head>

      <body className={`${inter.variable} antialiased font-sans`}>
        <Providers>
          {children}
          <RegisterSW />
        </Providers>
      </body>
    </html>
  );
}
