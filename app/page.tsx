import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignInButton from "@/components/auth/login";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import LandingHeader from "@/components/landing/LandingHeader";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { 
  Calendar, 
  Users, 
  FileText, 
  CheckCircle2,
  Upload,
  MessageSquare,
  Activity,
  Mail,
  Shield
} from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/app/duedates");

  return (
    <main className="min-h-screen bg-white">
      {/* Header with Mobile Menu */}
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-gray-50 py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
            {/* Left: Content */}
            <div className="text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Never Miss a
                <span className="block mt-1 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  Client Deadline Again
                </span>
              </h1>

              <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-xl mx-auto md:mx-0">
                The complete deadline management platform built for CA firms. Track compliance, automate reminders, and stay ahead of every due date.
              </p>

              {/* CTA - Visible on all devices */}
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 mb-6">
                <SignInButton />
                <a href="#pricing" className="text-sm text-blue-600 hover:text-blue-700 font-medium underline">
                  View Pricing
                </a>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>Free up to 10 clients</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-blue-600" />
                  <span>No credit card</span>
                </div>
              </div>
            </div>

            {/* Right: Dashboard Preview */}
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg blur-xl opacity-20" />
              <div className="relative rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden">
                <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-200 bg-gray-50">
                  <div className="flex gap-1">
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                  </div>
                </div>
                <div className="p-1">
                  <Image
                    src="/dashboard.png"
                    alt="Dueclock dashboard"
                    width={1200}
                    height={800}
                    className="w-full h-auto"
                    priority
                    quality={85}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwABmX/9k="
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Everything You Need
            </h2>
            <p className="text-sm text-gray-600">
              Powerful features for CA firms
            </p>
          </div>

          {/* Desktop Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Upload className="h-5 w-5" />,
                title: "Import & Export",
                description: "CSV import/export for easy data management.",
                color: "text-blue-600"
              },
              {
                icon: <FileText className="h-5 w-5" />,
                title: "Document Tracking",
                description: "Track document and work status efficiently.",
                color: "text-blue-600"
              },
              {
                icon: <MessageSquare className="h-5 w-5" />,
                title: "Bulk Communication",
                description: "WhatsApp or email to multiple clients.",
                color: "text-blue-600"
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: "Team Management",
                description: "Role-based permissions for your team.",
                color: "text-blue-600"
              },
              {
                icon: <Activity className="h-5 w-5" />,
                title: "Activity Tracking",
                description: "Complete audit trail of all changes.",
                color: "text-blue-600"
              },
              {
                icon: <Calendar className="h-5 w-5" />,
                title: "Smart Recurring",
                description: "Automatic recurring deadline generation.",
                color: "text-blue-600"
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                <div className={`inline-flex items-center justify-center h-9 w-9 rounded-lg bg-blue-100 ${feature.color} mb-2`}>
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Mobile: Compact Grid with Tooltips */}
          <div className="grid grid-cols-2 gap-3 sm:hidden">
            {[
              { icon: <Upload className="h-4 w-4" />, title: "Import & Export", desc: "CSV import/export", color: "text-blue-600" },
              { icon: <FileText className="h-4 w-4" />, title: "Document Tracking", desc: "Track doc status", color: "text-blue-600" },
              { icon: <MessageSquare className="h-4 w-4" />, title: "Bulk Messaging", desc: "WhatsApp/Email", color: "text-blue-600" },
              { icon: <Users className="h-4 w-4" />, title: "Team Management", desc: "Role-based access", color: "text-blue-600" },
              { icon: <Activity className="h-4 w-4" />, title: "Activity Tracking", desc: "Complete audit log", color: "text-blue-600" },
              { icon: <Calendar className="h-4 w-4" />, title: "Smart Recurring", desc: "Auto due dates", color: "text-blue-600" }
            ].map((feature, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-lg p-3 border border-gray-200">
                <div className={`inline-flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100 ${feature.color} mb-2`}>
                  {feature.icon}
                </div>
                <h3 className="text-xs font-semibold text-gray-900 leading-tight mb-0.5">{feature.title}</h3>
                <p className="text-[10px] text-gray-600 leading-tight">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-8 sm:py-12 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Simple, Transparent Pricing
            </h2>
            <p className="text-sm text-gray-600">
              Choose the plan that fits your firm
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Free Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">₹0</span>
                  <span className="text-sm text-gray-600">/forever</span>
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Up to 10 clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">3 due dates per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Basic features</span>
                </li>
              </ul>

              <SignInButton />
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg border border-blue-700 p-5 relative hover:shadow-xl transition-shadow">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <span className="bg-white text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold shadow">
                  POPULAR
                </span>
              </div>

              <div className="mb-4 mt-1">
                <h3 className="text-lg font-bold text-white mb-1">Premium Plan</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">₹2,000</span>
                  <span className="text-sm text-blue-100">/year</span>
                </div>
              </div>

              <ul className="space-y-2 mb-5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">Up to 100 clients</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">Unlimited due dates</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">All premium features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-white flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-white">Priority support</span>
                </li>
              </ul>

              <PaymentDialog>
                <button className="w-full bg-white text-blue-700 rounded-lg px-4 py-2 text-sm font-bold hover:bg-blue-50 transition-colors">
                  Upgrade to Premium
                </button>
              </PaymentDialog>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-xs text-gray-600 flex items-center justify-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5" />
                Secure UPI payments
              </span>
              <span>•</span>
              <span>Instant activation</span>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Mobile: Compact Single Column */}
          <div className="block sm:hidden space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
                <Calendar className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-white">Dueclock</span>
            </div>
            <p className="text-xs text-gray-400 text-center">
              Professional deadline management for CA firms.
            </p>
            <div className="flex justify-center gap-4 text-xs">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/refund" className="hover:text-white transition-colors">Refund</Link>
            </div>
            <div className="flex justify-center gap-4 text-xs">
              <a href="mailto:venkatnithinprof@gmail.com" className="hover:text-white transition-colors flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email
              </a>
              <a href="https://wa.me/917090245208" className="hover:text-white transition-colors flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                WhatsApp
              </a>
            </div>
            <div className="pt-3 border-t border-gray-800 text-center">
              <p className="text-xs">© {new Date().getFullYear()} Dueclock. All rights reserved.</p>
            </div>
          </div>

          {/* Desktop: Grid Layout */}
          <div className="hidden sm:block">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="sm:col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
                    <Calendar className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-white">Dueclock</span>
                </div>
                <p className="text-xs text-gray-400 max-w-xs">
                  Professional deadline management for CA firms.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white mb-2">Product</h3>
                <ul className="space-y-1.5">
                  <li><a href="#features" className="text-xs hover:text-white transition-colors">Features</a></li>
                  <li><a href="#pricing" className="text-xs hover:text-white transition-colors">Pricing</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white mb-2">Support</h3>
                <ul className="space-y-1.5">
                  <li>
                    <a href="mailto:venkatnithinprof@gmail.com" className="text-xs hover:text-white transition-colors flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email
                    </a>
                  </li>
                  <li>
                    <a href="https://wa.me/917090245208" target="_blank" rel="noopener noreferrer" className="text-xs hover:text-white transition-colors flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      WhatsApp
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-white mb-2">Legal</h3>
                <ul className="space-y-1.5">
                  <li>
                    <Link href="/terms" className="text-xs hover:text-white transition-colors">
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="text-xs hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/refund" className="text-xs hover:text-white transition-colors">
                      Refund Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-800 text-center">
              <p className="text-xs">© {new Date().getFullYear()} Dueclock. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}