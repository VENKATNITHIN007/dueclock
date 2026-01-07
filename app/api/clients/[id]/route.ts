import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { clientFormSchema,clientFormInput } from "@/schemas/formSchemas";
import { zodToFieldErrors } from "@/lib/zodError";
import Client, { IClient } from "@/models/Client";

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import DueDateClient from "@/models/DueDateClient";
import mongoose from "mongoose";
import { canAddOrDelete, canUpdate, getUserRole } from "@/lib/permissions";
import { createAudit, AuditActions } from "@/lib/audit";


// get single client
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectionToDatabase();

    // 1️⃣ Fetch client
    const client = await Client.findOne({
      _id: id,
      firmId: session.user.firmId,
    })
      .select("-__v -createdAt -updatedAt")
      .lean() as IClient | null;

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // 2️⃣ Fetch due dates via DueDateClient
    const dueDates = await DueDateClient.aggregate([
      {
        $match: {
          clientId: new mongoose.Types.ObjectId(id),
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
      { $unwind: "$dueDate" },
      {
        $sort: {
          "dueDate.date": 1,
        },
      },
      {
        $project: {
          _id: 0,
          workStatus:1,
          docStatus: 1,
          dueDate: {
            _id: 1,
            title: 1,
            date: 1,
            priority: 1,
          },
        },
      },
    ]);

    return NextResponse.json(
      {
        ...client,
        dueDates,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("GET single client error:", err);
    return NextResponse.json(
      { error: "Failed to fetch client" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest,    { params }: { params: Promise<{ id: string }> } ) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = getUserRole(session);
    if (!canUpdate(role)) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to update clients" }, { status: 403 });
    }

    const { id } =  await params;
     const body = await req.json();
     const parsed = clientFormSchema.safeParse(body);
     
         if (!parsed.success) {
           return NextResponse.json(zodToFieldErrors(parsed.error),
             { status: 400 }
           );
         }
        const updateFields: Partial<clientFormInput> = {};
            if (parsed.data.name !== undefined) updateFields.name = parsed.data.name;
            if (parsed.data.email !== undefined) updateFields.email = parsed.data.email;
            if (parsed.data.phoneNumber !== undefined) updateFields.phoneNumber = parsed.data.phoneNumber;
           
            
    await connectionToDatabase();

    const originalClient = await Client.findOne({
      _id: id,
      firmId: session.user.firmId,
    }).lean() as IClient | null;

    if (!originalClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    const updatedClient = await Client.findOneAndUpdate(
      { _id: id, firmId: session.user.firmId },
      { $set: updateFields },
      { new: true }
    ).select("-__v -createdAt -updatedAt")
    .lean() as IClient | null;

    if (!updatedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    // Create audit log
    const clientName = updatedClient.name || originalClient.name || "Unknown Client";
    await createAudit({
      firmId: session.user.firmId,
      userId: session.user.id,
      clientId: id,
      action: AuditActions.CLIENT_UPDATED(clientName, updateFields),
      actionType: "edited",
      details: { previous: originalClient, updated: updateFields },
    });

    return NextResponse.json(updatedClient,{status:200});
  } catch (e) {
    console.error("PATCH client error:", e);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1️⃣ Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const role = getUserRole(session);
    if (!canAddOrDelete(role)) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to delete clients" }, { status: 403 });
    }

    // 2️⃣ Resolve params (latest Next.js)
    const { id } = await params;

    await connectionToDatabase();

    // 3️⃣ Delete client (firm-scoped)
    const deletedClient = await Client.findOneAndDelete({
      _id: id,
      firmId: session.user.firmId,
    });

    if (!deletedClient) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // 4️⃣ Delete all DueDateClient relations (NOT DueDates)
    await DueDateClient.deleteMany({
      clientId: id,
      firmId: session.user.firmId,
    });

    // Create audit log
    await createAudit({
      firmId: session.user.firmId,
      userId: session.user.id,
      clientId: id,
      action: AuditActions.CLIENT_DELETED(deletedClient.name),
      actionType: "deleted",
      details: { name: deletedClient.name, email: deletedClient.email },
    });

    return NextResponse.json(
      { message: "Client deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("DELETE client error:", err);
    return NextResponse.json(
      { error: "Failed to delete client" },
      { status: 500 }
    );
  }
}