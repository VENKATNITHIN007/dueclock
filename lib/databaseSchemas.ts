
import { z } from "zod"

const phoneOptional = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, "Phone must be in format like +919876543210")
  .optional();


// ✅ Client backend schema
export const clientSchemaBackend = z.object({
  _id: z.string(), // from _id
  name: z.string(),
  phoneNumber: phoneOptional,
  email: z.string().email().optional(),
  type: z.enum(["Individual", "Business"]).optional(),
  userId: z.string(),
  firmId: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type ClientType = z.infer<typeof clientSchemaBackend>

// ✅ User backend schema
export const userSchemaBackend = z.object({
  id: z.string(), // from _id
  email: z.string().email(),
  name: z.string(),
  phoneNumber: phoneOptional,
  image: z.string().optional(),
  googleId: z.string().optional(),
  firmId: z.string().optional(),
  role: z.enum(["solo", "ca", "owner"]).default("solo"),
  referralCode: z.string().optional(),
  referredBy: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type UserType = z.infer<typeof userSchemaBackend>

// ✅ DueDate backend schema
export const dueSchemaBackend = z.object({
  id: z.string(), // from _id
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date(),
  clientId: z.string(),
  firmId: z.string().optional(),
  userId: z.string(),
  status: z.enum(["notRedayToFile", "readyToFile", "completed"]).default("notRedayToFile"),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type DueType = z.infer<typeof dueSchemaBackend>