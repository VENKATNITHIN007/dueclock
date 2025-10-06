import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectionToDatabase } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import DueDate from "@/models/DueDate";
import { Parser } from "json2csv"; // Fixed import

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectionToDatabase();

    // Fetch only pending dues for the current firm
    const dues = await DueDate.find({ 
      firmId: session.user.firmId, 
      status: "pending" 
    })
      .populate("clientId", "name email phoneNumber")
      .select("title date label recurrence status")
      .lean();

    if (!dues.length) {
      return NextResponse.json({ error: "No pending dues found" }, { status: 404 });
    }

    // Prepare clean data for CSV
    const data = dues.map(d => ({
      title: d.title,
      date: d.date ? new Date(d.date).toISOString().slice(0, 10) : "",
      name: d.clientId?.name || "",
      email: d.clientId?.email || "",
      phoneNumber: d.clientId?.phoneNumber || "",
      label: d.label || "",
      recurrence: d.recurrence || "none",
      status: d.status
    }));

    const parser = new Parser({ // Now using the correctly imported Parser
      fields: [
        "title",
        "date",
        "name",
        "email",
        "phoneNumber",
        "label",
        "recurrence",
        "status",
      ],
    });
    const csv = parser.parse(data);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=pending-dues-${Date.now()}.csv`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export dues" }, { status: 500 });
  }
}