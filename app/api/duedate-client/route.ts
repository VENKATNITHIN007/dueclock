import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import DueDateClient from "@/models/DueDateClient";
import { canAddOrDelete, getUserRole } from "@/lib/permissions";
import { createAudit, AuditActions } from "@/lib/audit";
import DueDate, { IDueDate } from "@/models/DueDate";
import Client, { IClient } from "@/models/Client";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = getUserRole(session);
    if (!canAddOrDelete(role)) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to attach clients to due dates" }, { status: 403 });
    }

    const payload = await req.json();
    const { dueDateId, clientIds } = payload ?? {};

    if (!dueDateId || !Array.isArray(clientIds)) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    // normalize and dedupe incoming clientIds
    const incomingIds = Array.from(new Set(clientIds.map(String)));

    await connectionToDatabase();

    // Get due date info for audit
    const dueDate = await DueDate.findById(dueDateId).lean() as IDueDate | null;

    // find already attached clients for this firm + dueDate
    const existing = await DueDateClient.find({
      firmId: session.user.firmId,
      dueDateId,
      clientId: { $in: incomingIds },
    }).select("clientId").lean();

    const existingIds = new Set(existing.map((e: any) => String(e.clientId)));

    // filter out already-attached clients
    const toInsert = incomingIds.filter((id) => !existingIds.has(id));

    if (!toInsert.length) {
      return NextResponse.json(
        { success: true, inserted: 0, skipped: incomingIds.length },
        { status: 200 }
      );
    }

    const records = toInsert.map((clientId: string) => ({
      firmId: session.user.firmId,
      dueDateId,
      clientId,
      docStatus: "pending",
    }));

    const insertedRecords = await DueDateClient.insertMany(records, { ordered: false })
      .catch((err) => {
        if (err.code !== 11000) throw err;
        return [];
      });

    // Create audit logs for each attached client
    const clients = await Client.find({ _id: { $in: toInsert } }).lean() as IClient[];
    const clientMap = new Map(clients.map((c) => [String(c._id), c.name]));
    
    for (const record of insertedRecords) {
      const clientName = clientMap.get(String(record.clientId)) || "Unknown Client";
      await createAudit({
        firmId: session.user.firmId,
        userId: session.user.id,
        dueDateId,
        dueDateClientId: record._id,
        clientId: record.clientId,
        action: AuditActions.DUE_DATE_CLIENT_ATTACHED(clientName, dueDate?.title || "Unknown Due Date"),
        actionType: "created",
        details: { clientName, dueDateTitle: dueDate?.title },
      });
    }

return NextResponse.json({
  success: true,
  inserted: insertedRecords.length,
  skipped: incomingIds.length - insertedRecords.length,
  attachedIds: insertedRecords.map((r: any) => r.clientId),
});

  } catch (err) {
    console.error("Attach clients error:", err);
    return NextResponse.json({ error: "Failed to attach clients" }, { status: 500 });
  }
}