 import { z } from "zod"
import { ClientType} from "./clientSchema";


 export const dueSchemaApi = z.object({
  _id: z.string(),
  title: z.string(),
  date: z.string(),
  label:z.string(),
  recurrence:z.enum(["none","monthly","quarterly","yearly"]),
  clientId: z.string(),
  firmId: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum(["pending", "completed"]),
  clientName:z.string(),
  phoneNumber:z.string().optional(),
  email:z.email().optional()
}).catchall(z.unknown())

export type DueType = z.infer<typeof dueSchemaApi>


export type DueDateWithClient = 
DueType & {
  client:ClientType
}


export type GroupedDue=
{
  year:number
  month:number
  dues:DueType[]
}
