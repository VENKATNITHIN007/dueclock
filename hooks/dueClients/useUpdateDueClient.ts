// hooks/dueClient/useUpdateDueClient.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";

type UpdatePayload = {
  docStatus?: "pending" | "received";
  workStatus?: "pending" | "completed";
  contacted?: boolean;
  lastContactedAt?: string;
};

export function useUpdateDueClient(dueDateId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePayload;
    }) => {
      const res = await fetch(`/api/duedate-client/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.dueclient.detail(dueDateId) });
      qc.invalidateQueries({ queryKey: queryKeys.dues.detail(dueDateId) });
      qc.invalidateQueries({ queryKey: queryKeys.dues.all });
      qc.invalidateQueries({ queryKey: queryKeys.firm.details });
      qc.invalidateQueries({ queryKey: queryKeys.clients.all});

    },
  });
}