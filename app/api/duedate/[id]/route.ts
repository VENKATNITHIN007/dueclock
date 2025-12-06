
import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import DueDate from "@/models/DueDate";
import Client from "@/models/Client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { zodToFieldErrors } from "@/lib/zodError";
import {  dueFormSchemaBackend } from "@/schemas/formSchemas";
import { DueType } from "@/schemas/apiSchemas/dueDateSchema";


export async function PATCH(
  req: NextRequest,
    { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // validate partial updates
    const parsed = dueFormSchemaBackend.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(zodToFieldErrors(parsed.error), { status: 400 });
    }
    if ("status" in parsed.data) {
      // disallow status changes on this route
      return NextResponse.json({ error: "Status changes not allowed on this route" }, { status: 400 });
    }

    await connectionToDatabase();

    const updateFields = { ...parsed.data };
    const updatedDueDate = await DueDate.findOneAndUpdate(
      { _id: id, firmId: session.user.firmId },
      { $set: updateFields },
      { new: true }
    )
    .select("-__v -createdAt -updatedAt")
    .lean<DueType>();

    if (!updatedDueDate) {
      return NextResponse.json({ error: "Due date not found" }, { status: 404 });
    }
     const client = await Client.findById(updatedDueDate.clientId)
     .select("-__v -createdAt -updatedAt")
     .lean()
     if(!client){
       return NextResponse.json({ error: "client not found for duedate" }, { status: 404 });
     }

    return NextResponse.json({...updatedDueDate,client}, { status: 200 });
  } catch (err) {
    console.error("PATCH dueDate error:", err);
    return NextResponse.json({ error: "Failed to update due date" }, { status: 500 });
  }
}

//  DELETE
export async function DELETE(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } =  await params;

    await connectionToDatabase();

    const deletedDueDate = await DueDate.findOneAndDelete({
      _id: id,
      firmId: session.user.firmId,
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
