import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { checkClientLimit, checkDueDateLimit } from "@/lib/subscriptionLimits";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectionToDatabase();
    
    const clientLimits = await checkClientLimit(session.user.firmId);
    const dueDateLimits = await checkDueDateLimit(session.user.firmId);

    return NextResponse.json({
      clients: clientLimits,
      dueDates: dueDateLimits
    });
  } catch (error) {
    console.error("GET subscription limits error:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription limits" },
      { status: 500 }
    );
  }
}