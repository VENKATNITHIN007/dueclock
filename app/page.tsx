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
<header className="sticky top-0 z-50 w-full bg-slate-800  border-b border-gray-200 shadow-sm">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-14">
      
      {/* Bold Logo */}
      <div className="text-xl font-bold leading-tight">
        <span className="bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
                Dueclock
              </span>
      </div>

      {/* Desktop Menu */}
      <nav className="flex items-center space-x-8">
        <a 
          href="#features" 
          className="font-semibold text-white  hover:text-blue-200 transition-colors text-sm"
        >
          Features
        </a>
        <a 
          href="#how" 
          className="font-semibold text-white hover:text-blue-200 transition-colors text-sm"
        >
          How It Works
        </a>
        <a 
          href="#hire-me" 
          className="hidden sm:block font-semibold text-white hover:text-blue-200 transition-colors text-sm"
        >
          Hire Me
        </a>
        <div className="hidden sm:block ml-4 ">
          <SignInButton />
        </div>
      </nav>


     
    </div>
  </div>
</header>

      {/* HERO */}
      <section className="w-full bg-purple-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-20 grid md:grid-cols-2 gap-10 items-center">
          {/* Left side */}
          <div className="space-y-6 text-center md:text-left flex flex-col items-center md:items-start">
            <div className="inline-flex items-center rounded-full border border-orange-300 bg-orange-100 px-3 py-1 text-[11px] font-medium text-orange-600">
              ⏰ Replace messy spreadsheets with one clean dashboard
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Track recurring deadlines and client follow-ups with{" "}
              <span className="bg-gradient-to-r from-orange-500 to-blue-500 bg-clip-text text-transparent">
                Dueclock
              </span>
            </h1>

            <p className="text-slate-600 text-lg max-w-xl">
              See urgent, overdue and completed work, filter by label or period,
              and let Dueclock create the next due date automatically when you
              finish a task.
            </p>

            <div className="w-full flex flex-col md:flex-row gap-3 justify-center md:justify-start items-center md:items-start">
              <SignInButton />
              <a
                href="#hire-me"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Talk to me about a project
              </a>
            </div>

            <p className="text-xs text-slate-500">
              Try the live app with Google sign-in. No long setup, just your
              first due dates.
            </p>
          </div>

          {/* Right side – dashboard screenshot placeholder */}
          <div className="relative">
            <div className="rounded-2xl border border-slate-300 bg-white shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                <span className="text-[11px] text-slate-600">
                  Dueclock • Dashboard
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">
                  MVP live
                </span>
              </div>
              <div className="p-4">
                <Image
                  src="/dashboardd.webp"
                  alt="Dueclock dashboard showing urgent, overdue and completed due dates"
                  width={900}
                  height={600}
                  className="w-full h-auto rounded-lg border border-slate-200 object-cover"
                />
                <p className="mt-2 text-[11px] text-slate-500">
                  Screenshot from the live MVP — urgent, overdue and completed
                  work in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* FEATURES SECTION – recursion, filters, communication */}
        <FeaturesSectionDemo />

        {/* HOW IT WORKS SECTION */}
        <section
          id="how"
          className="py-16 border-t border-slate-200 mt-4 space-y-10"
        >
          <div className="max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
              How to use Dueclock (in 6 simple steps)
            </h2>
            <p className="mt-3 text-sm md:text-base text-slate-600">
              You don&apos;t need training documents or a big setup. Dueclock is
              built so a CA, freelancer or business owner can start using it in
              a few minutes.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 items-start">
            {/* Steps */}
            <ol className="space-y-4 text-sm md:text-[15px] text-slate-700">
              {[
                {
                  title: "Sign in with your Google account",
                  body: "Click “Continue with Google” and you’ll land directly on your dashboard. No long onboarding.",
                },
                {
                  title: "Add your first client",
                  body: "Create a client with basic details so all their due dates are grouped in one place.",
                },
                {
                  title: "Create a due date with a label & recurrence",
                  body: "Pick a label like GST, TDS, IT return or fees. Choose how often it repeats: monthly, quarterly, yearly or none.",
                },
                {
                  title: "Use filters to see what matters today",
                  body: "Filter by label, period (week/month/quarter) or client to focus only on the work you want to finish now.",
                },
                {
                  title: "Complete work and let Dueclock create the next date",
                  body: "When a task is done, mark it as completed. Dueclock immediately creates the next due date based on your rule.",
                },
                {
                  title: "Remind clients and export if needed",
                  body: "Use the contact button to open WhatsApp or email with a ready-made message, or export all due dates to CSV for reports.",
                },
              ].map((step, idx) => (
                <li key={step.title} className="flex gap-3">
                  <div className="mt-1">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-r from-orange-500 to-blue-500 text-white flex items-center justify-center text-xs font-semibold">
                      {idx + 1}
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{step.title}</p>
                    <p className="text-slate-600 mt-1">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Video card */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-slate-50">
              <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-600">
                  Watch a quick walkthrough
                </span>
                <span className="text-[11px] text-orange-500 font-medium">
                  1 min demo
                </span>
              </div>
              <div className="w-full">
                <iframe
                  className="w-full aspect-video"
                  src="https://youtube.com/embed/Yi0qPSUk8pw?si=ugoHz2HaesXVwjMm"
                  title="Dueclock demo"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </section>

        {/* HIRE ME / WORK WITH ME */}
        <section
          id="hire-me"
          className="py-14 sm:py-16 border-t border-slate-200 mt-4"
        >
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Need a similar tool or website for your business?
              </h2>
              <p className="text-sm md:text-base text-slate-600">
                I built Dueclock end-to-end: dashboard, filters,
                recurring logic, CSV export and WhatsApp/email actions. If you
                want a custom tool for your workflow, I can build it with the
                same care.
              </p>
              <p className="text-sm md:text-base text-slate-600">
                Good fit if you&apos;re someone looking for simple mvp to test your product within few days
              </p>
              <ul className="mt-3 space-y-2 text-sm md:text-[15px] text-slate-700">
                <li>• authentication and panels</li>
                <li>• Small SaaS MVPs & automation-heavy tools</li>
                <li>• Clean landing pages to test new ideas</li>
              </ul>
              <div className="flex flex-wrap gap-3 pt-3">
                {/* Keep portfolio if you like; it’s optional */}
                {/* <a
                  href="https://venkatnithin.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-slate-50 hover:bg-slate-800"
                >
                  See more of my work
                </a> */}
                {/* Replace with your real contact info */}
                <a
                  href="mailto:venkatnithinprof@gmail.com"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  Email me about a project
                </a>
                <a
                  href="https://wa.me/917090245208"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                  Chat on WhatsApp
                </a>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Send a short note about what you&apos;re trying to build and
                your rough budget. I&apos;ll reply with a simple plan instead of
                overcomplicating things.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 space-y-4 text-sm md:text-[15px] text-slate-700">
              <h3 className="font-semibold text-slate-900">
                What working with me looks like
              </h3>
              <ul className="list-disc list-inside space-y-2">
                <li>A working prototype, not just designs</li>
                <li>Simple UX focused on your real daily use</li>
                <li>Regular updates over WhatsApp/email</li>
                <li>Honest scope, timelines and limitations</li>
              </ul>
              <p className="pt-2">
                If you like how Dueclock feels, we can use it as a base
                reference and customise a similar system for your team or your
                idea.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="mt-8 w-full bg-black text-slate-300">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm">
          <p>© {new Date().getFullYear()} Dueclock. All rights reserved.</p>
          <p>
            Built by <span className="text-orange-400">Venkat Nithin</span>
          </p>
        </div>
      </footer>
    </main>
  );
}
