import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { clientFormSchema } from "@/lib/schemas";
import { zodToFieldErrors } from "@/lib/zodError";
import Client from "@/models/Client";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectionToDatabase();

    const clients = await Client.find({ userId: session.user.id })
      .select("name email phoneNumber type")
      .lean();

    return NextResponse.json(clients, { status: 200 });
  } catch (err) {
    console.error("GET clients error:", err);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = clientFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(zodToFieldErrors(parsed.error), { status: 400 });
    }

    await connectionToDatabase();

    const newClient = await Client.create({
      userId: session.user.id,
      firmId: session.user.firmId || null,
      name: parsed.data.name.trim(),
      email: parsed.data.email,
      phoneNumber: parsed.data.phoneNumber,
      type: parsed.data.type || "Individual",
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (err) {
    console.error("POST client error:", err);
    return NextResponse.json({ error: "Failed to add client" }, { status: 500 });
  }
}