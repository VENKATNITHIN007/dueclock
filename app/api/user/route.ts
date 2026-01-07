import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import User, { IUser } from "@/models/User";
import { createAudit, AuditActions } from "@/lib/audit";

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const update: Record<string, any> = {};
    const changes: Record<string, any> = {};

    await connectionToDatabase();

    // Get original user for audit
    const originalUser = await User.findById(session.user.id).lean() as IUser | null;
    if (!originalUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only allow name update for all users
    if (body.name && body.name.trim() !== originalUser.name) {
      update.name = body.name.trim();
      changes.name = { from: originalUser.name, to: update.name };
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: update },
      { new: true }
    ).select("name email role").lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create audit log
    await createAudit({
      firmId: originalUser.firmId!,
      userId: session.user.id,
      action: AuditActions.USER_UPDATED(originalUser.name || "User", changes),
      actionType: "edited",
      details: { previous: originalUser, updated: update },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (err) {
    console.error("PATCH user error:", err);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

