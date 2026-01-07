"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";

type UpdateUserData = {
  name: string;
};

export function useUpdateUser() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ data }: { data: UpdateUserData }) => {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const err = new Error(payload?.error ?? `Request failed: ${res.status}`);
        (err as any).data = payload;
        throw err;
      }

      return payload;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.user.profile });
      qc.invalidateQueries({ queryKey: queryKeys.firm.details });
    },
  });
}

