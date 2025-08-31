import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/User"; // make sure you import this
import { zodToFieldErrors } from "@/lib/zodError";
import { userProfileFormSchema,userProfileFormInput} from "@/lib/schemas";

// ✅ GET user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectionToDatabase();
    const user = await User.findById(session.user.id).select("-__v");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// ✅ PATCH user
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = userProfileFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(zodToFieldErrors(parsed.error),
        { status: 400 }
      );
    }

    const updateFields: Partial<userProfileFormInput> = {};
    if (parsed.data.name !== undefined) updateFields.name = parsed.data.name;
    if (parsed.data.phoneNumber !== undefined) updateFields.phoneNumber = parsed.data.phoneNumber;

    await connectionToDatabase();

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateFields }, // ✅ spread, not nested
      { new: true }
    ).select("-__v");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}