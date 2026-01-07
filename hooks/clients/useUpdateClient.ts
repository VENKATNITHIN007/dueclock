"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFormInput } from "@/schemas/formSchemas";
import { queryKeys } from "@/lib/querykeys";
import { ClientType } from "@/schemas/apiSchemas/clientSchema";

interface ApiError extends Error {
  data?: unknown;
  status?: number;
}

interface UpdateClientPayload {
  id: string;
  data: clientFormInput;
}

export function useUpdateClient() {
  const qc = useQueryClient();

  return useMutation<ClientType, ApiError, UpdateClientPayload>({
    mutationFn: async ({ id, data }: UpdateClientPayload) => {
      const res = await fetch(`/api/clients/${id}`, {
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

      return payload as ClientType;
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: queryKeys.clients.all });
      qc.invalidateQueries({ queryKey: queryKeys.clients.detail(updated._id) });
      qc.invalidateQueries({ queryKey: queryKeys.firm.activity(null) });
    },
    retry: 0,
  });
}
