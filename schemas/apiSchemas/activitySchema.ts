import { z } from "zod";

export const activitySchemaApi = z.object({
  _id: z.string(),
  action: z.string(),
  actionType: z.enum(["created", "edited", "deleted"]),
  category: z.enum(["clients", "duedates", "firm"]),
  details: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
  dueDateId: z.string().nullable().optional(),
  dueDateClientId: z.string().nullable().optional(),
  clientId: z.string().nullable().optional(),
  userName: z.string().nullable().optional(),
  userEmail: z.string().nullable().optional(),
  dueDateTitle: z.string().nullable().optional(),
  dueDateDate: z.string().nullable().optional(),
  clientName: z.string().nullable().optional(),
});

export type ActivityType = z.infer<typeof activitySchemaApi>;

export const activityResponseSchema = z.object({
  activities: z.array(activitySchemaApi),
});

export type ActivityResponse = z.infer<typeof activityResponseSchema>;

export const activityFilterSchema = z.object({
  category: z.enum(["clients", "duedates", "firm"]).optional(),
  dueDateId: z.string().optional(),
  clientId: z.string().optional(),
  userId: z.string().optional(),
  actionTypes: z.string().optional(), // Comma-separated: "created,edited,deleted"
  period: z.enum(["day", "week", "month"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().optional(),
});

export type ActivityFilter = z.infer<typeof activityFilterSchema>;

