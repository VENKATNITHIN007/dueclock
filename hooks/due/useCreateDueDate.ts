// hooks/due/useCreateDueDate.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { dueFormInput } from "@/schemas/formSchemas"
import { queryKeys } from "@/lib/querykeys"
import { DueType } from "@/schemas/apiSchemas/dueDateSchema"

type Payload = { clientId: string; data: dueFormInput }

export function useCreateDueDate() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ clientId, data }: Payload) => {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data), // only the due data in body
      })

      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        const err = new Error(payload?.message ?? `Request failed: ${res.status}`)
        ;(err as any).data = payload
        ;(err as any).status = res.status
        throw err
      }

      return payload as DueType
    },
    onSuccess: (due) => {
      console.log(due)
      qc.invalidateQueries({ queryKey: queryKeys.dues.all })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.counts })
      qc.invalidateQueries({ queryKey: queryKeys.clients.detail(due.clientId) })
    },
    retry: 0,
  })
}
