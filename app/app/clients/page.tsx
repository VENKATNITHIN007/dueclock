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
      {/* Mobile: Cards */}
      <div className="grid gap-4 md:hidden px-4 pb-28">
        {clients?.map((c) => (
          <Card key={c._id} className="w-full rounded-2xl shadow-md">
            <CardContent className="p-4 space-y-2">
              <p className="font-semibold text-lg">{c.name}</p>
              <p className="text-sm text-gray-600">
                {c.phoneNumber || "No phone"}
              </p>
              <p className="text-sm text-gray-600">{c.email || "No email"}</p>
              <p className="text-sm font-medium text-red-600">
                Pending Dues: {c.pendingDues}
              </p>

              <div className="flex gap-2 pt-2">
                <Link href={`/app/clients/${c._id}`}>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </Link>

                {canAdd && <ClientFormDialog client={c} />}
              </div>
            </CardContent>
          </Card>
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
