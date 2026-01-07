import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Firm from "@/models/Firm";
import User from "@/models/User";
import { createAudit, AuditActions } from "@/lib/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const firmName = body.firmName?.trim();

    if (!firmName) {
      return NextResponse.json({ error: "Firm name is required" }, { status: 400 });
    }

    await connectionToDatabase();

    // Check if user already has a firm
    const dbUser = await User.findById(session.user.id);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (dbUser.firmId) {
      return NextResponse.json(
        { error: "User already belongs to a firm" },
        { status: 400 }
      );
    }

    // Create firm
    const firm = await Firm.create({
      firmName,
      ownerId: session.user.id,
    });

    // Update user with firm and owner role
    await User.findByIdAndUpdate(session.user.id, {
      firmId: firm._id,
      role: "owner",
    });

    // Create audit log
    await createAudit({
      firmId: firm._id,
      userId: session.user.id,
      action: AuditActions.FIRM_CREATED(firmName),
      actionType: "created",
      details: { firmName },
    });

    return NextResponse.json({ firm }, { status: 201 });
  } catch (err) {
    console.error("Create firm error:", err);
    return NextResponse.json(
      { error: "Failed to create firm" },
      { status: 500 }
    );
  }
}

