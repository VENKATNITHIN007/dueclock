import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import User, { IUser } from "@/models/User";
import { canManageMembers, getUserRole } from "@/lib/permissions";
import { createAudit, AuditActions } from "@/lib/audit";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = getUserRole(session);
    if (!canManageMembers(role)) {
      return NextResponse.json({ error: "Forbidden: Only owners can remove members" }, { status: 403 });
    }

    await connectionToDatabase();

    // Get member info before removal for audit
    const member = await User.findOne({
      _id: id,
      firmId: session.user.firmId,
    }).lean() as IUser | null;

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    await User.findOneAndUpdate(
      {
        _id: id,
        firmId: session.user.firmId,
      },
      {
        firmId: null,
        role: "staff",
      }
    );

    // Create audit log with plain English action
    await createAudit({
      firmId: session.user.firmId,
      userId: session.user.id,
      action: AuditActions.MEMBER_REMOVED(member.email || member.name || "Unknown"),
      actionType: "deleted",
      details: { memberEmail: member.email, memberName: member.name, memberRole: member.role },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Remove member error:", err);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}