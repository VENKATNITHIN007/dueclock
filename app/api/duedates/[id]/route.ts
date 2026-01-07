import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse,NextRequest } from "next/server";
import DueDate from "@/models/DueDate";
import DueDateClient from "@/models/DueDateClient";
import mongoose from "mongoose";
import { canAddOrDelete, canUpdate, getUserRole } from "@/lib/permissions";
import { createAudit, AuditActions } from "@/lib/audit";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ✅ Latest Next.js compatible
    const { id: dueDateId } = await params;

    if (!dueDateId) {
      return NextResponse.json(
        { error: "Missing dueDateId" },
        { status: 400 }
      );
    }

    await connectionToDatabase();

    const data = await DueDateClient.aggregate([
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
          as: "due",
        },
      },
      { $unwind: "$due" },
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "client",
        },
      },
      { $unwind: "$client" },
      {
        $project: {
          _id: 1,
          dueTitle: "$due.title",
          date: "$due.date",
          docStatus: 1,
          workStatus: 1,
          lastContactedAt: 1,
          client: {
  _id: { $toString: "$client._id" },
  name: "$client.name",
  email: "$client.email",
  phoneNumber: "$client.phoneNumber",
},
        },
      },
    ]);

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    console.error("GET duedate-clients error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = getUserRole(session);
    if (!canUpdate(role)) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to update due dates" }, { status: 403 });
    }

    // ✅ Latest Next.js compatible
    const { id: dueDateId } = await params;

    const body = await req.json();

    // Allow partial updates
    const update: Record<string, any> = {};

    if (body.title) update.title = body.title.trim();
    if (body.date) update.date = new Date(body.date);

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    await connectionToDatabase();

    // Get the original due date before update
    const originalDueDate = await DueDate.findOne({
      _id: dueDateId,
      firmId: session.user.firmId,
    });

    if (!originalDueDate) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const dueDate = await DueDate.findOneAndUpdate(
      {
        _id: dueDateId,
        firmId: session.user.firmId,
      },
      { $set: update },
      { new: true }
    );

    if (!dueDate) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Create audit log
    await createAudit({
      firmId: session.user.firmId,
      userId: session.user.id,
      dueDateId: dueDate._id,
      action: AuditActions.DUE_DATE_UPDATED(dueDate.title, update),
      actionType: "edited",
      details: { previous: { title: originalDueDate.title, date: originalDueDate.date }, updated: update },
    });

    return NextResponse.json(dueDate, { status: 200 });
  } catch (err) {
    console.error("PATCH duedate error:", err);
    return NextResponse.json(
      { error: "Failed to update due date" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = getUserRole(session);
    if (!canAddOrDelete(role)) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to delete due dates" }, { status: 403 });
    }

    // ✅ Latest Next.js compatible
    const { id: dueDateId } = await params;

    await connectionToDatabase();

    // Ensure due date belongs to firm
    const dueDate = await DueDate.findOne({
      _id: dueDateId,
      firmId: session.user.firmId,
    });

    if (!dueDate) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Store title for audit log
    const dueDateTitle = dueDate.title;

    // Delete all related DueDateClient records
    await DueDateClient.deleteMany({
      dueDateId: dueDate._id,
      firmId: session.user.firmId,
    });

    // Delete due date
    await DueDate.deleteOne({ _id: dueDate._id });

    // Create audit log
    await createAudit({
      firmId: session.user.firmId,
      userId: session.user.id,
      dueDateId: dueDate._id,
      action: AuditActions.DUE_DATE_DELETED(dueDateTitle),
      actionType: "deleted",
      details: { title: dueDateTitle, date: dueDate.date },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("DELETE duedate error:", err);
    return NextResponse.json({ error: "Failed to delete due date" }, { status: 500 });
  }
}