import { useQuery } from "@tanstack/react-query";

export const useFetchDueDateLimitStatus = () => {
  return useQuery({
    queryKey: ["duedate-limit-status"],
    queryFn: async () => {
      const response = await fetch("/api/subscription/limits/duedates");
      if (!response.ok) {
        throw new Error("Failed to fetch due date limit status");
      }
      return response.json();
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
};