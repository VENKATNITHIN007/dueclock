"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";

interface ApiError extends Error {
  data?: unknown;
  status?: number;
}

export function useDeleteClient() {
  const qc = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/clients/${id}`, {
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
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.clients.all });
      qc.invalidateQueries({ queryKey: queryKeys.dues.all });
      qc.invalidateQueries({ queryKey: queryKeys.clients.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.dueclient.all });
      qc.invalidateQueries({ queryKey: queryKeys.firm.activity(null) });
    },
    retry: 0,
  });
}
