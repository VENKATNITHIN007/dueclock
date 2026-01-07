import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import User, { IUser } from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectionToDatabase();

    const members = await User.find(
      { firmId: session.user.firmId },
      { name: 1, email: 1, role: 1 }
    ).lean() as IUser[];

    const formattedMembers = members.map((member) => ({
      _id: member._id.toString(),
      name: member.name || "",
      email: member.email,
      role: member.role as "owner" | "admin" | "staff",
    }));

    return NextResponse.json(formattedMembers, {
      status: 200,
      headers: {
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    console.error("GET members error:", err);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}