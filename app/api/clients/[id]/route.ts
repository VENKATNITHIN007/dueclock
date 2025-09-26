import { authOptions } from "@/lib/auth";
import { connectionToDatabase } from "@/lib/db";
import { clientFormSchema,clientFormInput } from "@/schemas/formSchemas";
import { zodToFieldErrors } from "@/lib/zodError";
import Client from "@/models/Client";
import DueDate from "@/models/DueDate";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

// get single client
export async function GET(req: NextRequest,   context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } =  await context.params;

    await connectionToDatabase();

    const client = await Client.findOne({ _id: id, userId: session.user.id })
    .select("-__v -createdAt -updatedAt")
    .lean();

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    const dueDates = await DueDate.find({clientId:id}).lean();

    return NextResponse.json({...client,dueDates}, {status:200});
  } catch (err) {
    console.error("GET single client error:", err);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}
export async function PATCH(req: NextRequest,    context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } =  await context.params;
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
            if (parsed.data.type !== undefined) updateFields.type = parsed.data.type;
            
    await connectionToDatabase();

    const updatedClient = await Client.findOneAndUpdate(
      { _id: id, userId: session.user.id },
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
export async function DELETE(req: NextRequest,  context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    await connectionToDatabase();

    const deletedClient = await Client.findOneAndDelete({ _id: id, userId: session.user.id });

    if (!deletedClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }
    await DueDate.deleteMany({clientId:id,userId:session.user.id});

    return NextResponse.json({ message: "Client deleted and all due dates of client deleted successfully" });
  } catch {
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 });
  }
}