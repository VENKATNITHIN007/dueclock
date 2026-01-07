"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";

interface ApiError extends Error {
  data?: unknown;
  status?: number;
}

export function useDeleteDueClient(dueDateId: string) {
  const qc = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/duedate-client/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const err = new Error(
          payload?.error || payload?.message || `Request failed: ${res.status}`
        ) as ApiError;
        err.data = payload;
        err.status = res.status;
        throw err;
      }
    },
    onSuccess: () => {
      // Invalidate due client queries
      qc.invalidateQueries({ queryKey: queryKeys.dueclient.all });
      qc.invalidateQueries({ queryKey: queryKeys.dueclient.detail(dueDateId) });
      // Invalidate due dates list (to update counts)
      qc.invalidateQueries({ queryKey: queryKeys.dues.all });
      qc.invalidateQueries({ queryKey: queryKeys.dues.detail(dueDateId) });
      // Invalidate activity
      qc.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "activity" 
      });
    },
    retry: 0,
  });
}

