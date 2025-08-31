import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import mongoose from "mongoose"
import DueDate from "@/models/DueDate";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// get all duedates with client name
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    await connectionToDatabase();

    // const now = new Date();
    // const currentMonth = now.getMonth() + 1;
    // const currentYear = now.getFullYear();

    const dueDates = await DueDate.aggregate([
  { $match: { userId: new mongoose.Types.ObjectId(session.user.id),

    // use if need sorting 
    // $expr: {
    //         $and: [
    //           { $eq: [{ $month: "$date" }, currentMonth] },
    //           { $eq: [{ $year: "$date" }, currentYear] },
    //         ],
    //       },
  } },
  {
    $lookup: {
      from: "clients",       // collection name in MongoDB
      localField: "clientId",
      foreignField: "_id",
      as: "client",
    },
  },
  { $unwind: "$client" }, // flatten client array
  { 
    $project: { 
      title: 1, 
      date: 1, 
      status: 1, 
      "client.name": 1,
      month: { $month: "$date" }, // extract month
      year: { $year: "$date" }    // optional if you want year-wise sorting
    } 
  },
  { $sort: { date: 1 } } // sorted by year → month → date
]);

    return NextResponse.json(dueDates, { status: 200 });
  } catch (err) {
    console.error("GET dueDates pipeline error:", err);
    return NextResponse.json({ error: "Failed to fetch due dates" }, { status: 500 });
  }
}
