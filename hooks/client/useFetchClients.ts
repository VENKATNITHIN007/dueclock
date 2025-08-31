// hooks/client/useFetchClients.ts
"use client";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";
import { ClientType } from "@/lib/databaseSchemas";

export function useFetchClients() {
  return useQuery({
    queryKey: queryKeys.clients.all,
    queryFn: async () => {
      const res = await fetch("/api/clients", { credentials: "include" });
      if (!res.ok) throw await res.json();
      return res.json() as Promise<ClientType[]>;
    },
  });
}