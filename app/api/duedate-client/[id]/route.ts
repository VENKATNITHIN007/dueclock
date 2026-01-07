import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import DueDateClient from "@/models/DueDateClient";
// Audit import not needed here; using createAudit helper
import { canEditStatus, canAddOrDelete, getUserRole } from "@/lib/permissions";
import { createAudit, AuditActions } from "@/lib/audit";
import DueDate, { IDueDate } from "@/models/DueDate";
import Client, { IClient } from "@/models/Client";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = getUserRole(session);
    if (!canAddOrDelete(role)) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to remove clients from due dates" }, { status: 403 });
    }

    await connectionToDatabase();

    const { id } = await params;

    // Get record info before deletion for audit
    const record = await DueDateClient.findOne({
      _id: id,
      firmId: session.user.firmId,
    }).lean() as { _id: unknown; clientId: unknown; dueDateId: unknown } | null;

    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const recordClientId = typeof record.clientId === "string" ? record.clientId : (record.clientId as { toString: () => string })?.toString();
    const recordDueDateId = typeof record.dueDateId === "string" ? record.dueDateId : (record.dueDateId as { toString: () => string })?.toString();

    if (!recordClientId || !recordDueDateId) {
      return NextResponse.json({ error: "Invalid record data" }, { status: 400 });
    }

    // Get client and due date info for audit
    const [client, dueDate] = await Promise.all([
      Client.findById(recordClientId).lean() as Promise<IClient | null>,
      DueDate.findById(recordDueDateId).lean() as Promise<IDueDate | null>,
    ]);

    const clientName = client?.name || "Unknown Client";
    const dueDateTitle = dueDate?.title || "Unknown Due Date";

    // Delete the record
    await DueDateClient.deleteOne({ _id: id, firmId: session.user.firmId });

    // Create audit log
    await createAudit({
      firmId: session.user.firmId,
      userId: session.user.id,
      dueDateId: recordDueDateId,
      clientId: recordClientId,
      action: AuditActions.DUE_DATE_CLIENT_DELETED(clientName, dueDateTitle),
      actionType: "deleted",
      details: { clientName, dueDateTitle },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Delete duedate-client error:", err);
    return NextResponse.json({ error: "Failed to remove client from due date" }, { status: 500 });
  }
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = getUserRole(session);
    if (!canEditStatus(role)) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to update status" }, { status: 403 });
    }

    await connectionToDatabase();

    const { id } = await params;
    const record = await DueDateClient.findOne({
      _id: id,
      firmId: session.user.firmId,
    });

    if (!record) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Get client and due date info for audit
    const [client, dueDate] = await Promise.all([
      Client.findById(record.clientId).lean() as Promise<IClient | null>,
      DueDate.findById(record.dueDateId).lean() as Promise<IDueDate | null>,
    ]);

    let body: any = {};
    try {
      body = await _req.json();
    } catch {
      body = {};
    }

    const hasBody = body && Object.keys(body).length > 0;

    if (hasBody) {
      const changes: any = {};
      if (body.docStatus === "pending" || body.docStatus === "received") {
        changes.docStatus = { from: record.docStatus, to: body.docStatus };
        record.docStatus = body.docStatus;
      }
      if (body.workStatus === "pending" || body.workStatus === "completed") {
        changes.workStatus = { from: record.workStatus, to: body.workStatus };
        record.workStatus = body.workStatus;
      }
      if (typeof body.lastContactedAt === "string") {
        const d = new Date(body.lastContactedAt);
        if (!isNaN(d.getTime())) {
          changes.lastContactedAt = { from: record.lastContactedAt, to: d };
          record.lastContactedAt = d;
        }
      }

      // mark who updated
      (record as any).updatedBy = session.user.id;
      await record.save();

      // Create audit log with plain English action
      if (Object.keys(changes).length > 0) {
        const clientName = client?.name || "Unknown Client";
        const dueDateTitle = dueDate?.title || "Unknown Due Date";
        await createAudit({
          firmId: session.user.firmId,
          userId: session.user.id,
          dueDateClientId: record._id,
          dueDateId: record.dueDateId,
          clientId: record.clientId,
          action: AuditActions.DUE_DATE_CLIENT_UPDATED(clientName, dueDateTitle, changes),
          actionType: "edited",
          details: { changes },
        });
      }

      return NextResponse.json(record, { status: 200 });
    } else {
      // Preserve original toggle behavior when no body is sent
      const prev = record.docStatus;
      record.docStatus = record.docStatus === "pending" ? "received" : "pending";
    (record as any).updatedBy = session.user.id;
    await record.save();
      
      const clientName = client?.name || "Unknown Client";
      const dueDateTitle = dueDate?.title || "Unknown Due Date";
      await createAudit({
        firmId: session.user.firmId,
        userId: session.user.id,
        dueDateClientId: record._id,
        dueDateId: record.dueDateId,
        clientId: record.clientId,
        action: AuditActions.DUE_DATE_CLIENT_UPDATED(clientName, dueDateTitle, { docStatus: { from: prev, to: record.docStatus } }),
        actionType: "edited",
        details: { from: prev, to: record.docStatus },
      });

      return NextResponse.json(record, { status: 200 });
    }
  } catch (err) {
    console.error("Update duedate-client error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}