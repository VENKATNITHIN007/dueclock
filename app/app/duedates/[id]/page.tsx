"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, MessageCircle, Search, Users, FileText, CheckCircle, Clock, Download, Trash2, Filter } from "lucide-react";

import { useFetchDueClients } from "@/hooks/dueClients/useFetchDueClients";
import { useUpdateDueClient } from "@/hooks/dueClients/useUpdateDueClient";
import { useDeleteDueClient } from "@/hooks/dueClients/useDeleteDueClient";
import { AttachClientsDialog } from "@/components/dialogs/AttachClientsDialog";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import { StatusBadge } from "@/components/status/StatusBadge/page";
import { StatusSelect } from "@/components/status/StatusSelect/page";

function formatDate(date?: string) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date?: string) {
  if (!date) return "Never";
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHours < 24) {
    return "Today, " + past.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffHours < 48) {
    return "Yesterday, " + past.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return past.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ", " + past.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function sanitizePhone(raw?: string) {
  if (!raw) return null;
  const d = raw.replace(/\D/g, "");
  return d.length >= 7 ? d : null;
}

function getEmailTemplate(clientName: string, dueTitle: string, dueDate: string) {
  const subject = encodeURIComponent(`Reminder: ${dueTitle} - Due Date ${dueDate}`);
  const body = encodeURIComponent(
    `Dear ${clientName},\n\n` +
    `This is a reminder that "${dueTitle}" is due on ${dueDate}.\n\n` +
    `Kindly share the required documents and details at your earliest convenience to ensure timely compliance.\n\n` +
    `If you have already submitted the documents, please ignore this reminder.\n\n` +
    `Thank you for your cooperation.\n\n` +
    `Best regards`
  );
  return { subject, body };
}

function getWhatsAppTemplate(clientName: string, dueTitle: string, dueDate: string) {
  return encodeURIComponent(
    `Hello ${clientName},\n\n` +
    `Reminder: "${dueTitle}" is due on ${dueDate}.\n\n` +
    `Kindly share the required documents at your earliest convenience for timely compliance.\n\n` +
    `Thank you.`
  );
}

const EmptyState = ({ 
  title, 
  description, 
  icon: Icon = FileText,
  action
}: { 
  title: string; 
  description: string;
  icon?: React.ComponentType<{ size?: number }>;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="mb-4 text-slate-400">
      <Icon size={48} />
    </div>
    <h3 className="text-lg font-medium text-slate-700 mb-2">{title}</h3>
    <p className="text-sm text-slate-500 max-w-md mb-4">{description}</p>
    {action}
  </div>
);

function DueDetailSkeleton() {
  return (
    <div className="p-4 space-y-6 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div className="h-8 w-64 bg-slate-200 rounded"></div>
          <div className="h-4 w-48 bg-slate-200 rounded"></div>
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded"></div>
      </div>
      <div className="h-12 w-full bg-slate-200 rounded"></div>
      {[1, 2, 3].map(i => (
        <div key={i} className="h-20 w-full bg-slate-200 rounded-lg"></div>
      ))}
    </div>
  );
}

export default function DueDetailPage() {
  const { id } = useParams();
  const dueDateId = id as string;

  const { data, isLoading, isError } = useFetchDueClients(dueDateId);
  const updateDueClient = useUpdateDueClient(dueDateId);
  const deleteDueClient = useDeleteDueClient(dueDateId);
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [docFilter, setDocFilter] = useState<string | null>(null);
  const [showCompletedWork, setShowCompletedWork] = useState(false);
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set());
  const [contactFilter, setContactFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filteredRows = useMemo(() => {
    const rows = (data as any[]) ?? [];
    return rows.filter((r) => {
      if (search && !String(r.client?.name ?? "").toLowerCase().includes(search.toLowerCase()) &&
          !String(r.client?.email ?? "").toLowerCase().includes(search.toLowerCase())) {
        return false;
      }

      if (docFilter && r.docStatus !== docFilter) return false;

      if (!showCompletedWork && r.workStatus === "completed") return false;

      if (contactFilter === "not_contacted" && r.lastContactedAt) return false;
      if (contactFilter === "contacted" && !r.lastContactedAt) return false;

      return true;
    });
  }, [data, search, docFilter, showCompletedWork, contactFilter]);

  if (isLoading) return <DueDetailSkeleton />;
  
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load data"
        description="There was an error loading the due date information. Please try again."
        icon={FileText}
        action={
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        }
      />
    );
  }

  const rows = (data as any[]) ?? [];
  const header = rows[0] ?? {};
  const attachedClientIds = rows.map((r) => String(r.client._id));

  const stats = {
    total: rows.length,
    docsPending: rows.filter(r => r.docStatus === 'pending').length,
    workPending: rows.filter(r => r.workStatus === 'pending').length,
  };

  const markContacted = (id: string) => {
    updateDueClient.mutate({
      id,
      data: { lastContactedAt: new Date().toISOString() },
    });
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clientId)) {
        newSet.delete(clientId);
      } else {
        newSet.add(clientId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedClients.size === filteredRows.length) {
      setSelectedClients(new Set());
    } else {
      setSelectedClients(new Set(filteredRows.map(r => String(r._id))));
    }
  };

  const handleBulkEmail = () => {
    const selected = filteredRows.filter(r => selectedClients.has(String(r._id)));
    const clientsWithEmail = selected.filter(r => r.client?.email);
    
    if (clientsWithEmail.length === 0) {
      alert("No selected clients have email addresses.");
      return;
    }

    const emails = clientsWithEmail.map(r => r.client.email).join(',');
    const { subject, body } = getEmailTemplate(
      "All",
      header?.dueTitle ?? "Due Date",
      formatDate(header?.date) || "No date set"
    );
    
    clientsWithEmail.forEach(r => markContacted(r._id));
    window.location.href = `mailto:${emails}?subject=${subject}&body=${body}`;
  };

  const handleExportToCSV = async () => {
    const csvRows = [
      ['Due Date','Due title','Client Name', 'Email', 'Phone', 'Docs Status', 'Work Status', 'Last Contacted', ],
      ...filteredRows.map(r => [
        formatDate(header?.date),
        header?.dueTitle ?? "Due Date",
        r.client.name,
        r.client.email || '',
        r.client.phoneNumber || '',
        r.docStatus,
        r.workStatus,
        r.lastContactedAt ? new Date(r.lastContactedAt).toLocaleString() : 'Never',
      ])
    ];

    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `due-date-${header?.dueTitle || 'clients'}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // Log export to audit and refresh activity
    try {
      await fetch(`/api/duedates/${dueDateId}/export`, {
        method: "POST",
        credentials: "include",
      });
      // Invalidate activity queries to show export in firm activity
      queryClient.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "activity" 
      });
    } catch (err) {
      console.error("Failed to log export:", err);
      // Don't block the export if logging fails
    }
  };

  // Empty states
  if (rows.length === 0) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-semibold text-slate-900">{header?.dueTitle ?? "Due Date"}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                <Users size={12} />
                0 Clients
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Due: {formatDate(header?.date) || "No date set"}
            </p>
          </div>
            <AttachClientsDialog dueDateId={dueDateId} attachedClientIds={attachedClientIds} />
        </div>
        <EmptyState
          title="No clients attached"
          description="Add clients to this due date to start tracking their document and work progress."
          icon={Users}
          action={
            <AttachClientsDialog dueDateId={dueDateId} attachedClientIds={attachedClientIds}  />
          }
        />
      </div>
    );
  }

  if (filteredRows.length === 0) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-semibold text-slate-900">{header?.dueTitle ?? "Due Date"}</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                <Users size={12} />
                {stats.total} Clients
              </span>
            </div>
            <p className="text-sm text-slate-600">
              Due: {formatDate(header?.date) || "No date set"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportToCSV}
              className="gap-2"
            >
              <Download size={14} />
              Export
            </Button>
            <AttachClientsDialog dueDateId={dueDateId} attachedClientIds={attachedClientIds} />
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-3">
          <select
            value={docFilter ?? ""}
            onChange={(e) => setDocFilter(e.target.value || null)}
              className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="">All Documents</option>
              <option value="pending">Docs Pending</option>
              <option value="received">Docs Received</option>
            </select>
            <select
              value={contactFilter ?? ""}
              onChange={(e) => setContactFilter(e.target.value || null)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              <option value="">All Clients</option>
              <option value="not_contacted">Not Contacted</option>
              <option value="contacted">Contacted</option>
          </select>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompletedWork}
              onChange={(e) => setShowCompletedWork(e.target.checked)}
              className="accent-slate-600"
            />
              <span>Show completed</span>
          </label>
          </div>
        </div>

        <EmptyState
          title="No matching clients"
          description="No clients match your current filters. Try adjusting your search or filters."
          icon={Search}
          action={
            <Button variant="outline" onClick={() => {
              setSearch("");
              setDocFilter(null);
              setShowCompletedWork(false);
              setContactFilter(null);
            }}>
              Clear Filters
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="px-3 sm:px-5 py-3 sm:py-4 max-w-7xl mx-auto space-y-3">
          {/* Title Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">{header?.dueTitle ?? "Due Date"}</h1>
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex-shrink-0">
                  <Users size={12} />
                  {stats.total}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                Due: {formatDate(header?.date) || "No date set"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden h-8 w-8 p-0"
              >
                <Filter size={14} />
              </Button>
              {selectedClients.size > 0 && (
                <Button 
                  variant="default"
                  size="sm" 
                  onClick={handleBulkEmail}
                  className="gap-1 bg-blue-600 hover:bg-blue-700 text-xs h-8"
                >
                  <Mail size={12} className="sm:hidden" />
                  <span className="hidden sm:inline">Email ({selectedClients.size})</span>
                  <span className="sm:hidden">({selectedClients.size})</span>
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportToCSV}
                className="gap-1 text-xs h-8 px-2 sm:px-3"
              >
                <Download size={12} />
                <span className="hidden sm:inline">CSV</span>
              </Button>
              <AttachClientsDialog dueDateId={dueDateId} attachedClientIds={attachedClientIds} />
            </div>
          </div>

          {/* Mobile Due Date - Visible only on mobile */}
          <p className="text-xs text-gray-600 sm:hidden">
            Due: {formatDate(header?.date) || "No date set"}
          </p>

          {/* Stats Row - Hidden on mobile when filters are shown */}
          <div className={`flex items-center gap-3 sm:gap-4 pt-2 border-t text-xs ${showFilters ? 'hidden md:flex' : 'flex'}`}>
            <div className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-orange-600" />
              <span className="text-gray-600">Docs Pending:</span>
              <span className="font-bold text-gray-900">{stats.docsPending}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-gray-600">Work Pending:</span>
              <span className="font-bold text-gray-900">{stats.workPending}</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className={`bg-white border-b ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className="px-3 sm:px-5 py-3 max-w-7xl mx-auto space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <select
              value={docFilter ?? ""}
              onChange={(e) => setDocFilter(e.target.value || null)}
              className="border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="">All Documents</option>
              <option value="pending">📄 Docs Pending</option>
              <option value="received">✓ Docs Received</option>
            </select>
            <select
              value={contactFilter ?? ""}
              onChange={(e) => setContactFilter(e.target.value || null)}
              className="border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            >
              <option value="">All Clients</option>
              <option value="not_contacted">Not Contacted</option>
              <option value="contacted">Contacted</option>
            </select>
            <label className="flex items-center gap-1.5 text-xs text-gray-700 cursor-pointer px-2.5 py-1.5 bg-gray-50 rounded hover:bg-gray-100">
              <input
                type="checkbox"
                checked={showCompletedWork}
                onChange={(e) => setShowCompletedWork(e.target.checked)}
                className="accent-blue-600"
              />
              <span>Show completed</span>
            </label>
            <div className="text-xs text-gray-500 ml-auto font-medium">
              {filteredRows.length} of {rows.length}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE LIST */}
      <div className="px-3 py-4 space-y-3 md:hidden max-w-7xl mx-auto pb-24">
        {filteredRows.map((c) => {
          const wa = sanitizePhone(c.client.phoneNumber);
          const clientId = String(c._id);
          const isSelected = selectedClients.has(clientId);
          
          const { subject, body } = getEmailTemplate(
            c.client.name,
            header?.dueTitle ?? "Due Date",
            formatDate(header?.date) || "No date set"
          );
          const whatsappMessage = getWhatsAppTemplate(
            c.client.name,
            header?.dueTitle ?? "Due Date",
            formatDate(header?.date) || "No date set"
          );
          
          // Determine color based on status
          const getStatusColor = () => {
            if (c.workStatus === "completed") {
              return "bg-green-50 border-green-400";
            } else if (c.docStatus === "received") {
              return "bg-blue-50 border-blue-400";
            }
            return "bg-white border-gray-200";
          };

          return (
            <Card key={clientId} className={`border ${getStatusColor()} shadow-sm`}>
              <CardContent className="p-4">
                {/* Header with Checkbox */}
                <div className="flex items-start gap-2.5 mb-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleClientSelection(clientId)}
                    className="accent-blue-600 mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-gray-900 truncate">{c.client.name}</p>
                      <StatusBadge type="doc" value={c.docStatus} variant="icon" />
                      <StatusBadge type="work" value={c.workStatus} variant="icon" />
                    </div>
                  </div>
                </div>
                
                {/* Status Controls */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">Documents</label>
                    <StatusSelect
                      type="doc"
                      value={c.docStatus}
                      onChange={(v) =>
                        updateDueClient.mutate({
                          id: c._id,
                          data: { docStatus: v as "pending" | "received" },
                        })
                      }
                      className="text-xs h-8"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1.5">Work Status</label>
                    <StatusSelect
                      type="work"
                      value={c.workStatus}
                      onChange={(v) =>
                        updateDueClient.mutate({
                          id: c._id,
                          data: { workStatus: v as "pending" | "completed" },
                        })
                      }
                      className="text-xs h-8"
                    />
                  </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-600">
                    {c.lastContactedAt ? (
                      <span className="font-medium">✓ {formatDateTime(c.lastContactedAt)}</span>
                    ) : (
                      <span className="text-orange-600 font-medium">Not contacted</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {c.client.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 hover:bg-blue-50"
                        onClick={() => {
                          markContacted(c._id);
                          window.location.href = `mailto:${c.client.email}?subject=${subject}&body=${body}`;
                        }}
                      >
                        <Mail size={15} />
                      </Button>
                    )}
                    {wa && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 hover:bg-green-50"
                        onClick={() => {
                          markContacted(c._id);
                          window.open(`https://wa.me/${wa}?text=${whatsappMessage}`, '_blank');
                        }}
                      >
                        <MessageCircle size={15} />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:bg-red-50">
                          <Trash2 size={15} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="mx-4 max-w-[90vw] sm:max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-base">Remove Client</AlertDialogTitle>
                          <AlertDialogDescription className="text-sm">
                            Remove {c.client.name} from this due date?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-sm"
                            onClick={() => {
                              deleteDueClient.mutate(c._id, {
                                onSuccess: () => {
                                  toast.success("Client removed from due date");
                                },
                                onError: () => {
                                  toast.error("Failed to remove client");
                                },
                              });
                            }}
                          >
                            Remove
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block p-4 sm:p-5 max-w-7xl mx-auto pb-24">
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-2.5 text-xs font-semibold text-gray-700 w-10">
                    <input
                      type="checkbox"
                      checked={selectedClients.size === filteredRows.length && filteredRows.length > 0}
                      onChange={toggleSelectAll}
                      className="accent-blue-600"
                    />
                  </th>
                  <th className="text-left p-2.5 text-xs font-semibold text-gray-700">Client</th>
                  <th className="text-left p-2.5 text-xs font-semibold text-gray-700 w-32">Docs</th>
                  <th className="text-left p-2.5 text-xs font-semibold text-gray-700 w-32">Work</th>
                  <th className="text-left p-2.5 text-xs font-semibold text-gray-700 w-36">Last Contact</th>
                  <th className="text-left p-2.5 text-xs font-semibold text-gray-700 w-28">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRows.map((c) => {
                  const wa = sanitizePhone(c.client.phoneNumber);
                  const clientId = String(c._id);
                  const isSelected = selectedClients.has(clientId);
                  
                  const { subject, body } = getEmailTemplate(
                    c.client.name,
                    header?.dueTitle ?? "Due Date",
                    formatDate(header?.date) || "No date set"
                  );
                  const whatsappMessage = getWhatsAppTemplate(
                    c.client.name,
                    header?.dueTitle ?? "Due Date",
                    formatDate(header?.date) || "No date set"
                  );
                  
                  // Determine color based on status (work completed takes priority)
                  const getRowColor = () => {
                    if (c.workStatus === "completed") {
                      return "bg-green-50 hover:bg-green-100";
                    } else if (c.docStatus === "received") {
                      return "bg-blue-50 hover:bg-blue-100";
                    }
                    return "bg-white hover:bg-gray-50";
                  };

                  return (
                    <tr 
                      key={clientId} 
                      className={`transition-colors ${getRowColor()}`}
                    >
                      <td className="p-2.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleClientSelection(clientId)}
                          className="accent-blue-600"
                        />
                      </td>
                      <td className="p-2.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-sm text-gray-900">{c.client.name}</span>
                          <StatusBadge type="doc" value={c.docStatus} variant="icon" />
                          <StatusBadge type="work" value={c.workStatus} variant="icon" />
                        </div>
                      </td>

                      <td className="p-2.5">
                        <StatusSelect
                          type="doc"
                          value={c.docStatus}
                          onChange={(v) =>
                            updateDueClient.mutate({
                              id: c._id,
                              data: { docStatus: v as "pending" | "received" },
                            })
                          }
                          className="text-xs h-7"
                        />
                      </td>

                      <td className="p-2.5">
                        <StatusSelect
                          type="work"
                          value={c.workStatus}
                          onChange={(v) =>
                            updateDueClient.mutate({
                              id: c._id,
                              data: { workStatus: v as "pending" | "completed" },
                            })
                          }
                          className="text-xs h-7"
                        />
                      </td>

                      <td className="p-2.5 text-xs text-gray-600">
                        {c.lastContactedAt ? (
                          <span className="font-medium">✓ {formatDateTime(c.lastContactedAt)}</span>
                        ) : (
                          <span className="text-orange-600">Not contacted</span>
                        )}
                      </td>

                      <td className="p-2.5">
                        <div className="flex gap-1.5">
                          {c.client.email && (
                            <a 
                              href={`mailto:${c.client.email}?subject=${subject}&body=${body}`} 
                              onClick={() => markContacted(c._id)}
                            >
                              <Button size="sm" variant="outline" className="h-7 w-7 p-0 hover:bg-blue-50">
                                <Mail size={14} />
                              </Button>
                            </a>
                          )}
                          {wa && (
                            <a
                              href={`https://wa.me/${wa}?text=${whatsappMessage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => markContacted(c._id)}
                            >
                              <Button size="sm" variant="outline" className="h-7 w-7 p-0 hover:bg-green-50">
                                <MessageCircle size={14} />
                              </Button>
                            </a>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50">
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-md">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-base">Remove Client</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm">
                                  Remove {c.client.name} from this due date?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700 text-sm"
                                  onClick={() => {
                                    deleteDueClient.mutate(c._id, {
                                      onSuccess: () => {
                                        toast.success("Client removed");
                                      },
                                      onError: () => {
                                        toast.error("Failed to remove");
                                      },
                                    });
                                  }}
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Empty states for specific filters */}
      {docFilter === "pending" && stats.docsPending === 0 && (
        <div className="p-4 md:p-6">
          <EmptyState
            title="No pending documents"
            description="All clients have submitted their required documents."
            icon={CheckCircle}
          />
        </div>
      )}
      
      {docFilter === "received" && (rows.filter(r => r.docStatus === "received").length === 0) && (
        <div className="p-4 md:p-6">
          <EmptyState
            title="No documents received yet"
            description="Clients haven't submitted their documents yet."
            icon={Clock}
          />
        </div>
      )}
    </div>
  );
}
