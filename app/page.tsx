import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignInButton from "@/components/auth/login";
import FeaturesSectionDemo from "@/components/ui/features-section-demo-3";
import Image from "next/image";
import React from "react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/app/dashboard");

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* HEADER – full width light background */}
      <header className="w-full bg-slate-200 border-b border-slate-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-between w-full sm:w-auto gap-2">
            {/* Logo / Brand */}
            <span className="font-extrabold text-xl md:text-2xl tracking-tight bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 bg-clip-text text-transparent">
              Dueclock
            </span>
          </div>

          <nav className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-6 text-xs sm:text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900">
              Features
            </a>
            <a href="#how" className="hover:text-slate-900">
              How it works
            </a>
            {/* Continue with Google in header */}
            <SignInButton />
          </nav>
        </div>
      </header>

      {/* HERO – full width light background */}
      <section className="w-full bg-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-20 grid md:grid-cols-2 gap-10 items-center">
          {/* Left side */}
          <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="inline-flex items-center rounded-full border border-orange-300 bg-orange-100 px-3 py-1 text-[11px] font-medium text-orange-600">
              ⏰ Never miss a due date again
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Track deadlines easily with{" "}
              <span className="bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
                Dueclock
              </span>
            </h1>

            <p className="text-slate-600 text-lg max-w-xl">
              Manage due dates, clients, and follow-ups without spreadsheets or
              endless chat scrolling.
            </p>

            {/* Continue with Google in hero (centered on mobile, left on desktop) */}
            <div className="w-full flex justify-center md:justify-start">
              <SignInButton />
            </div>

            <p className="text-xs text-slate-500">
              Get started in under a minute — just sign in with Google.
            </p>
          </div>

          {/* Right side – preview card */}
          <div className="relative">
            <div className="rounded-2xl border border-slate-300 bg-white shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                <span className="text-[11px] text-slate-600">
                  Dueclock • Dashboard
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">
                  On track
                </span>
              </div>
              <div className="p-4">
                <Image
                  src="/dashboardd.webp"
                  alt="Dueclock dashboard preview"
                  width={900}
                  height={600}
                  className="w-full h-auto rounded-lg border border-slate-200 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT (white background, centered) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* FEATURES SECTION */}
        <FeaturesSectionDemo />

        {/* HOW IT WORKS */}
      </div>

      {/* FOOTER – full width dark */}
      <footer className="mt-8 w-full bg-black text-slate-300">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm">
          <p>© {new Date().getFullYear()} Dueclock. All rights reserved.</p>
          <p>
            Built by{" "}
            <a
              href="https://venkatnithin.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="text-orange-400 hover:text-blue-300 underline-offset-2 hover:underline"
            >
              Venkat Nithin
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
