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
import { CheckCircle, XCircle, CreditCard, Users, Calendar, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="container mx-auto p-6 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">Subscription Management</h1>
          <p className="text-slate-600 text-lg leading-relaxed">Manage your DueClock subscription and track usage limits</p>
        </div>

        {/* Current Plan */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-slate-800">Current Plan</CardTitle>
                <Badge 
                  variant={isPremium ? "default" : "secondary"} 
                  className={`text-sm font-semibold ${
                    isPremium 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {planName}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Price</span>
                  <span className="font-bold text-xl text-slate-800">{planPrice}</span>
                </div>
              
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Status</span>
                  <div className="flex items-center gap-2">
                    {isActive ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <span className="text-emerald-600 font-semibold">Active</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-600 font-semibold">Inactive</span>
                      </>
                    )}
                  </div>
                </div>

              {subscription?.renewsAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Renews</span>
                  <span className="font-medium">
                    {new Date(subscription.renewsAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-slate-800">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!isPremium && (
                  <PaymentDialog>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Upgrade to Premium
                    </Button>
                  </PaymentDialog>
                )}
                
                {isPremium && (
                  <div className="text-center py-6 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200">
                    <CheckCircle className="mx-auto h-10 w-10 text-emerald-500 mb-3" />
                    <p className="text-emerald-700 font-semibold text-lg">You&apos;re on Premium!</p>
                    <p className="text-emerald-600 text-sm mt-1">Enjoy unlimited features</p>
                  </div>
                )}
              </div>
          </CardContent>
        </Card>
      </div>

        {/* Usage Stats */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-800">
              <Users className="h-6 w-6 text-blue-600" />
              Usage Statistics
            </CardTitle>
            <CardDescription className="text-slate-600">
              Track your usage against plan limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Clients Usage */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-slate-800">Clients</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    {clientStatus?.current || 0} / {clientStatus?.limit === -1 ? '∞' : (clientStatus?.limit || 0)}
                  </span>
                </div>
                <Progress 
                  value={clientStatus?.limit === -1 ? 0 : clientProgress} 
                  className="h-3 bg-slate-200" 
                />
                {clientStatus?.limit === -1 && (
                  <p className="text-sm text-blue-600 mt-2 font-medium">
                    ✨ Unlimited clients available
                  </p>
                )}
                {clientStatus && !clientStatus.allowed && clientStatus.limit !== -1 && (
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    ⚠️ You&apos;ve reached your client limit. Upgrade to add more clients.
                  </p>
                )}
              </div>

              <Separator className="bg-slate-200" />

              {/* Due Dates Usage */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    <span className="font-semibold text-slate-800">Due Dates (This Month)</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                    {dueDateStatus?.current || 0} / {dueDateStatus?.limit === -1 ? '∞' : (dueDateStatus?.limit || 0)}
                  </span>
                </div>
                <Progress 
                  value={dueDateStatus?.limit === -1 ? 0 : dueDateProgress} 
                  className="h-3 bg-slate-200" 
                />
                {dueDateStatus?.limit === -1 && (
                  <p className="text-sm text-amber-600 mt-2 font-medium">
                    ✨ Unlimited due dates available
                  </p>
                )}
                {dueDateStatus && !dueDateStatus.allowed && dueDateStatus.limit !== -1 && (
                  <p className="text-sm text-red-600 mt-2 font-medium">
                    ⚠️ You&apos;ve reached your due date limit for this month. Upgrade for unlimited access.
                  </p>
                )}
              </div>
            </div>
            </CardContent>
        </Card>

        {/* Plan Comparison */}
        <Card className="mt-8 bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Plan Comparison</CardTitle>
            <CardDescription className="text-slate-600">
              Compare features between Free and Premium plans
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Free Plan */}
              <div className="space-y-6 p-6 rounded-xl border border-slate-200 bg-slate-50">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-800 mb-1">Free Plan</h3>
                  <p className="text-3xl font-bold text-slate-900 mb-1">₹0</p>
                  <p className="text-sm text-slate-600 font-medium">Forever</p>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">Up to 10 clients</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">3 due dates per month</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">Basic compliance tracking</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">Email notifications</span>
                  </li>
                </ul>
              </div>

              {/* Premium Plan */}
              <div className="space-y-6 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1">
                    RECOMMENDED
                  </Badge>
                </div>
                <div className="text-center pt-2">
                  <h3 className="text-xl font-bold text-blue-900 mb-1">Premium Plan</h3>
                  <p className="text-3xl font-bold text-blue-600 mb-1">₹2,000</p>
                  <p className="text-sm text-slate-600 font-medium">Per year</p>
                </div>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">Up to 100 clients</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">Unlimited due dates</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">Advanced compliance features</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700">Priority support</span>
                  </li>
                </ul>
                {!isPremium && (
                  <PaymentDialog>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 font-semibold text-white py-3 rounded-lg transition-colors duration-200">
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