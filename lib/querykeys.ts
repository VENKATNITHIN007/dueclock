// Centralized query keys for React Query

export const queryKeys = {
  clients: {
    all: ["clients"] as const,
    detail: (_id: string) => ["clients", _id] as const,
  },
  dues: {
    all: ["dues"] as const,
    detail: (_id: string) => ["dues", _id] as const,
  },
  user: {
    profile: ["user"] as const,
  },
}