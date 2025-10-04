// app/api/duedates/[id]/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { addMonths, addYears } from "date-fns";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import DueDate from "@/models/DueDate";
import Audit from "@/models/Audit";
import { connectionToDatabase } from "@/lib/db";

type Recurrence = "none" | "monthly" | "quarterly" | "yearly";

function rollForward(date: Date, recurrence: Recurrence): Date | null {
  if (!recurrence || recurrence === "none") return null;
  if (recurrence === "monthly") return addMonths(date, 1);
  if (recurrence === "quarterly") return addMonths(date, 3);
  if (recurrence === "yearly") return addYears(date, 1);
  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
     const firmId = session.user.firmId;

    const { id } = await params;

    await connectionToDatabase();

    const mSession = await mongoose.startSession();
    mSession.startTransaction();

    try {
      // lock & fetch the due
      const due = await DueDate.findById(id).session(mSession);
      if (!due) {
        await mSession.abortTransaction();
        mSession.endSession();
        return NextResponse.json({ error: "Due date not found" }, { status: 404 });
      }

      // if already completed, just return ok (idempotent)
      if (due.status === "completed") {
        await mSession.commitTransaction();
        mSession.endSession();
        return NextResponse.json({ success: true }, { status: 200 });
      }

      // mark as completed
      due.status = "completed";
      due.updatedAt = new Date();
      due.completedAt = new Date();
      due.completedBy = userId; 
      await due.save({ session: mSession });

      // write audit log (only for completion)
      await Audit.create(
        [
          {
            dueDateId: due._id,
            userId,
            firmId: due.firmId,
            action: "completed",
          },
        ],
        { session: mSession }
      );

      // recurrence: create next due if needed
      if (due.recurrence && due.recurrence !== "none") {
        const nextDate = rollForward(due.date as Date, due.recurrence as Recurrence);
        if (nextDate) {
          // avoid duplicates
          const exists = await DueDate.findOne({
            clientId: due.clientId,
            title: due.title,
            date: nextDate,
            firmId:firmId,
          }).session(mSession);

          if (!exists) {
            await DueDate.create(
              [
                {
                  title: due.title,
                  description: due.description,
                  date: nextDate,
                  label: due.label,
                  recurrence: due.recurrence,
                  clientId: due.clientId,
                  firmId: firmId,
                  status: "pending",
                },
              ],
              { session: mSession }
            );
          }
        }
      }

      await mSession.commitTransaction();
      mSession.endSession();

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (innerErr) {
      await mSession.abortTransaction();
      mSession.endSession();
      console.error("complete route transaction error:", innerErr);
      return NextResponse.json({ error: "Failed to complete due date" }, { status: 500 });
    }
  } catch (err) {
    console.error("PATCH complete error:", err);
    return NextResponse.json({ error: "Failed to complete due date" }, { status: 500 });
  }
}