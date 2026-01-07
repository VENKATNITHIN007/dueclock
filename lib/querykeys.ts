import { ActivityFilter } from "@/schemas/apiSchemas/activitySchema";

export const queryKeys = {
  clients: {
    all: ["clients"] as const,
    detail: (id: string) => ["clients", id] as const,
  },
  dues: {
    all: ["dues"] as const,
    detail: (id: string) => ["dues", id] as const,
  },
  user: {
    profile: ["user"] as const,
  },
  dueclient: {
    all: ["dueclient"] as const,
    detail: (id: string) => ["dueclient", id] as const,
  },
  firm: {
    activity: (filter: ActivityFilter | null) => ["activity", filter] as const,
    details: ["details"] as const,
    members: ["members"] as const,
  },
};