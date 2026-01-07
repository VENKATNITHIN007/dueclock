import { z } from "zod";

const phoneOptional = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, "Phone must be in format like +919876543210")
  .optional();

export const userSchemaApi = z
  .object({
    id: z.string(), // from _id
    email: z.string().email(),
    name: z.string(),
    phoneNumber: phoneOptional,
    image: z.string().optional(),
    googleId: z.string().optional(),
    firmId: z.string().optional(),
    role: z.enum(["solo", "ca", "owner"]),
  })
  .catchall(z.unknown());
export type UserType = z.infer<typeof userSchemaApi>;
