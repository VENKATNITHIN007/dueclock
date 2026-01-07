import { z } from "zod";

export const dueDateListItemSchemaApi = z.object({
  _id: z.string(),
  title: z.string(),
  date: z.string(),
  pendingCount: z.number(),
  totalClients: z.number(),
});

export type DueDateListItemType = z.infer<typeof dueDateListItemSchemaApi>;

