import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import DueDate from "@/models/DueDate";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET_PASSED() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectionToDatabase();

    const today = new Date();

    const passed = await DueDate.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(session.user.id),
          date: { $lt: today },
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

    return NextResponse.json(passed);
  } catch (err) {
    console.error("GET passed error:", err);
    return NextResponse.json({ error: "Failed to fetch passed dates" }, { status: 500 });
  }
}