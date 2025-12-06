import mongoose from "mongoose"
import { authOptions } from "@/lib/auth"
import { connectionToDatabase } from "@/lib/db"
import DueDate from "@/models/DueDate"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"


function startOfDay(d: Date) {
  const s = new Date(d)
  s.setHours(0, 0, 0, 0)
  return s
}
function endOfDay(d: Date) {
  const e = new Date(d)
  e.setHours(23, 59, 59, 999)
  return e
}
function startOfWeek(d: Date) {
  const s = new Date(d)
  const day = s.getDay() // Sunday=0 ... Saturday=6
  s.setDate(s.getDate() - day) // go back to Sunday
  s.setHours(0, 0, 0, 0)
  return s
}
function endOfWeek(d: Date) {
  const e = startOfWeek(d)
  e.setDate(e.getDate() + 6) // Saturday
  e.setHours(23, 59, 59, 999)
  return e
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectionToDatabase()

    const url = new URL(req.url)
    const label = (url.searchParams.get("label") || "").toLowerCase()
    const status = (url.searchParams.get("status") || "").toLowerCase() // pending | completed
    const period = (url.searchParams.get("period") || "").toLowerCase() // today | week | month
    const filter = (url.searchParams.get("filter") || "").toLowerCase() // urgent | overdue

    const now = new Date()
    let dateMatch: any = null

    if (period === "today") {
      dateMatch = { $gte: startOfDay(now), $lte: endOfDay(now) }
    } else if (period === "week") {
      dateMatch = { $gte: startOfWeek(now), $lte: endOfWeek(now) }
    } else if (period === "month") {
      dateMatch = { $gte: startOfMonth(now), $lte: endOfMonth(now) }
    } else if (filter === "urgent") {
      // urgent = today + next 2 days (3 days total)
      const in2days = new Date(now)
      in2days.setDate(in2days.getDate() + 2)
      dateMatch = { $gte: startOfDay(now), $lte: endOfDay(in2days) }
    } else if (filter === "overdue") {
      // overdue = strictly before today
      dateMatch = { $lt: startOfDay(now) }

    }

    const match: any = {
      firmId: new mongoose.Types.ObjectId(session.user.firmId),
    }
    if(label) match.label =label
    if (status) match.status = status
    if (dateMatch) match.date = dateMatch

    const pipeline: any[] = [
      { $match: match },
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "client",
        },
      },
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
      { $sort: { date: 1 } }, // earliest first

      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          dues: {
            $push: {
              _id: "$_id",
              title: "$title",
              date: "$date",
              status: "$status",
              label:"$label",
              recurrence:"$recurrence",
              clientName: "$client.name",
              clientId:"$client._id",
              phoneNumber:"$client.phoneNumber",
              email:"$client.email"
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }, // newest groups first
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          dues: 1,
        },
      },
    ]

    const result = await DueDate.aggregate(pipeline)
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    console.error("GET /api/duedates error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}