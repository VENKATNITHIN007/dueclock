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

export default function FirmActivityPage() {
  const router = useRouter();
  
  // Fetch clients and due dates for dropdowns
  const { data: clients } = useFetchClients();
  const { data: dueDates } = useFetchDueDates();

  const [filters, setFilters] = useState({
    actionType: "" as "created" | "edited" | "deleted" | "",
    period: "" as "day" | "week" | "month" | "",
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
    if (filters.actionType) newFilters.actionTypes = filters.actionType;
    if (filters.period) newFilters.period = filters.period;
    if (filters.dueDateId) newFilters.dueDateId = filters.dueDateId;
    if (filters.clientId) newFilters.clientId = filters.clientId;
    setActiveFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      actionType: "",
      period: "",
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
    <div className="p-4 max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Firm Activity</h1>
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Action Type Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Action Type</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={filters.actionType === "created" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, actionType: filters.actionType === "created" ? "" : "created" })}
              >
                <Plus className="h-3 w-3 mr-1" /> Created
              </Button>
              <Button
                type="button"
                variant={filters.actionType === "edited" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, actionType: filters.actionType === "edited" ? "" : "edited" })}
              >
                <Edit className="h-3 w-3 mr-1" /> Edited
              </Button>
              <Button
                type="button"
                variant={filters.actionType === "deleted" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, actionType: filters.actionType === "deleted" ? "" : "deleted" })}
              >
                <Trash2 className="h-3 w-3 mr-1" /> Deleted
              </Button>
            </div>
          </div>

          {/* Period Filter */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Period</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={filters.period === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, period: filters.period === "day" ? "" : "day" })}
              >
                Today
              </Button>
              <Button
                type="button"
                variant={filters.period === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, period: filters.period === "week" ? "" : "week" })}
              >
                This Week
              </Button>
              <Button
                type="button"
                variant={filters.period === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, period: filters.period === "month" ? "" : "month" })}
              >
                This Month
              </Button>
            </div>
          </div>

          {/* Client and Due Date Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Client</label>
              <select
                value={filters.clientId}
                onChange={(e) => setFilters({ ...filters, clientId: e.target.value })}
                className="w-full rounded border px-3 py-1.5 text-sm"
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
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Due Date</label>
              <select
                value={filters.dueDateId}
                onChange={(e) => setFilters({ ...filters, dueDateId: e.target.value })}
                className="w-full rounded border px-3 py-1.5 text-sm"
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} className="flex-1">Apply Filters</Button>
            <Button variant="outline" onClick={handleClearFilters}>Clear All</Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      {isLoading && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Loading activities...</p>
        </div>
      )}
      {isError && (
        <div className="text-center py-8">
          <p className="text-sm text-red-600">Failed to load activity</p>
          <Button variant="outline" onClick={() => refetch()} className="mt-2">Retry</Button>
        </div>
      )}

      {!isLoading && !isError && activities.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No activity found.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && activities.length > 0 && (
        <div className="space-y-6">
          {groupedActivities.map(([dateKey, dateActivities]) => (
            <div key={dateKey} className="space-y-3">
              {/* Date Header */}
              <div className="border-b pb-2">
                <h2 className="text-sm font-semibold">{dateKey}</h2>
              </div>
              
              {/* Activities */}
              <div className="space-y-2">
                {dateActivities.map((activity) => {
                  const { what, forWho, byWho } = formatActivityDetails(activity);
                  return (
                    <Card key={activity._id} className="border-l-2 border-l-muted">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex-shrink-0 flex items-center gap-2">
                            {getCategoryIcon(activity)}
                            {getActionIcon(activity)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm">
                              <span className="font-medium">{byWho}</span>{" "}
                              <span>{what}</span>
                              {forWho && (
                                <span className="text-muted-foreground">{forWho.includes(" in ") ? ` for ${forWho}` : ` for ${forWho}`}</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && activities.length > 0 && (
        <div className="text-center text-xs text-muted-foreground py-4">
          Showing {activities.length} {activities.length === 1 ? "activity" : "activities"}
        </div>
      )}
    </div>
  );
}
