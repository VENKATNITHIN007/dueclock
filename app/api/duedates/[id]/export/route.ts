import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { connectionToDatabase } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { createAudit, AuditActions } from "@/lib/audit";
import DueDateClient from "@/models/DueDateClient";
import mongoose from "mongoose";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: dueDateId } = await params;

    await connectionToDatabase();

    // Verify the due date exists and belongs to the firm
    const dueDateClients = await DueDateClient.aggregate([
      {
        $match: {
          dueDateId: new mongoose.Types.ObjectId(dueDateId),
          firmId: new mongoose.Types.ObjectId(session.user.firmId),
        },
      },
      {
        $lookup: {
          from: "duedates",
          localField: "dueDateId",
          foreignField: "_id",
          as: "dueDate",
        },
      },
      {
        $unwind: "$dueDate",
      },
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "client",
        },
      },
      {
        $unwind: "$client",
      },
    ]);

    if (dueDateClients.length === 0) {
      return NextResponse.json({ error: "Due date not found or no clients attached" }, { status: 404 });
    }

    const clientCount = dueDateClients.length;
    const dueDateTitle = dueDateClients[0]?.dueDate?.title || "Unknown Due Date";

    // Create audit log for export - export is a separate action
    await createAudit({
      firmId: session.user.firmId,
      userId: session.user.id,
      dueDateId,
      action: AuditActions.DUE_DATE_EXPORTED(dueDateTitle),
      actionType: "edited",
      details: { dueDateTitle },
    });

    return NextResponse.json({ success: true, clientCount }, { status: 200 });
  } catch (err) {
    console.error("Export due date error:", err);
    return NextResponse.json({ error: "Failed to log export" }, { status: 500 });
  }
}

