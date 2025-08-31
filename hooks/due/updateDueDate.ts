"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Due } from "@/lib/databaseSchemas"

type UpdateDueInput = { id: string; data: Partial<Omit<Due, "id" | "createdAt" | "updatedAt">> }

export function useUpdateDue() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: UpdateDueInput) => {
      const res = await fetch(`/api/dues/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw await res.json()
      return res.json() as Promise<Due>
    },

    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["dues"] })
      qc.invalidateQueries({ queryKey: ["dues", updated.id] })
    },

    retry: 0,
  })
}