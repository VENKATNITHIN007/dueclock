import { useQuery } from "@tanstack/react-query";

interface Subscription {
  plan: "free" | "premium";
  status: "active" | "cancelled" | "paused" | "expired";
  expiryDate?: string;
  autorenew: boolean;
}

interface SubscriptionFeatures {
  maxClients: number;
  maxDuesPerMonth: number;
  canUseTeamFeatures: boolean;
  canUseBulkCommunication: boolean;
  canUseAdvancedReporting: boolean;
  plan: string;
}

interface SubscriptionData {
  subscription: Subscription;
  features: SubscriptionFeatures;
}

export const useSubscription = () => {
  return useQuery<SubscriptionData>({
    queryKey: ["subscription"],
    queryFn: async () => {
      const response = await fetch("/api/subscription");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }
      return response.json();
    },
  });
};