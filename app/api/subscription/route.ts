import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getCurrentSubscription } from "@/lib/subscriptionLimits";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectionToDatabase();
    
    const subscription = await getCurrentSubscription(session.user.firmId);
    

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      expiryDate: subscription.expiryDate,
      renewsAt: subscription.expiryDate, // Use same as expiryDate
      autorenew: subscription.autorenew
    });
  } catch (error) {
    console.error("GET subscription error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 }
    );
  }
}