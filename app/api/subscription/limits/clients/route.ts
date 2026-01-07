import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { checkClientLimit } from "@/lib/subscriptionLimits";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectionToDatabase();
    
    const limitStatus = await checkClientLimit(session.user.firmId);
    
    return NextResponse.json(limitStatus);
  } catch (error) {
    console.error("GET client limit status error:", error);
    return NextResponse.json(
      { error: "Failed to fetch client limit status" },
      { status: 500 }
    );
  }
}