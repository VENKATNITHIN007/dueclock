"use client"
import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/querykeys"
import { UserType } from "@/lib/databaseSchemas"


export function useFetchUser() {
  return useQuery({
    queryKey: queryKeys.user.profile,
    queryFn: async () => {
      const res = await fetch("/api/user", {
        credentials: "include",
      })
      if (!res.ok) throw await res.json()
      return res.json() as Promise<UserType>
    },
  })
}