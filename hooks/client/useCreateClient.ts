"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { clientFormInput } from "@/lib/schemas"
import { ClientType } from "@/lib/databaseSchemas"
import { queryKeys } from "@/lib/querykeys"

export function useCreateClient() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (data: clientFormInput) => {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw await res.json()
      return res.json() as Promise<ClientType>
    },

    onSuccess: () => {
      // refresh client list after create
      qc.invalidateQueries({ queryKey: queryKeys.clients.all })
    },

    retry: 0,
  })
}