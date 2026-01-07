"use client";

import { useSubscription } from "@/hooks/subscription/useSubscription";
import { useSubscriptionLimits } from "@/hooks/subscription/useSubscriptionLimits";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Crown, Users, AlertTriangle, CheckCircle2 } from "lucide-react";

export function SubscriptionStatus() {
  const { data: subscription, isLoading: subLoading } = useSubscription();
  const { data: limits, isLoading: limitsLoading } = useSubscriptionLimits();

  if (subLoading || limitsLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            <div className="h-2 bg-slate-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription || !limits) return null;

  const isPremium = subscription.subscription.plan === "premium";
  const clientUsage = (limits.clients.current / limits.clients.limit) * 100;
  const dueDateUsage = limits.dueDates.limit === -1 ? 0 : (limits.dueDates.current / limits.dueDates.limit) * 100;

  return (
    <Card className={`${isPremium ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50' : ''}`}>
      <CardContent className="p-4 space-y-4">
        {/* Plan Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isPremium ? (
              <>
                <Crown className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-slate-900">Premium Plan</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Active</Badge>
              </>
            ) : (
              <>
                <Users className="h-5 w-5 text-slate-600" />
                <span className="font-semibold text-slate-900">Free Plan</span>
                <Badge variant="outline">Active</Badge>
              </>
            )}
          </div>
          
          {!isPremium && (
            <PaymentDialog>
              <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                <Crown className="h-4 w-4 mr-1" />
                Upgrade
              </Button>
            </PaymentDialog>
          )}
        </div>

        {/* Usage Stats */}
        <div className="space-y-3">
          {/* Client Usage */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-slate-700">Clients</span>
              <span className="text-sm text-slate-500">
                {limits.clients.current}/{limits.clients.limit === -1 ? "∞" : limits.clients.limit}
              </span>
            </div>
            <Progress value={clientUsage} className="h-2" />
            {clientUsage > 80 && !isPremium && (
              <div className="flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3 text-orange-500" />
                <span className="text-xs text-orange-600">Approaching limit</span>
              </div>
            )}
          </div>

          {/* Due Date Usage */}
          {limits.dueDates.limit !== -1 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">Due Dates (This Month)</span>
                <span className="text-sm text-slate-500">
                  {limits.dueDates.current}/{limits.dueDates.limit}
                </span>
              </div>
              <Progress value={dueDateUsage} className="h-2" />
              {dueDateUsage > 80 && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3 text-orange-500" />
                  <span className="text-xs text-orange-600">Approaching monthly limit</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Premium Features Status */}
        {isPremium && subscription.subscription.expiryDate && (
          <div className="pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Expires</span>
              <span className="text-sm font-medium text-slate-900">
                {new Date(subscription.subscription.expiryDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        {/* Free Plan CTA */}
        {!isPremium && (
          <div className="pt-2 border-t border-slate-200">
            <div className="text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-blue-600" />
                <span>Unlimited clients with Premium</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-blue-600" />
                <span>Team collaboration</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}