"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
 // adjust if necessary
import { useDeleteDueDate } from "@/hooks/due/useDeleteDueDate"; // adjust if necessary
import { useUpdateDueStatus } from "@/hooks/due/useUpdateDueStatus"; 
import { useFetchOtherDueDates } from "@/hooks/dashboard/other";
import { toast } from "sonner";

// adjust if necessary

type FilterKey = "urgent" | "passed" | "completed";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "urgent", label: "Urgent" },
  { key: "passed", label: "Passed" },
  { key: "completed", label: "Completed" },
];

export default function WorkPage() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // read only ?filter= (no tab)
  const urlFilter = (search?.get("filter") ?? undefined) as FilterKey | undefined;
  const initial = urlFilter ?? "urgent";
  const [filter, setFilter] = useState<FilterKey>(initial);

  // sync local state if URL changes (back/forward or external link)
  useEffect(() => {
    const q = (search?.get("filter") ?? undefined) as FilterKey | undefined;
    if ((q ?? "urgent") !== filter) {
      setFilter(q ?? "urgent");
    }

  }, [search?.toString()]);

  // fetch flat data from server for the selected filter
  const { data, isLoading, isError, refetch } = useFetchOtherDueDates(filter);
  const items = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : data.data ?? [];
  }, [data]);

  // actions
  const deleteDue = useDeleteDueDate();
  const updateStatus = useUpdateDueStatus();

  const handleSetFilter = (next: FilterKey) => {
    setFilter(next);
    const url = `${pathname}?filter=${encodeURIComponent(next)}`;
    router.push(url);
  };

  

  const onStatusChange = (id: string, status: string) => {
    updateStatus.mutate(
      { dueId: id, status },
      {
        onSuccess: () => {
          refetch?.();
        },
      }
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Work Items</h1>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              onClick={() => handleSetFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p>Loading {filter} items…</p>
      ) : isError ? (
        <p className="text-red-500">Failed to load items</p>
      ) : items.length === 0 ? (
        <p>No {filter} due dates found.</p>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="grid gap-4 md:hidden">
            {items.map((d: any) => (
              <Card
                key={d._id}
                className="rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-transform cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{d.title}</p>
                      <p className="text-sm text-gray-600">Client: {d.clientName ?? "—"}</p>
                    </div>
                    <div className="text-sm text-gray-500">{d.date ? new Date(d.date).toLocaleDateString() : "—"}</div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                      {d.status ?? "pending"}
                    </span>

                    <Link href={`/app/duedates/${d._id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>

                   {d.status === "completed" && (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button size="sm" variant="destructive">Delete</Button>
    </AlertDialogTrigger>

    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete {d.title}?</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={() =>
            deleteDue.mutate(d._id, {
              onSuccess: () => refetch?.(),
              onError: (e: any) => {
             
                toast.error(e?.error ?? "Delete failed");
              },
            })
          }
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}

                    <select
                      value={d.status ?? "pending"}
                      onChange={(e) => onStatusChange(d._id, e.target.value)}
                      className="rounded border px-2 py-1 text-sm"
                    >
                      <option value="pending">pending</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block">
            <div className="overflow-x-auto rounded-2xl shadow-md border">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left text-sm text-gray-600">Title</th>
                    <th className="p-3 text-left text-sm text-gray-600">Client</th>
                    <th className="p-3 text-left text-sm text-gray-600">Date</th>
                    <th className="p-3 text-left text-sm text-gray-600">Status</th>
                    <th className="p-3 text-left text-sm text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((d: any) => (
                    <tr key={d._id} className="border-b hover:bg-gray-50">
                      <td className="p-3 align-top">{d.title}</td>
                      <td className="p-3 align-top">{d.clientName ?? "—"}</td>
                      <td className="p-3 align-top">{d.date ? new Date(d.date).toLocaleDateString() : "—"}</td>
                      <td className="p-3 align-top">
                        <select
                          value={d.status ?? "pending"}
                          onChange={(e) => onStatusChange(d._id, e.target.value)}
                          className="rounded border px-2 py-1 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="p-3 align-top">
                        <div className="flex items-center gap-2">
                          <Link href={`/app/duedates/${d._id}`}>
                            <Button size="sm" variant="outline">View</Button>
                          </Link>

                          {d.status === "completed" && (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button size="sm" variant="destructive">Delete</Button>
    </AlertDialogTrigger>

    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Delete {d.title}?</AlertDialogTitle>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={() =>
            deleteDue.mutate(d._id, {
              onSuccess: () => refetch?.(),
              onError: (e: any) => {
             
                toast.error(e?.error ?? "Delete failed");
              },
            })
          }
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}