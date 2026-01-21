"use client";

import { CheckCircle, Crown, Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function PricingDialog({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signIn("google", { callbackUrl: "/app/onboarding" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        className="max-w-2xl p-0 overflow-hidden"
        style={{ maxHeight: '90vh', padding: 0 }}
      >
        <DialogHeader className="px-4 pt-4 pb-2 bg-gradient-to-r from-slate-50 to-stone-50 border-b">
          <DialogTitle className="text-xl font-bold text-slate-900">
            Choose Your Plan
          </DialogTitle>
          <p className="text-slate-600 text-xs mt-1">
            Start free and scale with your firm. No hidden fees.
          </p>
        </DialogHeader>

        <div
          className="p-4 overflow-y-auto"
          style={{ maxHeight: 'calc(90vh - 60px)' }}
        >
          <div className="grid md:grid-cols-2 gap-4">
            {/* FREE PLAN */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                    Free
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-bold text-slate-900">₹0</span>
                    <span className="text-slate-500 text-xs">forever</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Perfect for solo practitioners
                  </p>
                </div>
                <ul className="space-y-2 mb-4">
                  {[
                    "Up to 10 clients",
                    "Limited due dates",
                    "Basic compliance tracking",
                    "Email reminders",
                    "Mobile & desktop access",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle className="w-4 h-4 text-slate-400 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={handleSignIn}
                variant="outline"
                className="w-full text-xs py-2"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Get Started Free"}
              </Button>
            </div>

            {/* PREMIUM PLAN */}
            <div className="relative p-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50/80 to-orange-50/60 shadow flex flex-col justify-between min-h-[340px]">
              <div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow">
                    <Crown className="w-3 h-3" />
                    RECOMMENDED
                  </div>
                </div>
                <div className="text-center mb-4 mt-2">
                  <h3 className="text-base font-semibold text-slate-900 mb-1">
                    Premium
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-bold text-slate-900">₹2,000</span>
                    <span className="text-slate-600 text-xs">/year</span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    For growing CA firms
                  </p>
                </div>
                <ul className="space-y-2 mb-4">
                  {[
                    "Up to 100 clients",
                    "Unlimited due dates",
                    "Advanced compliance tracking",
                    "WhatsApp & email reminders",
                    "Team management & roles",
                    "Full activity tracking",
                    "Priority support",
                  ].map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-slate-700">
                      <CheckCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={handleSignIn}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md text-xs py-2"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Get Premium"}
              </Button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
              <Shield className="w-4 h-4" />
              <span>Secure UPI payments • Instant activation • Cancel anytime</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
