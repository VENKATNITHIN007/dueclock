import { z } from "zod";

const phoneOptional = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, "Phone must be with country code like +919876543210")
  .or(z.literal(""))
  .optional();

export const userProfileFormSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  phoneNumber: phoneOptional,
});
export type userProfileFormInput = z.infer<typeof userProfileFormSchema>;

export const clientFormSchema = z.object({
  name: z.string().min(1, { error: "Client name is required" }),
  type: z.enum(["Individual", "Business"]),
  phoneNumber: phoneOptional,
  email: z.string().email({ error: "Invalid email" })
  .or(z.literal(""))
  .optional(),
});
export type clientFormInput = z.infer<typeof clientFormSchema>;

export const dueFormSchema = z.object({
  title: z.string().min(1, { error: "Title is required" }),
  description: z.string().optional(),
  date: z.string().refine((s)=>{const d = new Date(s);
    return !isNaN(d.getTime()) && d > new Date();
  },{
    message:"Date can't be less than today"
  }),
  clientId: z.string("client required"
  ),
  status: z.enum(["pending", "completed"]),
});
export type dueFormInput = z.infer<typeof dueFormSchema>;

export const dueFormSchemaBackend = z.object({
  clientId: z.string().min(1,"client is requried"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.coerce.date().refine(
    (d) => d > new Date(),
    "Date must be greater than today"
  ),
  status: z.enum(["pending", "completed"]).default("pending"),
})

export type DueFormInputBackend = z.infer<typeof dueFormSchemaBackend>
