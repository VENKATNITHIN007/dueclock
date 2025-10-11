import type { Metadata,Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import Script from "next/script";
import RegisterSW from "@/components/Register";


const MEASUREMENT_ID=process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const metadata: Metadata = {
  title: 'DueClock – Smart CA Due Date Tracker',
  description: 'One simple place to manage due dates and client follow-ups.',
  manifest: '/manifest.webmanifest',
 icons: {
    icon: '/favicon.ico',          // main favicon (for browsers)
    shortcut: '/favicon.ico',      // windows / some browsers
    apple: '/icon-192.png',        // apple-touch-icon
  },
  themeColor: '#000000',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale:1,
  userScalable:false,
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
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

      </head>
     
      <body
        className="antialiased">
        <Providers>
            {children}
            <RegisterSW></RegisterSW>
         
          </Providers>
      </body>
    </html>
  );
}

