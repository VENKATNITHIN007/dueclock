import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import DueDate from "@/models/DueDate";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { zodToFieldErrors } from "@/lib/zodError";
import { dueFormSchema } from "@/lib/schemas";
// ✅ GET a single due date with client populated
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectionToDatabase();

    const { id } = params;

    const dueDate = await DueDate.findOne({ _id: id, userId: session.user.id })
      .populate("clientId")
      .lean();

    if (!dueDate) {
      return NextResponse.json({ error: "Due date not found" }, { status: 404 });
    }

    return NextResponse.json(dueDate, { status: 200 });
  } catch (err) {
    console.error("GET single due date error:", err);
    return NextResponse.json(
      { error: "Failed to fetch due date" },
      { status: 500 }
    );
  }
}

// ✅ PATCH with Zod validation
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    // validate partial updates
    const parsed = dueFormSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(zodToFieldErrors(parsed.error), { status: 400 });
    }

    await connectionToDatabase();

    const updateFields = { ...parsed.data };

    // convert string → Date if present
    if (updateFields.date) {
      updateFields.date = new Date(updateFields.date);
    }

    const updatedDueDate = await DueDate.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      { $set: updateFields },
      { new: true }
    )
      .populate("clientId")
      .lean();

    if (!updatedDueDate) {
      return NextResponse.json({ error: "Due date not found" }, { status: 404 });
    }

    return NextResponse.json(updatedDueDate, { status: 200 });
  } catch (err) {
    console.error("PATCH dueDate error:", err);
    return NextResponse.json({ error: "Failed to update due date" }, { status: 500 });
  }
}

// ✅ DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await connectionToDatabase();

    const deletedDueDate = await DueDate.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    });

    if (!deletedDueDate) {
      return NextResponse.json({ error: "Due date not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Due date deleted successfully" });
  } catch (err) {
    console.error("DELETE dueDate error:", err);
    return NextResponse.json(
      { error: "Failed to delete due date" },
      { status: 500 }
    );
  }
}




