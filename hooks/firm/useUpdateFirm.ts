// hooks/firm/useUpdateFirm.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";

export function useUpdateFirm() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/firm", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Update firm failed");
      return res.json();
    },

    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: queryKeys.firm.details,
      });
    },
  });
}