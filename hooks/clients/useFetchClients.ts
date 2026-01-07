"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";
import { ClientType } from "@/schemas/apiSchemas/clientSchema";

interface ApiError extends Error {
  data?: unknown;
  status?: number;
}

export function useFetchClients() {
  return useQuery<ClientType[], ApiError>({
    queryKey: queryKeys.clients.all,
    queryFn: async () => {
      const res = await fetch("/api/clients", { credentials: "include" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const err = new Error(
          payload?.error || payload?.message || `Request failed: ${res.status}`
        ) as ApiError;
        err.data = payload;
        err.status = res.status;
        throw err;
      }

      return payload as ClientType[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
