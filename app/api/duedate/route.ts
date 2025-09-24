import mongoose from "mongoose"
import { authOptions } from "@/lib/auth"
import { connectionToDatabase } from "@/lib/db"
import Client from "@/models/Client"
import DueDate from "@/models/DueDate"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { dueFormSchemaBackend } from "@/schemas/formSchemas"
import { zodToFieldErrors } from "@/lib/zodError"


export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectionToDatabase()

    const dueDates = await DueDate.aggregate([
      // filter to current user
      {
        $match: {
          userId: new mongoose.Types.ObjectId(session.user.id),
          status: "pending"
        },
      },

      // join client info
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "client",
        },
      },
      // safe unwind (client may be missing)
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },

    
      // sort so order inside groups is preserved (newest month & newest date first)
      { $sort: { date: -1 } },

      // group by year+month and push the already-projected docs
      {
        $group: {
          _id: { 
          year:{$year:"$date"},
          month:{$month:"$date"} 
        },
          dues: {
            $push: {
          _id:"$_id",
          title: "$title",
          date:"$date",
          status: "$status",
          clientName: "$client.name",
        },
    },
   }, // $$ROOT is the projected doc above
 },

      // sort groups (defensive)
      { $sort: { "_id.year": -1, "_id.month": -1 } },

      // reshape for client-friendly output
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          dues: 1,
        },
      },
    ])



    return NextResponse.json(dueDates,{ status: 200 })
  } catch (error) {
    console.error("GET /api/duedates error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await req.json()

    // ✅ clientId comes from body, not params
    const parsed = dueFormSchemaBackend.safeParse(body)
    
    if (!parsed.success) {
      console.log(zodToFieldErrors(parsed.error))
      return NextResponse.json(zodToFieldErrors(parsed.error), { status: 400 })
    }
    

    const dueData = {
      ...parsed.data,
      userId:session.user.id
    }

    await connectionToDatabase()

    // ✅ ensure this client belongs to current user
    const client = await Client.findOne({
      _id: dueData.clientId,
      userId: session.user.id,
    })
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const due = await DueDate.create(dueData)
    return NextResponse.json(due, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
