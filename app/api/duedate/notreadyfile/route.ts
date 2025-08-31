import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import DueDate from "@/models/DueDate";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET_NOT_READY() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectionToDatabase();

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const notReady = await DueDate.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(session.user.id),
          status: "notRedayToFile",
          $expr: {
            $and: [
              { $eq: [{ $month: "$date" }, currentMonth] },
              { $eq: [{ $year: "$date" }, currentYear] },
            ],
          },
        },
      },
      {
        $lookup: {
          from: "clients",
          localField: "clientId",
          foreignField: "_id",
          as: "client",
        },
      },
      { $unwind: "$client" },
      {
        $project: {
          title: 1,
          date: 1,
          status: 1,
          "client.name": 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    return NextResponse.json(notReady);
  } catch (err) {
    console.error("GET not ready error:", err);
    return NextResponse.json({ error: "Failed to fetch not ready dates" }, { status: 500 });
  }
}