"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dueFormInput } from "@/schemas/formSchemas";
import { queryKeys } from "@/lib/querykeys";
import { DueType } from "@/schemas/apiSchemas/dueClientSchema";

interface ApiError extends Error {
  data?: unknown;
  status?: number;
}

type Payload = { data: dueFormInput };

export function useCreateDueDate() {
  const qc = useQueryClient();

  return useMutation<DueType, ApiError, Payload>({
    mutationFn: async ({ data }: Payload) => {
      const res = await fetch(`/api/duedates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
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

      return payload as DueType;
    },
    onSuccess: (due) => {
      qc.invalidateQueries({ queryKey: queryKeys.dues.all });
      if (due?.clientId) {
        qc.invalidateQueries({ queryKey: queryKeys.clients.detail(due.clientId) });
      }
      qc.invalidateQueries({ queryKey: queryKeys.firm.activity(null) });
    },
    retry: 0,
  });
}
