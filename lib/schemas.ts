import { z } from "zod";

const clientTypeEnum = z.enum(["Individual", "Business"]);

const dueStatusEnum = z.enum([
  "notReadyToFile",
  "readyToFile",
  "completed",
]);

const phoneOptional = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, "Phone must be in format like +919876543210")
  .or(z.literal(""))
  .optional();

export const userProfileFormSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  phoneNumber: phoneOptional,
});
export type userProfileFormInput = z.infer<typeof userProfileFormSchema>;

export const clientFormSchema = z.object({
  name: z.string().min(1, { error: "Client name is required" }),
  type: clientTypeEnum.optional(),
  phoneNumber: phoneOptional,
  email: z.string().email({ error: "Invalid email" }).optional(),
});
export type clientFormInput = z.infer<typeof clientFormSchema>;

export const dueFormSchema = z.object({
  title: z.string().min(1, { error: "Title is required" }),
  description: z.string().optional(),
  date: z
    .date()
    .refine((d) => !Number.isNaN(d.getTime()), {
      message: "Date is required",
    })
    .refine((d) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const input = new Date(d);
      input.setHours(0, 0, 0, 0);
      return input >= today;
    }, { message: "Date must be today or later" }),
  clientId: z.string("client required"
  ),
  status: dueStatusEnum.default("notReadyToFile"),
});
export type dueFormInput = z.input<typeof dueFormSchema>;
export type dueFormOutput = z.output<typeof dueFormSchema>;