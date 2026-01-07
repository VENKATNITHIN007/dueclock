"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clientFormInput } from "@/schemas/formSchemas";
import { queryKeys } from "@/lib/querykeys";
import { ClientType } from "@/schemas/apiSchemas/clientSchema";

interface ApiError extends Error {
  data?: unknown;
  status?: number;
}

export function useCreateClient() {
  const qc = useQueryClient();

  return useMutation<ClientType, ApiError, clientFormInput>({
    mutationFn: async (data: clientFormInput) => {
      const res = await fetch("/api/clients", {
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

      return payload as ClientType;
    },
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: queryKeys.clients.all });
      qc.invalidateQueries({ queryKey: queryKeys.firm.activity(null) });
      if (created?._id) {
        qc.invalidateQueries({ queryKey: queryKeys.clients.detail(created._id) });
      }
    },
    retry: 0,
  });
}
