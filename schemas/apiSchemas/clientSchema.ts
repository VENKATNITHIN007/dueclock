// ✅ Client backend schema
import { z } from "zod"
import { DueType } from "./dueDateSchema";


const phoneOptional = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, "Phone must be in format like +919876543210")
  .optional();

export const clientSchemaApi = z.object({
  _id: z.string(), // from _id
  name: z.string(),
  phoneNumber: phoneOptional,
  email: z.string().email().optional(),
  firmId: z.string().optional(),
  pendingDues:z.number(),
}).catchall(z.unknown())

export type ClientType = z.infer<typeof clientSchemaApi>

export type clientWithDueDate = 
ClientType & {
  dueDates:DueType[]
}


