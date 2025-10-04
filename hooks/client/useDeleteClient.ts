"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/querykeys"
import { ClientType } from "@/schemas/apiSchemas/clientSchema"

export function useDeleteClient() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/clients/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        const err = new Error(payload?.message ?? `Request failed: ${res.status}`)
        ;(err as any).data = payload
        ;(err as any).status = res.status
        throw err
      }

      return payload as ClientType[]
    },
    onSuccess: (_, id ) => {
      qc.invalidateQueries({ queryKey: queryKeys.clients.all })
        qc.invalidateQueries({ queryKey: queryKeys.dues.all })
      qc.invalidateQueries({ queryKey: queryKeys.clients.detail(id) })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.counts })
    },
    retry: 0,
  })
}
