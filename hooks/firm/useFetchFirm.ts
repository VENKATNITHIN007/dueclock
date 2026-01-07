"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";
import { FirmDetailsResponse } from "@/schemas/apiSchemas/firmSchema";

interface ApiError extends Error {
  data?: unknown;
  status?: number;
}

export function useFetchFirm() {
  return useQuery<FirmDetailsResponse, ApiError>({
    queryKey: queryKeys.firm.details,
    queryFn: async () => {
      const res = await fetch("/api/firm", {
        credentials: "include",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        const err = new Error(payload?.error || payload?.message || `Request failed: ${res.status}`) as ApiError;
        err.data = payload;
        err.status = res.status;
        throw err;
      }
      return payload as FirmDetailsResponse;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}