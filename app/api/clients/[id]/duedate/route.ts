import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import Client from "@/models/Client";
import DueDate from "@/models/DueDate";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { dueFormSchema } from "@/lib/schemas";
import { zodToFieldErrors } from "@/lib/zodError";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = params.id;
    const body = await req.json();

    // validate input (clientId included)
    const parsed = dueFormSchema.safeParse({ ...body, clientId });
    if (!parsed.success) {
      return NextResponse.json(zodToFieldErrors(parsed.error), { status: 400 });
    }

    await connectionToDatabase();

    // check client ownership
    const client = await Client.findOne({
      _id: clientId,
      userId: session.user.id,
    });
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // explicitly convert date string -> Date
    const date = new Date(parsed.data.date);

    const newDueDate = await DueDate.create({
      clientId,
      userId: session.user.id,
      firmId: session.user.firmId || null,
      title: parsed.data.title,
      date, // store as Date
      description: parsed.data.description || null,
      status: parsed.data.status || "notReadyToFile",
    });

    return NextResponse.json(newDueDate, { status: 201 });
  } catch (err) {
    console.error("Add due date error:", err);
    return NextResponse.json({ error: "Failed to add due date" }, { status: 500 });
  }
}