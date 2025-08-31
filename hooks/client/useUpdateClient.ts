"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ClientType } from "@/lib/databaseSchemas"
import { clientFormInput } from "@/lib/schemas"
import { queryKeys } from "@/lib/querykeys"

type UpdateClientInput = { id: string; data: clientFormInput }

export function useUpdateClient() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: UpdateClientInput) => {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })

      if (!res.ok) throw await res.json()
      return res.json() as Promise<ClientType>
    },

    onSuccess: (updated) => {
      // ✅ refresh the list and this specific client
      qc.invalidateQueries({ queryKey: queryKeys.clients.all })
      qc.invalidateQueries({ queryKey: queryKeys.clients.detail(updated._id!) })
    },

    retry: 0,
  })
}