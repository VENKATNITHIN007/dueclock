import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Invite from "@/models/Invite";
import crypto from "crypto";
import { canManageMembers, getUserRole } from "@/lib/permissions";
import { createAudit, AuditActions } from "@/lib/audit";


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = getUserRole(session);
    if (!canManageMembers(role)) {
      return NextResponse.json({ error: "Forbidden: Only owners can invite members" }, { status: 403 });
    }

    const { email, role: inviteRole = "staff" } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await connectionToDatabase();

    // Check if there's already a pending invite for this email
    const existingInvite = await Invite.findOne({
      email: email.toLowerCase().trim(),
      expiresAt: { $gt: new Date() },
    });
    if (existingInvite) {
      // Return the existing invite code instead of throwing an error
      return NextResponse.json(
        { inviteCode: existingInvite.token, existing: true },
        { status: 200 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

    const invite = await Invite.create({
      firmId: session.user.firmId,
      email: email.toLowerCase().trim(),
      role: inviteRole,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    
    console.log(invite)

    // Create audit log with plain English action
    await createAudit({
      firmId: session.user.firmId,
      userId: session.user.id,
      action: AuditActions.INVITE_CREATED(email, inviteRole),
      actionType: "created",
      details: { email, role: inviteRole, token },
    });

    // Return just the invite code (token) - no URL
    return NextResponse.json({ inviteCode: token }, { status: 201 });
  } catch (err) {
    console.error("Create invite error:", err);
    return NextResponse.json(
      { error: "Failed to create invite" },
      { status: 500 }
    );
  }
}