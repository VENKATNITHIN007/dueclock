"use client";
import { useFetchClients } from "@/hooks/clients/useFetchClients";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";
import ImportClientsDialog from "@/components/dialogs/ImportClientsDialog";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { canAddOrDelete } from "@/lib/permissions";
import { useQueryClient } from "@tanstack/react-query";

export default function ClientsPage() {
  const { data: session } = useSession();
  const { data: clients, isLoading, isError } = useFetchClients();
  const canAdd = canAddOrDelete(session?.user?.role);
  const queryClient = useQueryClient();

  const handleExportClients = async () => {
    try {
      const response = await fetch("/api/clients/export", {
        credentials: "include",
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `clients-${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        // Invalidate activity queries to show export in firm activity
        queryClient.invalidateQueries({ 
          predicate: (query) => query.queryKey[0] === "activity" 
        });
      }
    } catch (err) {
      console.error("Failed to export clients:", err);
    }
  };
  if (isLoading) return <p className="p-4">Loading...</p>;
  if (isError)
    return <p className="p-4 text-red-600">Failed to load clients</p>;
  if (!clients || clients.length === 0) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Clients</h1>
          {canAdd && <ClientFormDialog />}
        </div>
        <p>No clients yet</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 px-4">
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>

        {canAdd && (
          <div className="flex flex-wrap gap-3">
            <ClientFormDialog />
            <ImportClientsDialog />
            <Button onClick={handleExportClients}>
              Export to CSV
            </Button>
          </div>
        )}
      </div>

      {/* Mobile: Cards */}
      <div className="grid gap-3 md:hidden px-4 pb-28">
        {clients?.map((c) => (
          <Link key={c._id} href={`/app/clients/${c._id}`}>
            <Card className="w-full rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-white">
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base text-gray-900 truncate">{c.name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-700">
                      {c.pendingDues} {c.pendingDues === 1 ? 'due' : 'dues'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      {/* Desktop: Table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto rounded-2xl shadow-md">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Pending Dues</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients?.map((c) => (
                <tr key={c._id} className="border-b">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.phoneNumber || "no phone"}</td>
                  <td className="p-3">{c.email || "no email"}</td>
                  <td className="p-3 text-red-600 font-medium">
                    {c.pendingDues ?? 0}
                  </td>
                  <td className="p-3 space-x-2">
                    <Link href={`/app/clients/${c._id}`}>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </Link>

                    {canAdd && <ClientFormDialog client={c} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
