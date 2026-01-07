"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Zap, CreditCard, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSession, signIn } from "next-auth/react";


declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentDialogProps {
  children: React.ReactNode;
}

export function PaymentDialog({ children }: PaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { status } = useSession();

  const handlePayment = async () => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      toast.info("Please sign in to upgrade your plan");
      signIn("google");
      return;
    }

    if (status === "loading") {
      toast.info("Please wait...");
      return;
    }

    try {
      setLoading(true);
      console.log("Starting payment process...");

      // Create payment order
      const orderResponse = await fetch("/api/subscription/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "premium" }),
      });

      console.log("Order response status:", orderResponse.status);

      if (!orderResponse.ok) {
        const errorData = await orderResponse.text();
        console.error("Order creation failed:", errorData);
        throw new Error(`Failed to create payment order: ${errorData}`);
      }

      const orderData = await orderResponse.json();
      console.log("Order data received:", orderData);

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        console.log("Loading Razorpay script...");
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          console.log("Razorpay script loaded, initializing payment...");
          initializePayment(orderData);
        };
        script.onerror = () => {
          console.error("Failed to load Razorpay script");
          toast.error("Failed to load payment system");
          setLoading(false);
        };
        document.body.appendChild(script);
      } else {
        console.log("Razorpay already loaded, initializing payment...");
        initializePayment(orderData);
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(`Failed to initiate payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setLoading(false);
    }
  };

  const initializePayment = (orderData: any) => {
    console.log("Initializing payment with data:", orderData);
    
    const options = {
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Dueclock",
      description: "Premium Plan - Annual Subscription",
      order_id: orderData.orderId,
      method: {
        upi: true,
        card: false,
        netbanking: false,
        wallet: false,
      },
      theme: {
        color: "#3B82F6",
      },
      handler: async function (response: any) {
        try {
          console.log("Payment response received:", response);
          // Verify payment
          const verifyResponse = await fetch("/api/subscription/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyResponse.ok) {
            const result = await verifyResponse.json();
            console.log("Payment verification successful:", result);
            toast.success("Payment successful! Premium plan activated.");
            
            // Invalidate queries and refresh
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
            queryClient.invalidateQueries({ queryKey: ["subscription-limits"] });
            
            setOpen(false);
            
            // Redirect to subscription page or refresh
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            const errorData = await verifyResponse.json();
            console.error("Payment verification failed:", errorData);
            toast.error(`Payment verification failed: ${errorData.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          toast.error("Payment verification failed");
        } finally {
          setLoading(false);
        }
      },
      modal: {
        ondismiss: function() {
          console.log("Payment modal dismissed");
          setLoading(false);
          toast.info("Payment cancelled");
        }
      }
    };

    console.log("Creating Razorpay instance with options:", options);
    
    try {
      const rzp = new window.Razorpay(options);
      console.log("Razorpay instance created, opening payment modal...");
      rzp.open();
    } catch (error) {
      console.error("Error creating Razorpay instance:", error);
      toast.error("Failed to open payment modal");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-blue-600" />
            Upgrade to Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Details */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-slate-900">Premium Plan</span>
              <span className="text-2xl font-bold text-slate-900">₹2,000/year</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Up to 100 clients</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Unlimited due dates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Team collaboration</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Priority support</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-slate-50 rounded-lg p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="h-4 w-4 text-slate-600" />
              <span className="font-medium text-slate-900">Payment Method</span>
            </div>
            <p className="text-sm text-slate-600">
              Secure UPI payment via Razorpay. No credit card required.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" 
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Pay ₹2,000
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-slate-500 text-center">
            By proceeding, you agree to our terms and conditions. 
            Subscription will be active for 1 year from payment date.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}