"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Mail, MessageCircle, Search, Users, FileText, CheckCircle, Clock, Download, Trash2 } from "lucide-react";

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
      <div className="p-4 space-y-6">
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
      <div className="p-4 space-y-6">
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
    <div className="min-h-screen bg-slate-50">
      {/* HEADER - Unified for all screen sizes */}
      <div className="bg-white border-b">
        <div className="p-4 space-y-4">
          {/* Title Row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-xl font-semibold text-slate-900">{header?.dueTitle ?? "Due Date"}</h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                  <Users size={14} />
                  {stats.total} Clients
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Due: {formatDate(header?.date) || "No date set"}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedClients.size > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBulkEmail}
                  className="gap-2"
                >
                  <Mail size={14} />
                  Email ({selectedClients.size})
                </Button>
              )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportToCSV}
              className="gap-2"
            >
              <Download size={14} />
                <span className="hidden sm:inline">Export CSV</span>
                <span className="sm:hidden">Export</span>
            </Button>
            <AttachClientsDialog dueDateId={dueDateId} attachedClientIds={attachedClientIds} />
        </div>
      </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 pt-3 border-t">
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-600">Docs Pending:</div>
              <div className="text-sm font-semibold text-slate-900">{stats.docsPending}</div>
          </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-slate-600">Work Pending:</div>
              <div className="text-sm font-semibold text-slate-900">{stats.workPending}</div>
          </div>
          </div>
          </div>
        </div>

      {/* FILTER BAR */}
      <div className="bg-white border-b">
        <div className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
            <Input
              placeholder="Search clients by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={docFilter ?? ""}
              onChange={(e) => setDocFilter(e.target.value || null)}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Documents</option>
              <option value="pending">Docs Pending</option>
              <option value="received">Docs Received</option>
            </select>
            <select
              value={contactFilter ?? ""}
              onChange={(e) => setContactFilter(e.target.value || null)}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <span>Show completed work</span>
          </label>
          <div className="text-sm text-slate-500 ml-auto">
              {filteredRows.length} of {rows.length} clients
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE LIST */}
      <div className="p-4 space-y-3 md:hidden">
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
          const getStatusColor = () => {
            if (c.workStatus === "completed") {
              return "bg-green-50 border-green-400";
            } else if (c.docStatus === "received") {
              return "bg-blue-50 border-blue-400";
            }
            return "bg-white border-slate-200";
          };

          return (
            <Card key={clientId} className={`border shadow-sm ${getStatusColor()}`}>
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleClientSelection(clientId)}
                    className="accent-slate-600 mt-1"
                  />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-slate-900 truncate">{c.client.name}</p>
                          <StatusBadge type="doc" value={c.docStatus} variant="icon" />
                          <StatusBadge type="work" value={c.workStatus} variant="icon" />
                      </div>
                      {c.client.email && (
                      <p className="text-sm text-slate-600 truncate">{c.client.email}</p>
                    )}
                    {c.client.phoneNumber && (
                      <p className="text-sm text-slate-600">{c.client.phoneNumber}</p>
                      )}
                  </div>
                </div>
                
                  {/* Status Controls */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1.5">Docs Status</label>
                      <StatusSelect
                        type="doc"
                        value={c.docStatus}
                        onChange={(v) =>
                          updateDueClient.mutate({
                            id: c._id,
                            data: { docStatus: v as "pending" | "received" },
                          })
                        }
                      />
                    </div>
                    <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1.5">Work Status</label>
                      <StatusSelect
                        type="work"
                        value={c.workStatus}
                        onChange={(v) =>
                          updateDueClient.mutate({
                            id: c._id,
                            data: { workStatus: v as "pending" | "completed" },
                          })
                        }
                      />
                    </div>
                  </div>
                  
                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <div className="text-xs text-slate-500">
                    {c.lastContactedAt ? formatDateTime(c.lastContactedAt) : "Never contacted"}
                    </div>
                  <div className="flex gap-2">
                      {c.client.email && (
                        <Button
                          size="sm"
                        variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            markContacted(c._id);
                          window.location.href = `mailto:${c.client.email}?subject=${subject}&body=${body}`;
                          }}
                        >
                            <Mail size={16} />
                        </Button>
                      )}
                      {wa && (
                        <Button
                          size="sm"
                        variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            markContacted(c._id);
                          window.open(`https://wa.me/${wa}?text=${whatsappMessage}`, '_blank');
                          }}
                        >
                            <MessageCircle size={16} />
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove Client</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {c.client.name} from this due date? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
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
      <div className="hidden md:block p-4">
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left p-4 font-medium text-slate-700 w-12">
                    <input
                      type="checkbox"
                      checked={selectedClients.size === filteredRows.length && filteredRows.length > 0}
                      onChange={toggleSelectAll}
                      className="accent-slate-600"
                    />
                  </th>
                  <th className="text-left p-4 font-medium text-slate-700">Client</th>
                  <th className="text-left p-4 font-medium text-slate-700 w-32">Docs Status</th>
                  <th className="text-left p-4 font-medium text-slate-700 w-32">Work Status</th>
                  <th className="text-left p-4 font-medium text-slate-700 w-48">Last Contacted</th>
                  <th className="text-left p-4 font-medium text-slate-700 w-24">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
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
                      return "bg-green-200 hover:bg-green-300";
                    } else if (c.docStatus === "received") {
                      return "bg-yellow-100  hover:bg-yellow-200";
                    }
                    return "bg-white hover:bg-slate-200";
                  };

                  return (
                    <tr 
                      key={clientId} 
                      className={`transition-colors ${getRowColor()}`}
                    >
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleClientSelection(clientId)}
                          className="accent-slate-600"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-slate-900">{c.client.name}</span>
                              <StatusBadge type="doc" value={c.docStatus} variant="icon" />
                              <StatusBadge type="work" value={c.workStatus} variant="icon" />
                            </div>
                            {c.client.email && (
                              <p className="text-sm text-slate-600 truncate">{c.client.email}</p>
                            )}
                            {c.client.phoneNumber && (
                              <p className="text-sm text-slate-600">{c.client.phoneNumber}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <StatusSelect
                          type="doc"
                          value={c.docStatus}
                          onChange={(v) =>
                            updateDueClient.mutate({
                              id: c._id,
                              data: { docStatus: v as "pending" | "received" },
                            })
                          }
                        />
                      </td>

                      <td className="p-4">
                        <StatusSelect
                          type="work"
                          value={c.workStatus}
                          onChange={(v) =>
                            updateDueClient.mutate({
                              id: c._id,
                              data: { workStatus: v as "pending" | "completed" },
                            })
                          }
                        />
                      </td>

                      <td className="p-4 text-sm text-slate-600">
                        {c.lastContactedAt ? formatDateTime(c.lastContactedAt) : "Never"}
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          {c.client.email && (
                            <a 
                              href={`mailto:${c.client.email}?subject=${subject}&body=${body}`} 
                              onClick={() => markContacted(c._id)}
                            >
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                <Mail size={14} />
                              </Button>
                            </a>
                          )}
                          {wa && (
                            <a 
                              href={`https://wa.me/${wa}?text=${whatsappMessage}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              onClick={() => markContacted(c._id)}
                            >
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                <MessageCircle size={14} />
                              </Button>
                            </a>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Client</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {c.client.name} from this due date? 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
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
