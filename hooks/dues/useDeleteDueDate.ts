"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";

interface ApiError extends Error {
  data?: unknown;
  status?: number;
}

interface DeleteResponse {
  clientId?: string;
}

export function useDeleteDueDate() {
  const qc = useQueryClient();

  return useMutation<DeleteResponse, ApiError, string>({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/duedates/${id}`, {
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

      return payload as DeleteResponse;
    },
    onSuccess: (deleted, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.dues.all });
      qc.invalidateQueries({ queryKey: queryKeys.dues.detail(id) });
      qc.invalidateQueries({ queryKey: queryKeys.firm.activity(null) });
      if (deleted?.clientId) {
        qc.invalidateQueries({ queryKey: queryKeys.clients.detail(deleted.clientId) });
      }
    },
    retry: 0,
  });
}
