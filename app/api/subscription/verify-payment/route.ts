import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import Subscription from "@/models/Subscription";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectionToDatabase();

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // Verify payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Get payment details from Razorpay
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    
    if (payment.status !== "captured") {
      return NextResponse.json({ error: "Payment not captured" }, { status: 400 });
    }

    // Calculate expiry date (1 year from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    // Update or create subscription
    const updatedSubscription = await Subscription.findOneAndUpdate(
      { firmId: session.user.firmId },
      {
        plan: "premium",
        status: "active",
        expiryDate,
        renewsAt: expiryDate, // Add renewsAt field
        autorenew: true,
        razorpayPaymentId: razorpay_payment_id,
        paymentMethod: "upi",
        amount: 2000,
        currency: "INR",
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log("Subscription updated:", {
      firmId: session.user.firmId,
      plan: updatedSubscription.plan,
      status: updatedSubscription.status,
      expiryDate: updatedSubscription.expiryDate
    });

    return NextResponse.json({ 
      success: true,
      message: "Payment verified and subscription activated",
      expiryDate
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}