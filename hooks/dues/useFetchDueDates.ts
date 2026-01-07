"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";
import { DueDateListItemType } from "@/schemas/apiSchemas/dueDateSchema";

interface ApiError extends Error {
  data?: unknown;
  status?: number;
}

export function useFetchDueDates() {
  return useQuery<DueDateListItemType[], ApiError>({
    queryKey: queryKeys.dues.all,
    queryFn: async () => {
      const res = await fetch("/api/duedates", { credentials: "include" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const err = new Error(
          payload?.error || payload?.message || `Request failed: ${res.status}`
        ) as ApiError;
        err.data = payload;
        err.status = res.status;
        throw err;
      }

      return payload as DueDateListItemType[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}














// "use client"

// import { useQuery } from "@tanstack/react-query"
// import { queryKeys } from "@/lib/querykeys"
// import { GroupedDue } from "@/schemas/apiSchemas/dueDateSchema"

// type Opts = {
//   status?: "pending" | "completed"
//   period?: "today" | "week" | "month"
//   filter?: "urgent" | "overdue"
//   clientId?: string
//   label?:string
// }

// export function useFetchDueDates(opts: Opts = {}) { 
//   const key=[...queryKeys.dues.all,             
//     opts.status ?? "all-status",
//     opts.period ?? "all-period",
//     opts.filter ?? "all-filter",
//     opts.clientId ?? "all-client",
//     opts.label ?? "all-label"
//   ] as const
//   return useQuery({
//    queryKey: key,
//     queryFn: async () => {
//       const qs = new URLSearchParams()
//       if (opts.status) qs.set("status", opts.status)
//       if (opts.period) qs.set("period", opts.period)
//       if (opts.filter) qs.set("filter", opts.filter)
//       if (opts.clientId) qs.set("clientId", opts.clientId)
//       if(opts.label) qs.set("label",opts.label)

//       // endpoint: /api/duedates (plural) — adjust if your route is different
//       const res = await fetch(`/api/duedate?${qs.toString()}`, { credentials: "include" })
//       const payload = await res.json().catch(() => null)
//       if (!res.ok) {
//         const err = new Error(payload?.message ?? `Request failed: ${res.status}`)
//         ;(err as any).data = payload
//         ;(err as any).status = res.status
//         throw err
//       }

//       return payload as GroupedDue[]
//     },
//     staleTime: 1000 * 60 * 5,
//   })
// }