// hooks/due-dates/useFetchDueDateClients.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";

export function useFetchDueClients(dueDateId: string) {
  return useQuery({
    queryKey: queryKeys.dueclient.detail(dueDateId),
    queryFn: async () => {
      const res = await fetch(`/api/duedates/${dueDateId}/`, {
        credentials: "include",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const err = new Error(payload?.message ?? `Request failed: ${res.status}`);
        (err as any).data = payload;
        (err as any).status = res.status;
        throw err;
      }
      return payload;
    },
    enabled: !!dueDateId,
    staleTime: 1000 * 60 * 2,
  });
}