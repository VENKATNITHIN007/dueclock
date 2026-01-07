import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectionToDatabase } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import Client from "@/models/Client";
import { canAddOrDelete, getUserRole } from "@/lib/permissions";
import { createAudit, AuditActions } from "@/lib/audit";
import { checkClientLimit } from "@/lib/subscriptionLimits";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = getUserRole(session);
    if (!canAddOrDelete(role)) {
      return NextResponse.json({ error: "Forbidden: You do not have permission to import clients" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.clients)) {
      return NextResponse.json({ error: "Invalid payload: expected { clients: [] }" }, { status: 400 });
    }

    const clients = body.clients as any[];
    if (!clients.length) {
      return NextResponse.json({ error: "No clients provided" }, { status: 400 });
    }

    await connectionToDatabase();

    interface RowError {
      row: number;
      errors: string[];
    }

    interface ClientInsert {
      firmId: string | mongoose.Types.ObjectId;
      name: string;
      phoneNumber?: string;
      email?: string;
    }

    const toInsert: ClientInsert[] = [];
    const errors: RowError[] = [];

    // Validation regex patterns
    const phoneRe = /^\+91\d{10}$/; // Must start with +91 followed by 10 digits
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation

    clients.forEach((c, idx) => {
      const rowNum = idx + 1;
      const name = typeof c.name === "string" ? c.name.trim() : "";
      const phone = typeof c.phoneNumber === "string" ? c.phoneNumber.trim() : "";
      const email = typeof c.email === "string" ? c.email.trim() : "";
      const rowErrors: string[] = [];

      // Name validation (required)
      if (!name) {
        rowErrors.push("Name is required");
      }

      // Phone validation (if provided, must start with +91)
      if (phone) {
        if (!phone.startsWith("+91")) {
          rowErrors.push("Phone number must start with +91");
        } else if (!phoneRe.test(phone)) {
          rowErrors.push("Phone number must be +91 followed by 10 digits (e.g., +919876543210)");
        }
      }

      // Email validation (if provided, must be valid)
      if (email && !emailRe.test(email)) {
        rowErrors.push("Invalid email format");
      }

      if (rowErrors.length > 0) {
        errors.push({ row: rowNum, errors: rowErrors });
      } else {
        if (!session.user.firmId) {
          return NextResponse.json({ error: "Firm ID not found" }, { status: 400 });
        }
        const clientData: ClientInsert = {
          firmId: session.user.firmId,
          name,
        };
        if (phone) clientData.phoneNumber = phone;
        if (email) clientData.email = email;
        toInsert.push(clientData);
      }
    });

    if (errors.length) {
      const errorMessage = errors
        .map((e) => `Row ${e.row}: ${e.errors.join(", ")}`)
        .join("\n");
      return NextResponse.json(
        { error: "Validation failed", details: errors, message: errorMessage },
        { status: 400 }
      );
    }

    // Check client limit before importing
    const clientLimit = await checkClientLimit(session.user.firmId);
    const newClientsCount = toInsert.length;
    const totalAfterImport = clientLimit.current + newClientsCount;
    
    if (totalAfterImport > clientLimit.limit) {
      const allowedToAdd = Math.max(0, clientLimit.limit - clientLimit.current);
      return NextResponse.json({ 
        error: `Cannot import ${newClientsCount} clients. Current: ${clientLimit.current}, Limit: ${clientLimit.limit}. You can only add ${allowedToAdd} more client(s). ${clientLimit.plan === 'free' ? 'Upgrade to Premium for up to 100 clients.' : ''}`,
        limitReached: true,
        plan: clientLimit.plan,
        current: clientLimit.current,
        limit: clientLimit.limit,
        attempted: newClientsCount,
        allowed: allowedToAdd
      }, { status: 400 });
    }

    const inserted = await Client.insertMany(toInsert);

    // Create audit log - import creates new items, use "created" actionType
    await createAudit({
      firmId: session.user.firmId,
      userId: session.user.id,
      action: AuditActions.CLIENTS_IMPORTED(inserted.length),
      actionType: "created",
      details: { count: inserted.length },
    });

    return NextResponse.json({ insertedCount: inserted.length, inserted }, { status: 201 });
  } catch (err) {
    console.error("Clients import error:", err);
    return NextResponse.json({ error: "Failed to import clients" }, { status: 500 });
  }
}
