"use client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/querykeys"
import { userProfileFormInput} from "@/lib/schemas";
import { UserType } from "@/lib/databaseSchemas"

type UpdateUserInput = {  data: userProfileFormInput }

export function useUpdateUser() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({  data }: UpdateUserInput) => {
      const res = await fetch(`/api/user`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })
      if (!res.ok) throw await res.json()
      return res.json() as Promise<UserType>
    },

    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.user.profile })
    },

    retry: 0,
  })
}