"use client";
import React, { useState, useMemo } from "react";
import { useFirmActivity } from "@/hooks/firm/useFecthFirmActivity";
import { useFetchClients } from "@/hooks/clients/useFetchClients";
import { useFetchDueDates } from "@/hooks/dues/useFetchDueDates";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { formatActivityDetails } from "@/lib/formatActivity";
import { Plus, Edit, Trash2, Download, Upload, Building2, Users, Calendar } from "lucide-react";
import { ActivityType, ActivityFilter } from "@/schemas/apiSchemas/activitySchema";
import { Activity } from "lucide-react";

export default function FirmActivityPage() {
  const router = useRouter();
  
  // Fetch clients and due dates for dropdowns
  const { data: clients } = useFetchClients();
  const { data: dueDates } = useFetchDueDates();

  // Simplified state - only period filter by default
  const [period, setPeriod] = useState<"day" | "week" | "month" | "">("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    actionType: "" as "created" | "edited" | "deleted" | "",
    dueDateId: "",
    clientId: "",
  });

  const [activeFilters, setActiveFilters] = useState<Partial<ActivityFilter>>({});
  const { data, isLoading, isError, refetch } = useFirmActivity({
    ...activeFilters,
    limit: 500,
  });

  const activities: ActivityType[] = data?.activities || [];

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, ActivityType[]> = {};
    
    activities.forEach((activity) => {
      const date = new Date(activity.createdAt);
      const dateKey = date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });
    
    // Sort groups by date (most recent first)
    const sortedGroups = Object.entries(groups).sort(([dateA], [dateB]) => {
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    
    // Sort activities within each group by time (most recent first)
    sortedGroups.forEach(([, activities]) => {
      activities.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });
    
    return sortedGroups;
  }, [activities]);

  const handleApplyFilters = () => {
    const newFilters: Partial<ActivityFilter> = {};
    if (period) newFilters.period = period;
    if (showAdvanced) {
      if (advancedFilters.actionType) newFilters.actionTypes = advancedFilters.actionType;
      if (advancedFilters.dueDateId) newFilters.dueDateId = advancedFilters.dueDateId;
      if (advancedFilters.clientId) newFilters.clientId = advancedFilters.clientId;
    }
    setActiveFilters(newFilters);
  };

  const handleClearFilters = () => {
    setPeriod("");
    setAdvancedFilters({
      actionType: "",
      dueDateId: "",
      clientId: "",
    });
    setActiveFilters({});
  };

  const getCategoryLabel = (activity: ActivityType): string => {
    const action = (activity.action || "").toLowerCase();
    if (action.includes("due date") || action.includes("attached client") || activity.dueDateId || activity.dueDateClientId) {
      return "Due Date";
    }
    if ((action.includes("client") || activity.clientId) && !activity.dueDateId) {
      return "Client";
    }
    if (action.includes("member") || action.includes("invite") || action.includes("firm") || action.includes("user")) {
      return "Firm";
    }
    return "Firm";
  };

  const getActionIcon = (activity: ActivityType) => {
    const action = (activity.action || "").toLowerCase();
    
    // Export/Import icons
    if (action.includes("exported")) {
      return <Download className="h-4 w-4 text-blue-600" />;
    }
    if (action.includes("imported")) {
      return <Upload className="h-4 w-4 text-green-600" />;
    }
    
    // Standard action icons
    switch (activity.actionType) {
      case "created":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "edited":
        return <Edit className="h-4 w-4 text-blue-600" />;
      case "deleted":
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getCategoryIcon = (activity: ActivityType) => {
    const category = getCategoryLabel(activity);
    switch (category) {
      case "Client":
        return <Users className="h-4 w-4 text-slate-600" />;
      case "Due Date":
        return <Calendar className="h-4 w-4 text-slate-600" />;
      case "Firm":
        return <Building2 className="h-4 w-4 text-slate-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Firm Activity</h1>
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
      </div>

      {/* Simplified Filters */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* Quick Period Filter - Always Visible */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Quick Filter</label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={period === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPeriod(period === "day" ? "" : "day");
                }}
                className="flex-1 sm:flex-none"
              >
                Today
              </Button>
              <Button
                type="button"
                variant={period === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPeriod(period === "week" ? "" : "week");
                }}
                className="flex-1 sm:flex-none"
              >
                This Week
              </Button>
              <Button
                type="button"
                variant={period === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPeriod(period === "month" ? "" : "month");
                }}
                className="flex-1 sm:flex-none"
              >
                This Month
              </Button>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showAdvanced ? "Hide" : "Show"} Advanced Filters
            </Button>
          </div>

          {/* Advanced Filters - Collapsible */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t">
              {/* Action Type Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Action Type</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={advancedFilters.actionType === "created" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAdvancedFilters({ ...advancedFilters, actionType: advancedFilters.actionType === "created" ? "" : "created" })}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Created
                  </Button>
                  <Button
                    type="button"
                    variant={advancedFilters.actionType === "edited" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAdvancedFilters({ ...advancedFilters, actionType: advancedFilters.actionType === "edited" ? "" : "edited" })}
                  >
                    <Edit className="h-3 w-3 mr-1" /> Edited
                  </Button>
                  <Button
                    type="button"
                    variant={advancedFilters.actionType === "deleted" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAdvancedFilters({ ...advancedFilters, actionType: advancedFilters.actionType === "deleted" ? "" : "deleted" })}
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Deleted
                  </Button>
                </div>
              </div>

              {/* Client and Due Date Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Client</label>
                  <select
                    value={advancedFilters.clientId}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, clientId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Clients</option>
                    {clients?.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Due Date</label>
                  <select
                    value={advancedFilters.dueDateId}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, dueDateId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Due Dates</option>
                    {dueDates?.map((due) => (
                      <option key={due._id} value={due._id}>
                        {due.title} ({new Date(due.date).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button onClick={handleApplyFilters} className="flex-1">Apply Filters</Button>
            <Button variant="outline" onClick={handleClearFilters} className="flex-1 sm:flex-none">Clear All</Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">Loading activities...</p>
        </div>
      )}
      {isError && (
        <div className="text-center py-12">
          <p className="text-sm text-red-600 mb-4">Failed to load activity</p>
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
        </div>
      )}

      {!isLoading && !isError && activities.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-base text-gray-500">No activity found for the selected filters.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && activities.length > 0 && (
        <div className="space-y-6">
          {groupedActivities.map(([dateKey, dateActivities]) => (
            <div key={dateKey} className="space-y-3">
              {/* Date Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b pb-2 z-10">
                <h2 className="text-sm font-semibold text-gray-700">{dateKey}</h2>
              </div>
              
              {/* Activities Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100">
                    {dateActivities.map((activity) => {
                      const { what, forWho, byWho } = formatActivityDetails(activity);
                      return (
                        <div key={activity._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                          {/* Icons */}
                          <div className="flex-shrink-0 flex items-center gap-1.5">
                            <div className="hidden sm:block">
                              {getCategoryIcon(activity)}
                            </div>
                            {getActionIcon(activity)}
                          </div>
                          
                          {/* Time */}
                          <div className="flex-shrink-0 w-12 text-xs text-gray-500">
                            {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          
                          {/* Activity Details */}
                          <div className="flex-1 min-w-0 text-sm">
                            <span className="font-medium text-gray-900">{byWho}</span>{" "}
                            <span className="text-gray-700">{what}</span>
                            {forWho && (
                              <span className="text-gray-600">
                                {" "}{forWho.includes(" in ") ? `for ${forWho}` : `for ${forWho}`}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && activities.length > 0 && (
        <div className="text-center text-sm text-gray-500 py-6 border-t">
          Showing {activities.length} {activities.length === 1 ? "activity" : "activities"}
        </div>
      )}
    </div>
  );
}
