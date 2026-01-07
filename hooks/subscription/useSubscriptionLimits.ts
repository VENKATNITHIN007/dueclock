import { useQuery } from "@tanstack/react-query";

interface LimitCheck {
  allowed: boolean;
  current: number;
  limit: number;
  plan: string;
}

interface SubscriptionLimits {
  clients: LimitCheck;
  dueDates: LimitCheck;
}

export const useSubscriptionLimits = () => {
  return useQuery<SubscriptionLimits>({
    queryKey: ["subscription-limits"],
    queryFn: async () => {
      const response = await fetch("/api/subscription/limits");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription limits");
      }
      return response.json();
    },
  });
};