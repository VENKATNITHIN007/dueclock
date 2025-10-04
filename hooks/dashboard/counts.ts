// hooks/dashboard/useFetchDashboard.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";

type DashboardCounts = {
  totalClients: number;
  pendingDues: number;
  urgent: number;
  passed: number;
  completedThisMonth: number; // NEW
};

export function useFetchDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard?.counts ?? ["dashboard-counts"],
    queryFn: async (): Promise<DashboardCounts> => {
      const res = await fetch("/api/dashboard", { credentials: "include" });
      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        const err = new Error(payload?.message ?? `Request failed: ${res.status}`)
        ;(err as any).data = payload
        ;(err as any).status = res.status
        throw err
      }

      return payload as DashboardCounts
    },
    staleTime: 1000 * 60 * 2,
  });
}