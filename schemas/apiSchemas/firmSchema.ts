import { z } from "zod";
import { userSchemaApi } from "./userSchema";

export const firmSchemaApi = z.object({
  _id: z.string(),
  firmName: z.string(),
  ownerId: z.string().optional(),
});

export type FirmType = z.infer<typeof firmSchemaApi>;

export const firmDetailsResponseSchema = z.object({
  firm: firmSchemaApi,
  user: userSchemaApi.extend({
    role: z.enum(["owner", "admin", "staff"]), // Updated role enum
  }),
});

export type FirmDetailsResponse = z.infer<typeof firmDetailsResponseSchema>;

export const memberSchemaApi = z.object({
  _id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["owner", "admin", "staff"]),
});

export type MemberType = z.infer<typeof memberSchemaApi>;

