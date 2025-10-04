// app/api/dashboard/route.ts
import mongoose from "mongoose"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectionToDatabase } from "@/lib/db"
import DueDate from "@/models/DueDate"
import Client from "@/models/Client"
import { NextResponse } from "next/server"

function startOfDay(d = new Date()) {
  const s = new Date(d)
  s.setHours(0, 0, 0, 0)
  return s
}
function endOfDay(d = new Date()) {
  const e = new Date(d)
  e.setHours(23, 59, 59, 999)
  return e
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0)
}
function endOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999)
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectionToDatabase()

    // prepare date bounds
    const now = new Date()
    const todayStart = startOfDay(now)
    const urgentEnd = endOfDay(new Date(todayStart.getTime() + 2 * 24 * 60 * 60 * 1000)) // today +2 days
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    const firmId = new mongoose.Types.ObjectId(session.user.firmId)

    // total clients (fast count)
    const totalClientsPromise = Client.countDocuments({ firmId })

    // DueDate facet: compute multiple counts in a single aggregation
    const facet = await DueDate.aggregate([
      { $match: { firmId } },
      {
        $facet: {
          pending: [{ $match: { status: "pending" } }, { $count: "count" }],
          completed: [{ $match: { status: "completed" } }, { $count: "count" }],
          urgentPending: [
            { $match: { status: "pending", date: { $gte: todayStart, $lte: urgentEnd } } },
            { $count: "count" },
          ],
          overduePending: [
            { $match: { status: "pending", date: { $lt: todayStart } } },
            { $count: "count" },
          ],
          completedThisMonth: [
            { $match: { status: "completed", date: { $gte: monthStart, $lte: monthEnd } } },
            { $count: "count" },
          ],
        },
      },
    ])

    const f = (arr: any[]) => (arr && arr[0] ? arr[0].count : 0)
    const facetObj = facet[0] ?? {}

    const [totalClients] = await Promise.all([totalClientsPromise])

    const counts = {
      totalClients: totalClients ?? 0,
      pendingDues: f(facetObj.pending),
      urgent: f(facetObj.urgentPending),
      passed: f(facetObj.overduePending),
      completedThisMonth: f(facetObj.completedThisMonth), // NEW field
    }

    return NextResponse.json(counts, { status: 200 })
  } catch (err) {
    console.error("GET /api/dashboard error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}