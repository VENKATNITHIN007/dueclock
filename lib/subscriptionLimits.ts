import { connectionToDatabase } from "./db";
import Subscription from "@/models/Subscription";
import Client from "@/models/Client";
import DueDate from "@/models/DueDate";

export interface SubscriptionLimits {
  maxClients: number;
  maxDuesPerMonth: number;
  canUseTeamFeatures: boolean;
  canUseBulkCommunication: boolean;
  canUseAdvancedReporting: boolean;
}

export const PLAN_LIMITS: Record<"free" | "premium", SubscriptionLimits> = {
  free: {
    maxClients: 10,
    maxDuesPerMonth: 3,
    canUseTeamFeatures: false,
    canUseBulkCommunication: true,
    canUseAdvancedReporting: false,
  },
  premium: {
    maxClients: 100,
    maxDuesPerMonth: -1, // unlimited
    canUseTeamFeatures: true,
    canUseBulkCommunication: true,
    canUseAdvancedReporting: true,
  },
};

export async function getCurrentSubscription(firmId: string) {
  await connectionToDatabase();
  
  const subscription = await Subscription.findOne({
    firmId,
    status: "active",
    $or: [
      { expiryDate: { $gte: new Date() } },
      { plan: "free" }
    ]
  }).lean();

  console.log("getCurrentSubscription - found subscription:", subscription ? {
    plan: (subscription as any)?.plan,
    status: (subscription as any)?.status,
    expiryDate: (subscription as any)?.expiryDate,
    firmId: (subscription as any)?.firmId
  } : null);

  if (!subscription) {
    console.log("getCurrentSubscription - creating default free subscription for firmId:", firmId);
    // Create default free subscription
    const newSub = await Subscription.create({
      firmId,
      plan: "free",
      status: "active"
    });
    console.log("getCurrentSubscription - created new subscription:", {
      plan: newSub.plan,
      status: newSub.status,
      firmId: newSub.firmId
    });
    return newSub;
  }

  return subscription;
}

export async function checkClientLimit(firmId: string): Promise<{ allowed: boolean; current: number; limit: number; plan: string }> {
  await connectionToDatabase();
  
  const subscription = await getCurrentSubscription(firmId);
  console.log("Client limit check - subscription:", { plan: subscription.plan, status: subscription.status });
  
  const limits = PLAN_LIMITS[subscription.plan as keyof typeof PLAN_LIMITS];
  console.log("Client limit check - limits:", limits);
  
  const clientCount = await Client.countDocuments({ firmId });
  console.log("Client limit check - current count:", clientCount, "vs limit:", limits.maxClients);
  
  const result = {
    allowed: clientCount < limits.maxClients,
    current: clientCount,
    limit: limits.maxClients,
    plan: subscription.plan
  };
  
  console.log("Client limit check result:", result);
  return result;
}

export async function checkDueDateLimit(firmId: string): Promise<{ allowed: boolean; current: number; limit: number; plan: string }> {
  await connectionToDatabase();
  
  const subscription = await getCurrentSubscription(firmId);
  console.log("DueDate limit check - subscription:", { plan: subscription.plan, status: subscription.status });
  
  const limits = PLAN_LIMITS[subscription.plan as keyof typeof PLAN_LIMITS];
  console.log("DueDate limit check - limits:", limits);
  
  // For unlimited, always allow
  if (limits.maxDuesPerMonth === -1) {
    console.log("DueDate limit check - unlimited plan");
    return {
      allowed: true,
      current: 0,
      limit: -1,
      plan: subscription.plan
    };
  }
  
  // Count dues created this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const dueDateCount = await DueDate.countDocuments({
    firmId,
    createdAt: { $gte: startOfMonth }
  });
  
  console.log("DueDate limit check - current count this month:", dueDateCount, "vs limit:", limits.maxDuesPerMonth);
  
  const result = {
    allowed: dueDateCount < limits.maxDuesPerMonth,
    current: dueDateCount,
    limit: limits.maxDuesPerMonth,
    plan: subscription.plan
  };
  
  console.log("DueDate limit check result:", result);
  return result;
}

export async function getSubscriptionFeatures(firmId: string): Promise<SubscriptionLimits & { plan: string }> {
  const subscription = await getCurrentSubscription(firmId);
  const limits = PLAN_LIMITS[subscription.plan as keyof typeof PLAN_LIMITS];
  
  return {
    ...limits,
    plan: subscription.plan
  };
}