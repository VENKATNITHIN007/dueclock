import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { clientFormSchema } from "@/schemas/formSchemas";
import { zodToFieldErrors } from "@/lib/zodError";
import mongoose from "mongoose";
import Client from "@/models/Client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { canAddOrDelete, getUserRole } from "@/lib/permissions";
import { createAudit, AuditActions } from "@/lib/audit";
import { checkClientLimit } from "@/lib/subscriptionLimits";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectionToDatabase();

    const clients = await Client.aggregate([
      {
        $match: {
          firmId: new mongoose.Types.ObjectId(session.user?.firmId),
        },
      },
      {
        $lookup: {
          from: "duedateclients",
          localField: "_id",
          foreignField: "clientId",
          as: "dueDates",
        },
      },
      {
        $addFields: {
          pendingDues: {
            $size: {
              $filter: {
                input: "$dueDates",
                as: "due",
                cond: { $ne: ["$$due.workStatus", "completed"] }, 
              },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          phoneNumber: 1,
          type: 1,
          email: 1,
          pendingDues: 1,
        },
      },
    ]);

    return NextResponse.json(clients, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
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
      return NextResponse.json({ error: "Forbidden: You do not have permission to add clients" }, { status: 403 });
    }

    // Check client limit
    console.log("About to check client limit for firmId:", session.user.firmId);
    const clientLimit = await checkClientLimit(session.user.firmId);
    console.log("Client limit check result:", clientLimit);
    
    if (!clientLimit.allowed) {
      console.log("CLIENT LIMIT REACHED - Blocking client creation");
      return NextResponse.json({ 
        error: `Client limit reached. ${clientLimit.plan === 'free' ? 'Upgrade to Premium for up to 100 clients.' : 'Maximum clients reached.'}`,
        limitReached: true,
        plan: clientLimit.plan,
        current: clientLimit.current,
        limit: clientLimit.limit
      }, { status: 400 });
    }
    
    console.log("CLIENT LIMIT OK - Allowing client creation");

    const body = await req.json();
    const parsed = clientFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(zodToFieldErrors(parsed.error), { status: 400 });
    }

    await connectionToDatabase();

    const newClient = await Client.create({
      firmId: session.user.firmId,
      name: parsed.data.name.trim(),
      email: parsed.data.email,
      phoneNumber: parsed.data.phoneNumber,
    })

    // Create audit log
    await createAudit({
      firmId: session.user.firmId,
      userId: session.user.id,
      clientId: newClient._id,
      action: AuditActions.CLIENT_CREATED(newClient.name),
      actionType: "created",
      details: { name: newClient.name, email: newClient.email, phoneNumber: newClient.phoneNumber },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (err) {
    console.error("POST client error:", err);
    return NextResponse.json({ error: "Failed to add client" }, { status: 500 });
  }
}