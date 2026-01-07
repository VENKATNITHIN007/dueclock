import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

// Initialize Razorpay instance
const initializeRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || !keySecret) {
    console.error("Missing Razorpay credentials:", { keyId: !!keyId, keySecret: !!keySecret });
    throw new Error("Razorpay credentials not configured");
  }
  
  console.log("Razorpay Key ID:", keyId.slice(0, 10) + "...");
  
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

export async function POST(request: NextRequest) {
  try {
    console.log("Create payment API called");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "Valid" : "Invalid");
    
    if (!session?.user?.firmId) {
      console.log("No session or firmId");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectionToDatabase();
    console.log("Database connected");

    const { plan } = await request.json();
    console.log("Requested plan:", plan);

    if (plan !== "premium") {
      console.log("Invalid plan:", plan);
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Check if Razorpay keys are available
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error("Missing Razorpay credentials");
      return NextResponse.json({ error: "Payment system not configured" }, { status: 500 });
    }

    console.log("Creating Razorpay order...");
    
    // Initialize Razorpay
    const razorpay = initializeRazorpay();
    
    // Create Razorpay order for one-time payment
    const amount = 200000; // ₹2000 in paise
    const currency = "INR";

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `pm_${Date.now()}`, // Keep it short - under 40 chars
      notes: {
        firmId: session.user.firmId,
        plan: "premium",
        userId: session.user.id
      }
    });

    console.log("Order created:", order.id);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json(
      { error: "Failed to create payment order" },
      { status: 500 }
    );
  }
}