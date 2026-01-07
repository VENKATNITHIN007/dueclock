// hooks/due/useAttachClients.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";

export function useAttachClients(dueDateId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (clientIds:string[]) => {
      const res = await fetch(`/api/duedate-client`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ dueDateId,clientIds }),
      });
      if (!res.ok) throw new Error("Attach failed");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.dueclient.detail(dueDateId) });
      qc.invalidateQueries({ queryKey: queryKeys.dues.detail(dueDateId) });
      qc.invalidateQueries({ queryKey: queryKeys.clients.all });
      qc.invalidateQueries({ queryKey: queryKeys.dues.all });
      qc.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "activity" 
      });
    },
  });
}
