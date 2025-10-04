import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { clientFormSchema } from "@/schemas/formSchemas";
import { zodToFieldErrors } from "@/lib/zodError";
import mongoose from "mongoose";
import Client from "@/models/Client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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
          from: "duedates",
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
                cond: { $ne: ["$$due.status", "completed"] }, 
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

    return NextResponse.json(clients,{status:200});
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

    return NextResponse.json(newClient, { status: 201 });
  } catch (err) {
    console.error("POST client error:", err);
    return NextResponse.json({ error: "Failed to add client" }, { status: 500 });
  }
}