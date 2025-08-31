"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Due } from "@/lib/databaseSchemas"

export function useDeleteDue() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api(`/api/dues/${id}`, {
        method: "DELETE",
      }),

    // ✅ optimistic: remove from list immediately
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["dues"] })
      const prev = qc.getQueryData<Due[]>(["dues"])
      qc.setQueryData<Due[]>(["dues"], (old) =>
        (old ?? []).filter((d) => d.id !== id)
      )
      return { prev }
    },

    // 🔁 rollback if fails
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["dues"], ctx.prev)
    },

    // ♻ refresh after
    onSettled: (_data, _err, id) => {
      qc.invalidateQueries({ queryKey: ["dues"] })
      qc.invalidateQueries({ queryKey: ["dues", id] })
    },

    retry: 0,
  })
}