import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse, NextRequest } from "next/server";
import DueDate from "@/models/DueDate";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: dueDateId } = await params;

    if (!dueDateId || !mongoose.Types.ObjectId.isValid(dueDateId)) {
      return NextResponse.json(
        { error: "Invalid due date ID" },
        { status: 400 }
      );
    }

    await connectionToDatabase();

    const dueDate = await DueDate.findOne({
      _id: dueDateId,
      firmId: session.user.firmId
    }).lean();

    if (!dueDate) {
      return NextResponse.json(
        { error: "Due date not found" },
        { status: 404 }
      );
    }

    // Transform the response to match the expected DueType
    const transformedDueDate = {
      ...(dueDate as any),
      _id: (dueDate as any)._id?.toString() || "",
      firmId: (dueDate as any).firmId?.toString(),
      userId: (dueDate as any).userId?.toString(),
      date: (dueDate as any).date.toISOString().split('T')[0], // Format as YYYY-MM-DD
    };

    return NextResponse.json(transformedDueDate, { status: 200 });
  } catch (error) {
    console.error("GET due date details error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}