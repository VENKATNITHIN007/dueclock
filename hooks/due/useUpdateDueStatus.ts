"use client"

import { queryKeys } from "@/lib/querykeys"
import { useMutation, useQueryClient } from "@tanstack/react-query"
export function useUpdateDueStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ dueId, status }: { dueId: string; status: string }) => {
      const res = await fetch(`/api/duedate/${dueId}/completed`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }), // ✅ only send status
      })
      if (!res.ok) throw new Error("Failed to update status")
      return res.json()
    },
    onMutate: async ({ dueId, status }) => {
      await queryClient.cancelQueries({ queryKey:queryKeys.dues.all})

      const prevData = queryClient.getQueryData<any[]>(queryKeys.dues.all)

      queryClient.setQueryData<any[]>(queryKeys.dues.all, (old) =>
        old
          ? old.map((due) =>
              due._id === dueId ? { ...due, status } : due
            )
          : []
      )

      return { prevData }
    },
    onError: (_err, _vars, context) => {
      if (context?.prevData) {
        queryClient.setQueryData(queryKeys.dues.all, context.prevData)
      }
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({ queryKey:queryKeys.dues.all  })
       queryClient.invalidateQueries({ queryKey:queryKeys.dues.detail(data._id)  })
       queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.counts })
    },
  })
}