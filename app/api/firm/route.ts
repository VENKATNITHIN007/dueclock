import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Firm, { IFirm } from "@/models/Firm";
import User, { IUser } from "@/models/User";
import { canEditFirm, getUserRole } from "@/lib/permissions";
import { createAudit, AuditActions } from "@/lib/audit";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectionToDatabase();

    // 1️⃣ Fetch firm
    const firm = await Firm.findById(session.user.firmId)
      .select("-__v -createdAt -updatedAt")
      .lean() as IFirm | null;

    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }

    // 2️⃣ Fetch logged-in user
    const user = await User.findOne({
      _id: session.user.id,
      firmId: session.user.firmId,
    })
      .select("name email phone role")
      .lean() as IUser | null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        firm: {
          _id: firm._id?.toString() || "",
          firmName: firm.firmName,
          ownerId: firm.ownerId?.toString(),
        },
        user: {
          id: user._id?.toString() || "",
          email: user.email,
          name: user.name || "",
          phoneNumber: user.phoneNumber,
          role: user.role as "owner" | "admin" | "staff",
        },
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("GET firm + user error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}



export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = getUserRole(session);
    if (!canEditFirm(role)) {
      return NextResponse.json({ error: "Forbidden: Only owners can edit firm details" }, { status: 403 });
    }

    const body = await req.json();

    const update: Record<string, any> = {};
    if (body.firmName) update.firmName = body.firmName.trim();

    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    await connectionToDatabase();

    // Get original firm for audit
    const originalFirm = await Firm.findById(session.user.firmId).lean() as IFirm | null;

    const firm = await Firm.findByIdAndUpdate(
      session.user.firmId,
      { $set: update },
      { new: true }
    );

    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }

    // Create audit log
    await createAudit({
      firmId: session.user.firmId,
      userId: session.user.id,
      action: AuditActions.FIRM_UPDATED(firm.firmName || originalFirm?.firmName || "Unknown Firm", update),
      actionType: "edited",
      details: { previous: originalFirm, updated: update },
    });

    return NextResponse.json(firm, { status: 200 });
  } catch (err) {
    console.error("PATCH firm error:", err);
    return NextResponse.json(
      { error: "Failed to update firm" },
      { status: 500 }
    );
  }
}