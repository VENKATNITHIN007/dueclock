import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectionToDatabase } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import Client from "@/models/Client";
import { Parser } from "json2csv";
import { canAddOrDelete, getUserRole } from "@/lib/permissions";
import { createAudit, AuditActions } from "@/lib/audit";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = getUserRole(session);
    if (!canAddOrDelete(role)) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to export clients" }, { status: 403 });
    }

    await connectionToDatabase();

    // Fetch clients for the current firm
    const clients = await Client.find({ firmId: session.user.firmId })
      .select("name phoneNumber email type")
      .lean();

    if (!clients || !clients.length) {
      return NextResponse.json({ error: "No clients found" }, { status: 404 });
    }

    // Create audit log - export is a separate action, use "edited" actionType but message is clear
    await createAudit({
      firmId: session.user.firmId,
      userId: session.user.id,
      action: AuditActions.CLIENTS_EXPORTED(),
      actionType: "edited",
      details: {},
    });

    // Prepare clean data for CSV
    const data = clients.map((c) => ({
      name: c.name || "",
      phoneNumber: c.phoneNumber || "",
      email: c.email || "",
    }));

    const parser = new Parser({
      fields: ["name", "phoneNumber", "email"],
    });
    const csv = parser.parse(data);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=clients-${Date.now()}.csv`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export clients" }, { status: 500 });
  }
}