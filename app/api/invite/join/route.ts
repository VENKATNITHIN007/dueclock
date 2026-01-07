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

    const { code } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    await connectionToDatabase();

    // Extract token from code (handle both token and URL formats for backward compatibility)
    let inviteToken = code.trim();
    if (inviteToken.includes("/invite/")) {
      const match = inviteToken.match(/\/invite\/([a-f0-9]+)/i);
      if (match) {
        inviteToken = match[1];
      }
    }

    const invite = await Invite.findOne({
      token: inviteToken,
      expiresAt: { $gt: new Date() },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Invite code is invalid or expired" },
        { status: 400 }
      );
    }

    // Email must match invite (case-insensitive)
    if (invite.email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "This invite code was created for a different email address. Please sign in with the email that received the invite." },
        { status: 403 }
      );
    }

    // Get user
    let dbUser = await User.findOne({ email: session.user.email });
    
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has a firm
    if (dbUser.firmId) {
      return NextResponse.json(
        { error: "You already belong to a firm. Please leave your current firm first." },
        { status: 400 }
      );
    }

    // Update user with firm and role
    dbUser = await User.findByIdAndUpdate(
      dbUser._id,
      {
        firmId: invite.firmId,
        role: invite.role,
      },
      { new: true }
    );

    if (!dbUser) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 }
      );
    }

    // Create audit log
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

    return NextResponse.json({ success: true, firmId: invite.firmId }, { status: 200 });
  } catch (err) {
    console.error("Join firm error:", err);
    return NextResponse.json(
      { error: "Failed to join firm" },
      { status: 500 }
    );
  }
}

