"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";
import { MemberType } from "@/schemas/apiSchemas/firmSchema";

interface ApiError extends Error {
  data?: unknown;
  status?: number;
}

export function useFetchMembers() {
  return useQuery<MemberType[], ApiError>({
    queryKey: queryKeys.firm.members,
    queryFn: async () => {
      const res = await fetch("/api/members", {
        credentials: "include",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const err = new Error(payload?.error || `Request failed: ${res.status}`) as ApiError;
        err.data = payload;
        err.status = res.status;
        throw err;
      }
      return payload as MemberType[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}


