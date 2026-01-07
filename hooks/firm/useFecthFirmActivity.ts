// hooks/firm/useFirmActivity.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";
import { ActivityResponse, ActivityFilter } from "@/schemas/apiSchemas/activitySchema";

interface ApiError extends Error {
  data?: unknown;
  status?: number;
}

export function useFirmActivity(filter?: ActivityFilter) {
  return useQuery<ActivityResponse, ApiError>({
    queryKey: queryKeys.firm.activity(filter || null),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filter?.category) params.set("category", filter.category);
      if (filter?.dueDateId) params.set("dueDateId", filter.dueDateId);
      if (filter?.clientId) params.set("clientId", filter.clientId);
      if (filter?.userId) params.set("userId", filter.userId);
      if (filter?.actionTypes) params.set("actionTypes", filter.actionTypes);
      if (filter?.period) params.set("period", filter.period);
      if (filter?.startDate) params.set("startDate", filter.startDate);
      if (filter?.endDate) params.set("endDate", filter.endDate);
      if (filter?.limit) params.set("limit", String(filter.limit));
      
      const url = `/api/firm/activity${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, {
        credentials: "include",
      });
      
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const err = new Error(payload?.error || `Request failed: ${res.status}`) as ApiError;
        err.data = payload;
        err.status = res.status;
        throw err;
      }
      
      return payload as ActivityResponse;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}