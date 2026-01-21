import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {
  Users,
  CheckCircle,
  FileCheck,
  Bell, 
  Mail
} from "lucide-react";
import { PricingDialog } from "@/components/landing/PricingDialog";
import SignInButton from "@/components/auth/login";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/app/duedates");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* TOPBAR */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#f97316" strokeWidth="2" fill="#f97316" fillOpacity="0.1"/>
                <line x1="3" y1="9" x2="21" y2="9" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="8" cy="14" r="1" fill="#f97316"/>
                <circle cx="12" cy="14" r="1" fill="#f97316"/>
                <circle cx="16" cy="14" r="1" fill="#f97316"/>
                <circle cx="8" cy="18" r="1" fill="#f97316"/>
                <circle cx="12" cy="18" r="1" fill="#f97316"/>
              </svg>
              <span className="font-bold text-orange-500 text-xl tracking-tight">Dueclock</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-orange-400 transition-colors">
                Features
              </a>
              <PricingDialog>
                <button className="text-sm font-medium text-slate-300 hover:text-orange-400 transition-colors">
                  Pricing
                </button>
              </PricingDialog>
            </nav>
            <div className=" hidden md:block">
              <SignInButton />
            </div>
          </div>
        </div>
      </header>

      {/* HERO */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
          {/* Simplified background elements - removed blur for performance */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/5 rounded-full" aria-hidden="true"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600/5 rounded-full" aria-hidden="true"></div>
          </div>
          
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center min-h-[70vh] py-10">
            <div className="flex flex-col items-center md:items-start justify-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center md:text-left leading-tight mb-4">
                Never Miss a <span className="text-orange-500">Client Deadline</span> Again
              </h1>
              <p className="text-base sm:text-lg text-slate-300 text-center md:text-left max-w-2xl mb-6">
                Track client documents, deadlines, and communication with your team — all in one place for CA Firms.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <SignInButton />
                <PricingDialog>
                  <button className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl font-semibold text-base bg-slate-800 border-2 border-orange-500/30 text-orange-400 hover:bg-slate-700 hover:border-orange-500 transition-colors duration-200">
                    View Pricing
                  </button>
                </PricingDialog>
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6 text-xs text-slate-400">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Free up to 10 clients
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                   Only google account required
                </span>
              </div>
            </div>
            {/* Demo Video Placeholder */}
            <div className="flex items-center justify-center w-full h-full">
              <div className="relative w-full aspect-video max-w-md rounded-2xl border-2 border-orange-500/30 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl flex items-center justify-center group cursor-pointer hover:border-orange-500/50 transition-colors duration-200">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-500 shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <svg className="w-8 h-8 text-orange-400" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><polygon points="9.5,7.5 16,12 9.5,16.5" /></svg>
                  </div>
                </div>
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full shadow">Demo video coming soon</span>
              </div>
            </div>
          </div>
        </section>

      <section id="features" className="relative bg-white py-14 border-b border-stone-100">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mb-2">Why Firms Trust Dueclock</h2>
            <p className="text-base text-stone-600 max-w-2xl mx-auto">Built for modern CA teams. Everything you need to manage deadlines and communication.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 shadow-sm">
              <div className="mb-4 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center"><FileCheck className="w-6 h-6 text-amber-500" /></div>
              <h3 className="font-semibold text-stone-900 mb-2">Document tracking</h3>
              <p className="text-sm text-stone-600">Track all client documents and deadlines in one place.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-to-br from-stone-50 to-white border border-stone-100 shadow-sm">
              <div className="mb-4 w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center"><Users className="w-6 h-6 text-stone-700" /></div>
              <h3 className="font-semibold text-stone-900 mb-2">Team Collaboration</h3>
              <p className="text-sm text-stone-600">Assign tasks, manage roles, and keep your team in sync.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 shadow-sm">
              <div className="mb-4 w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center"><Bell className="w-6 h-6 text-emerald-500" /></div>
              <h3 className="font-semibold text-stone-900 mb-2">Smart Reminders</h3>
              <p className="text-sm text-stone-600">Easy communication through WhatsApp & email </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-14 border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            <details className="group border border-slate-700 rounded-lg p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors">
              <summary className="font-semibold text-slate-200 cursor-pointer group-open:text-orange-400 transition-colors">Is there a free plan?</summary>
              <p className="mt-2 text-slate-300 text-sm">Yes, you can use Dueclock free for up to 10 clients </p>
            </details>
            <details className="group border border-slate-700 rounded-lg p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors">
              <summary className="font-semibold text-slate-200 cursor-pointer group-open:text-orange-400 transition-colors">Can I import and export client data?</summary>
              <p className="mt-2 text-slate-300 text-sm">Yes, Dueclock allows you to easily import and export client data and duedates for seamless workflow management.</p>
            </details>
            <details className="group border border-slate-700 rounded-lg p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors">
              <summary className="font-semibold text-slate-200 cursor-pointer group-open:text-orange-400 transition-colors">Can I add my team?</summary>
              <p className="mt-2 text-slate-300 text-sm">Yes, you can invite your team and assign roles for better collaboration.</p>
            </details>
            <details className="group border border-slate-700 rounded-lg p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors">
              <summary className="font-semibold text-slate-200 cursor-pointer group-open:text-orange-400 transition-colors">Is my data secure?</summary>
              <p className="mt-2 text-slate-300 text-sm">We use industry-standard security and encryption to keep your data safe.</p>
            </details>
            <details className="group border border-slate-700 rounded-lg p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors">
              <summary className="font-semibold text-slate-200 cursor-pointer group-open:text-orange-400 transition-colors">Automated client Remainder ?</summary>
              <p className="mt-2 text-slate-300 text-sm">No, but we simplied communication through email and whatsapp </p>
            </details>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-14">
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to simplify your compliance?</h2>
          <p className="text-base text-slate-300 mb-6">Join hundreds of CA firms using Dueclock to stay ahead of deadlines and grow their practice.</p>
          <SignInButton />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand Section */}
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="#f97316" strokeWidth="2" fill="#f97316" fillOpacity="0.1"/>
                  <line x1="3" y1="9" x2="21" y2="9" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="#f97316" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="8" cy="14" r="1" fill="#f97316"/>
                  <circle cx="12" cy="14" r="1" fill="#f97316"/>
                  <circle cx="16" cy="14" r="1" fill="#f97316"/>
                  <circle cx="8" cy="18" r="1" fill="#f97316"/>
                  <circle cx="12" cy="18" r="1" fill="#f97316"/>
                </svg>
                <span className="font-semibold text-slate-300 text-lg">Dueclock</span>
              </div>
              <p className="text-sm text-slate-400 text-center md:text-left">
                Built for Chartered Accountants
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-semibold text-slate-200 mb-3">Quick Links</h3>
              <div className="flex flex-col gap-2 text-sm text-slate-400">
                <Link href="/terms" className="hover:text-orange-400 transition-colors">Terms of Service</Link>
                <Link href="/privacy" className="hover:text-orange-400 transition-colors">Privacy Policy</Link>
                <Link href="/refund" className="hover:text-orange-400 transition-colors">Refund Policy</Link>
              </div>
            </div>

            {/* Contact Us */}
            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-semibold text-slate-200 mb-3">Contact Us</h3>
              <div className="flex flex-col gap-2 text-sm text-slate-400">
                <a href="mailto:support@dueclock.com" className="flex items-center gap-2 hover:text-orange-400 transition-colors">
                  <Mail className="w-4 h-4" />
                  venkatnithinprof@gmail.com
                </a>
                <p className="text-xs text-slate-500 mt-2">
                  We typically respond within 24 hours
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} Dueclock. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
