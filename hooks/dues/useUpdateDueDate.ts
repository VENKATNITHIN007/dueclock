"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dueFormInput } from "@/schemas/formSchemas";
import { queryKeys } from "@/lib/querykeys";
import { DueDateWithClient } from "@/schemas/apiSchemas/dueClientSchema";

interface ApiError extends Error {
  data?: unknown;
  status?: number;
}

type UpdateDueDateArgs = {
  dueId: string;
  data: dueFormInput;
};

export function useUpdateDueDate() {
  const queryClient = useQueryClient();

  return useMutation<Partial<DueDateWithClient>, ApiError, UpdateDueDateArgs>({
    mutationFn: async ({ dueId, data }: UpdateDueDateArgs) => {
      const res = await fetch(`/api/duedates/${dueId}`, {
        method: "PATCH",
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

      return payload as Partial<DueDateWithClient>;
    },
    onSuccess: (_, { dueId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dues.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dues.detail(dueId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.firm.activity(null) });
    },
    retry: 0,
  });
}