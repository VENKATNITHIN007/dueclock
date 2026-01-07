import { useQuery } from "@tanstack/react-query";

export const useFetchSubscription = () => {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const response = await fetch("/api/subscription");
      if (!response.ok) {
        if (response.status === 404) {
          // No subscription found, return default free subscription
          return {
            plan: "free",
            status: "active",
            renewsAt: null,
            expiryDate: null
          };
        }
        throw new Error("Failed to fetch subscription");
      }
      return response.json();
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};