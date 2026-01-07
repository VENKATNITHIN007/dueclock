import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import DueDate from "@/models/DueDate";
import { canAddOrDelete, getUserRole } from "@/lib/permissions";
import { createAudit, AuditActions } from "@/lib/audit";
import { checkDueDateLimit } from "@/lib/subscriptionLimits";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectionToDatabase();

    const dueDates = await DueDate.aggregate([
      {
        $match: {
          firmId: new mongoose.Types.ObjectId(session.user.firmId),
        },
      },
      {
        $lookup: {
          from: "duedateclients",
          localField: "_id",
          foreignField: "dueDateId",
          as: "clients",
        },
      },
      {
        $addFields: {
          pendingCount: {
            $size: {
              $filter: {
                input: "$clients",
                as: "c",
                cond: { $eq: ["$$c.workStatus", "pending"] },
              },
            },
          },
          totalClients: { $size: "$clients" },
        },
      },
      {
        $project: {
          title: 1,
          date: 1,
          pendingCount: 1,
          totalClients: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    const formattedDueDates = dueDates.map((due) => ({
      _id: due._id?.toString() || "",
      title: due.title,
      date: new Date(due.date).toISOString(),
      pendingCount: due.pendingCount,
      totalClients: due.totalClients,
    }));

    return NextResponse.json(formattedDueDates, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    console.error("GET duedates error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = getUserRole(session);
    if (!canAddOrDelete(role)) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to add due dates" }, { status: 403 });
    }

    // Check due date limit
    const dueDateLimit = await checkDueDateLimit(session.user.firmId);
    if (!dueDateLimit.allowed) {
      return NextResponse.json({ 
        error: `Due date limit reached for this month. ${dueDateLimit.plan === 'free' ? 'Upgrade to Premium for unlimited due dates.' : 'Maximum due dates reached.'}`,
        limitReached: true,
        plan: dueDateLimit.plan,
        current: dueDateLimit.current,
        limit: dueDateLimit.limit
      }, { status: 400 });
    }

    const body = await req.json();

    if (!body.title || !body.date) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    await connectionToDatabase();

    const dueDate = await DueDate.create({
      firmId: session.user.firmId,
      title: body.title.trim(),
      date: new Date(body.date),
      createdBy:session.user.id
    });

    // Create audit log
    await createAudit({
      firmId: session.user.firmId,
      userId: session.user.id,
      dueDateId: dueDate._id,
      action: AuditActions.DUE_DATE_CREATED(dueDate.title),
      actionType: "created",
      details: { title: dueDate.title, date: dueDate.date },
    });

    return NextResponse.json(dueDate, { status: 201 });
  } catch (err) {
    console.error("POST duedate error:", err);
    return NextResponse.json({ error: "Failed to create due date" }, { status: 500 });
  }
}