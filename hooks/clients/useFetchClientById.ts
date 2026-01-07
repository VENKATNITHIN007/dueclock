"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";
import { clientWithDueDate } from "@/schemas/apiSchemas/clientSchema";

interface ApiError extends Error {
  data?: unknown;
  status?: number;
}

export function useFetchClientById(id: string) {
  return useQuery<clientWithDueDate, ApiError>({
    queryKey: queryKeys.clients.detail(id),
    queryFn: async () => {
      const res = await fetch(`/api/clients/${id}`, { credentials: "include" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const err = new Error(
          payload?.error || payload?.message || `Request failed: ${res.status}`
        ) as ApiError;
        err.data = payload;
        err.status = res.status;
        throw err;
      }

      return payload as clientWithDueDate;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
