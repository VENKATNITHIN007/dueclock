import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Invite from "@/models/Invite";
import User from "@/models/User";
import { createAudit, AuditActions } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    await connectionToDatabase();

    const invite = await Invite.findOne({
      token,
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invite expired or invalid" },
        { status: 400 }
      );
    }

    // Email must match invite (case-insensitive)
    if (invite.email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Email mismatch. Please sign in with the email address that received the invite." },
        { status: 403 }
      );
    }

    // Get user (user should already exist from signIn callback)
    let dbUser = await User.findOne({ email: session.user.email });
    
    if (!dbUser) {
      // This shouldn't happen if signIn callback worked, but handle it anyway
      dbUser = await User.create({
        name: session.user.name || "",
        email: session.user.email,
        image: session.user.image || undefined,
        googleId: session.user.id || "",
        firmId: invite.firmId,
        role: invite.role,
      });
    } else {
      // Check if user already has a firm
      if (dbUser.firmId && dbUser.firmId.toString() !== invite.firmId.toString()) {
        return NextResponse.json(
          { error: "You already belong to a firm. Please leave your current firm first." },
          { status: 400 }
        );
      }
      
      // Update existing user's firm and role
      dbUser = await User.findOneAndUpdate(
        { email: session.user.email },
        {
          firmId: invite.firmId,
          role: invite.role,
        },
        { new: true }
      );
    }

    if (!dbUser) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    // Create audit log - track who was added (the new member)
    // Note: The userId is the person being added, as they are performing the action of accepting
    await createAudit({
      firmId: invite.firmId,
      userId: dbUser._id,
      action: AuditActions.MEMBER_ADDED(invite.email, invite.role),
      actionType: "created",
      details: { 
        role: invite.role, 
        invitedEmail: invite.email, 
        userName: dbUser.name,
        userEmail: dbUser.email 
      },
    });

    // Remove invite after use (one-time use)
    await Invite.deleteOne({ _id: invite._id });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Accept invite error:", err);
    return NextResponse.json(
      { error: "Failed to accept invite" },
      { status: 500 }
    );
  }
}