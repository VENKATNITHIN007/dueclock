import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import SignInButton from "@/components/auth/login";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import Image from "next/image";
import React from "react";
import { 
  Calendar, 
  Users, 
  FileText, 
  CheckCircle2,
  ArrowRight,
  Upload,
  MessageSquare,
  Activity,
  Crown,
  Zap
} from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/app/duedates");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Modern Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-lg border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Dueclock
              </span>
            </div>

            <nav className="flex items-center space-x-8">
              <a href="#features" className="hidden sm:block text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
                Features
              </a>
              <a href="#pricing" className="hidden sm:block text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors">
                Pricing
              </a>
              <SignInButton />
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight">
                Manage Client Deadlines
                <span className="block mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  Effortlessly
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-xl leading-relaxed">
                Professional deadline management system designed specifically for CA firms and businesses. Never miss a client deadline again.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <SignInButton />
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  View Pricing
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-slate-600">Free up to 10 clients</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-slate-600">UPI payments only</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur-2xl opacity-20" />
              <div className="relative rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-slate-300" />
                    <div className="h-3 w-3 rounded-full bg-slate-300" />
                    <div className="h-3 w-3 rounded-full bg-slate-300" />
                  </div>
                  <span className="text-xs text-slate-600 ml-2">dueclock.app</span>
                </div>
                <div className="p-1">
                  <Image
                    src="/dashboard.png"
                    alt="Dueclock dashboard"
                    width={900}
                    height={600}
                    className="w-full h-auto rounded-lg"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need in One Place
            </h2>
            <p className="text-lg text-slate-600">
              Powerful features designed specifically for CA firms and professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Upload className="h-6 w-6" />,
                title: "Import & Export",
                description: "Import and export clients and due dates anytime. Seamlessly migrate your data or create backups with CSV format.",
                gradient: "from-blue-500 to-blue-600"
              },
              {
                icon: <FileText className="h-6 w-6" />,
                title: "Document & Work Tracking",
                description: "Track document status and work progress for each client. Know exactly what's pending, received, or completed.",
                gradient: "from-indigo-500 to-indigo-600"
              },
              {
                icon: <MessageSquare className="h-6 w-6" />,
                title: "Bulk Communication",
                description: "Send WhatsApp messages or emails to multiple clients at once. Save time with pre-filled templates.",
                gradient: "from-cyan-500 to-cyan-600"
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Team Management",
                description: "Add and manage team members with role-based permissions. Admin, Manager, and Member roles ensure proper access control.",
                gradient: "from-slate-600 to-slate-700"
              },
              {
                icon: <Activity className="h-6 w-6" />,
                title: "Firm Activity Tracking",
                description: "Keep track of every action in your firm. Complete audit trail of all changes, updates, and communications.",
                gradient: "from-blue-600 to-indigo-700"
              },
              {
                icon: <Calendar className="h-6 w-6" />,
                title: "Smart Recurring Dates",
                description: "Set frequency once and let automation handle the rest. Monthly, quarterly, or yearly deadlines auto-generate after completion.",
                gradient: "from-indigo-600 to-blue-600"
              }
            ].map((feature, idx) => (
              <div key={idx} className="group relative bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
                <div className={`inline-flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br ${feature.gradient} text-white mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600">
              Choose the plan that fits your firm size. Pay via UPI only.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 relative">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Free Plan</h3>
                <div className="text-3xl font-bold text-slate-900">₹0</div>
                <div className="text-sm text-slate-600">Forever free</div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">Up to 10 clients</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">3 due dates per month</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">Basic features</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">WhatsApp & Email support</span>
                </li>
              </ul>

              <SignInButton  />
            </div>

            {/* Premium Plan */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Crown className="h-4 w-4" />
                  Most Popular
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Premium Plan</h3>
                <div className="text-3xl font-bold text-slate-900">₹2,000</div>
                <div className="text-sm text-slate-600">Per year</div>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">Up to 100 clients</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">Unlimited due dates</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">All premium features</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">Team collaboration</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">Priority support</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <span className="text-slate-700">Advanced reporting</span>
                </li>
              </ul>

              <PaymentDialog>
                <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl px-6 py-3 font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center gap-2">
                  <Zap className="h-5 w-5" />
                  Upgrade to Premium
                </button>
              </PaymentDialog>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-slate-600">
              💳 UPI payments only • Secure & instant • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">Dueclock</span>
              </div>
              <p className="text-sm text-slate-400 max-w-xs">
                Professional deadline management system for CA firms and businesses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:venkatnithinprof@gmail.com" className="hover:text-white transition-colors">venkatnithinprof@gmail.com</a></li>
                <li><a href="https://wa.me/917090245208" className="hover:text-white transition-colors">WhatsApp Support</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <p>© {new Date().getFullYear()} Dueclock. All rights reserved.</p>
            <p>Built with ❤️ by <span className="text-blue-400 font-medium">Venkat Nithin</span></p>
          </div>
        </div>
      </footer>
    </main>
  );
}