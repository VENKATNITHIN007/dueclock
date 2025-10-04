import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { clientFormSchema,clientFormInput, dueFormSchemaBackend } from "@/schemas/formSchemas";
import { zodToFieldErrors } from "@/lib/zodError";
import Client from "@/models/Client";
import DueDate from "@/models/DueDate";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// get single client
export async function GET(req: NextRequest,   { params }: { params: Promise<{ id: string }> } ) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } =  await params;

    await connectionToDatabase();

    const client = await Client.findOne({ _id: id, firmId: session.user.firmId })
    .select("-__v -createdAt -updatedAt")
    .lean();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    const dueDates = await DueDate.find({clientId:id}).sort({date:1});

    return NextResponse.json({...client,dueDates}, {status:200});
  } catch (err) {
    console.error("GET single client error:", err);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}
export async function PATCH(req: NextRequest,    { params }: { params: Promise<{ id: string }> } ) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } =  await params;
     const body = await req.json();
     const parsed = clientFormSchema.safeParse(body);
     
         if (!parsed.success) {
           return NextResponse.json(zodToFieldErrors(parsed.error),
             { status: 400 }
           );
         }
        const updateFields: Partial<clientFormInput> = {};
            if (parsed.data.name !== undefined) updateFields.name = parsed.data.name;
            if (parsed.data.email !== undefined) updateFields.email = parsed.data.email;
            if (parsed.data.phoneNumber !== undefined) updateFields.phoneNumber = parsed.data.phoneNumber;
           
            
    await connectionToDatabase();

    const updatedClient = await Client.findOneAndUpdate(
      { _id: id, firmId: session.user.firmId },
      { $set: updateFields },
      { new: true }
    ).select("-__v -createdAt -updatedAt")
    .lean();;

    if (!updatedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(updatedClient,{status:200});
  } catch (e:any){
    console.log(e)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}

// Delete a client
export async function DELETE(req: NextRequest,  { params }: { params: Promise<{ id: string }> } ) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectionToDatabase();

    const deletedClient = await Client.findOneAndDelete({ _id: id, firmId: session.user.firmId });

    if (!deletedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    await DueDate.deleteMany({clientId:id,firmId:session.user.firmId});

    return NextResponse.json({ message: "Client deleted and all due dates of client deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}


export async function POST(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.firmId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    }
     const { id } = await params;

    const body = await req.json()
    const parsed = dueFormSchemaBackend.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(zodToFieldErrors(parsed.error), { status: 400 })
    }

    // Add missing fields here (not from body)
    const dueData = {
      ...parsed.data,
      clientId: id,   
      firmId: session.user.firmId, 
    }

    await connectionToDatabase()

    // Ensure client belongs to this user
    const client = await Client.findOne({
      _id: dueData.clientId,
      firmId: session.user.firmId,
    })
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const due = await DueDate.create(dueData)
    return NextResponse.json(due, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
