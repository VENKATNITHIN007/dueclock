import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { checkClientLimit, checkDueDateLimit, getCurrentSubscription } from "@/lib/subscriptionLimits";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscription = await getCurrentSubscription(session.user.firmId);
    const clientLimit = await checkClientLimit(session.user.firmId);
    const dueDateLimit = await checkDueDateLimit(session.user.firmId);

    return NextResponse.json({
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        expiryDate: subscription.expiryDate,
        firmId: subscription.firmId
      },
      limits: {
        client: clientLimit,
        dueDate: dueDateLimit
      }
    });
  } catch (error) {
    console.error("Debug subscription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}