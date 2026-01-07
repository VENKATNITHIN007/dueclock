import { useQuery } from "@tanstack/react-query";

export const useFetchClientLimitStatus = () => {
  return useQuery({
    queryKey: ["client-limit-status"],
    queryFn: async () => {
      const response = await fetch("/api/subscription/limits/clients");
      if (!response.ok) {
        throw new Error("Failed to fetch client limit status");
      }
      return response.json();
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
};