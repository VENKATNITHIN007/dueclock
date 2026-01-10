"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { PaymentDialog } from "@/components/dialogs/PaymentDialog";
import { useFetchSubscription } from "@/hooks/subscription/useFetchSubscription";
import { useFetchClientLimitStatus } from "@/hooks/subscription/useFetchClientLimitStatus";
import { useFetchDueDateLimitStatus } from "@/hooks/subscription/useFetchDueDateLimitStatus";
import { CheckCircle, XCircle, CreditCard, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";

export default function SubscriptionPage() {
  const { data: subscription, isLoading: subscriptionLoading, error: subscriptionError } = useFetchSubscription();
  const { data: clientStatus, isLoading: clientLoading } = useFetchClientLimitStatus();
  const { data: dueDateStatus, isLoading: dueDateLoading } = useFetchDueDateLimitStatus();

  if (subscriptionLoading || clientLoading || dueDateLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        
        <div className="mt-6">
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  if (subscriptionError) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Subscription</h2>
          <p className="text-gray-600">Unable to load subscription details. Please try again later.</p>
        </div>
      </div>
    );
  }

  const isActive = subscription?.status === 'active';
  const isPremium = subscription?.plan === 'premium';
  const planName = isPremium ? 'Premium Plan' : 'Free Plan';
  const planPrice = isPremium ? '₹2,000/year' : 'Free';

  const clientProgress = clientStatus ? 
    (clientStatus.limit > 0 ? (clientStatus.current / clientStatus.limit) * 100 : 0) : 0;
  const dueDateProgress = dueDateStatus ? 
    (dueDateStatus.limit > 0 ? (dueDateStatus.current / dueDateStatus.limit) * 100 : 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto p-4 sm:p-6 max-w-3xl">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Subscription & Billing</h1>
          <p className="text-sm text-gray-600">Manage your plan and track usage</p>
        </div>

        {/* Current Plan & Usage in Single Row */}
        <div className="grid md:grid-cols-2 gap-3 mb-3">
          {/* Current Plan */}
          <Card className={`border-2 ${isPremium ? 'border-blue-500 bg-blue-50/30' : 'border-gray-300 bg-white'}`}>
            <CardHeader className="pb-1.5 pt-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold">Current Plan</CardTitle>
                <Badge 
                  variant={isPremium ? "default" : "secondary"} 
                  className="text-xs font-semibold"
                >
                  {planName}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 pt-2 pb-3">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Price</span>
                <span className="font-semibold">{planPrice}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Status</span>
                <div className="flex items-center gap-1">
                  {isActive ? (
                    <>
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3.5 w-3.5 text-red-600" />
                      <span className="text-xs text-red-600 font-medium">Inactive</span>
                    </>
                  )}
                </div>
              </div>
              {subscription?.renewsAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Renews</span>
                  <span className="text-xs font-medium">
                    {new Date(subscription.renewsAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-2 border-gray-300 bg-white">
            <CardHeader className="pb-1.5 pt-3">
              <CardTitle className="text-sm font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 pb-3">
              {!isPremium ? (
                <div className="space-y-1.5">
                  <PaymentDialog>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg text-xs py-4">
                      <CreditCard className="mr-2 h-3.5 w-3.5" />
                      Upgrade to Premium
                    </Button>
                  </PaymentDialog>
                  <p className="text-xs text-center text-gray-500">Unlock unlimited features</p>
                </div>
              ) : (
                <div className="text-center py-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                  <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-1.5" />
                  <p className="text-green-700 font-bold text-sm">Premium Active</p>
                  <p className="text-green-600 text-xs mt-1">All features unlocked</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage Stats */}
        <Card className="border-2 border-gray-300 bg-white mb-3">
          <CardHeader className="pb-1.5 pt-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-blue-600" />
              Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-2 pb-3">
            {/* Clients */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-gray-700">Clients</span>
                <span className="text-xs font-medium text-gray-700">
                  {clientStatus?.current || 0} / {clientStatus?.limit === -1 ? '∞' : (clientStatus?.limit || 0)}
                </span>
              </div>
              <Progress 
                value={clientStatus?.limit === -1 ? 0 : clientProgress} 
                className="h-2" 
              />
              {clientStatus?.limit === -1 && (
                <p className="text-xs text-blue-600 mt-1">Unlimited</p>
              )}
              {clientStatus && !clientStatus.allowed && clientStatus.limit !== -1 && (
                <p className="text-xs text-red-600 mt-1">Limit reached. Upgrade required.</p>
              )}
            </div>

            <Separator />

            {/* Due Dates */}
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-gray-700">Due Dates (This Month)</span>
                <span className="text-xs font-medium text-gray-700">
                  {dueDateStatus?.current || 0} / {dueDateStatus?.limit === -1 ? '∞' : (dueDateStatus?.limit || 0)}
                </span>
              </div>
              <Progress 
                value={dueDateStatus?.limit === -1 ? 0 : dueDateProgress} 
                className="h-2" 
              />
              {dueDateStatus?.limit === -1 && (
                <p className="text-xs text-blue-600 mt-1">Unlimited</p>
              )}
              {dueDateStatus && !dueDateStatus.allowed && dueDateStatus.limit !== -1 && (
                <p className="text-xs text-red-600 mt-1">Monthly limit reached.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Plan Comparison */}
        <Card className="border-2 border-gray-300 bg-white">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="text-base font-bold">Plan Comparison</CardTitle>
            <CardDescription className="text-xs">Choose the right plan for your firm</CardDescription>
          </CardHeader>
          <CardContent className="pt-2 pb-3">
            <div className="grid md:grid-cols-2 gap-3">
              {/* Free */}
              <div className="p-4 rounded-lg border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-white hover:shadow-md transition-shadow">
                <h3 className="text-sm font-bold mb-0.5 text-gray-900">Free Plan</h3>
                <p className="text-2xl font-bold mb-0.5 text-gray-900">₹0</p>
                <p className="text-xs text-gray-500 mb-3">Perfect for small firms</p>
                <ul className="space-y-1.5 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Up to 10 clients</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>3 due dates per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span>Basic features</span>
                  </li>
                </ul>
              </div>

              {/* Premium */}
              <div className="p-4 rounded-lg border-2 border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100/50 relative hover:shadow-xl transition-shadow">
                <div className="absolute -top-2.5 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-2.5 py-0.5 shadow-md font-bold">⭐ RECOMMENDED</Badge>
                </div>
                <h3 className="text-sm font-bold mb-0.5 text-blue-900 pt-1.5">Premium Plan</h3>
                <p className="text-2xl font-bold mb-0.5 text-blue-700">₹2,000<span className="text-xs font-normal text-gray-700">/year</span></p>
                <p className="text-xs text-blue-600 mb-3 font-medium">Best value for growing firms</p>
                <ul className="space-y-1.5 text-xs mb-3">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    <span className="font-medium">Up to 100 clients</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    <span className="font-medium">Unlimited due dates</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    <span className="font-medium">All premium features</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    <span className="font-medium">Priority support</span>
                  </li>
                </ul>
                {!isPremium && (
                  <PaymentDialog>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-xs py-2 font-semibold shadow-md">
                      Upgrade Now
                    </Button>
                  </PaymentDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}