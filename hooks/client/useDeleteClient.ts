"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { ClientType } from "@/lib/databaseSchemas"
import { queryKeys } from "@/lib/querykeys"

export function useDeleteClient() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) =>
      api<ClientType>(`/api/clients/${id}`, {
        method: "DELETE",
      }),

    // ✅ optimistic: remove from cache immediately
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: queryKeys.clients.all })
      const prev = qc.getQueryData<ClientType[]>(queryKeys.clients.all)
      qc.setQueryData<ClientType[]>(queryKeys.clients.all, (old) =>
        (old ?? []).filter((c) => c._id !== id) // use _id from backend
      )
      return { prev }
    },

    // 🔁 rollback if fails
    onError: (_e, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.clients.all, ctx.prev)
    },

    // ♻ refresh after success/fail
    onSettled: (_data, _err, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.clients.all })
      qc.invalidateQueries({ queryKey: queryKeys.clients.detail(id) })
    },

    retry: 0,
  })
}