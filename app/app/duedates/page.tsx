"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useFetchDueDates } from "@/hooks/dues/useFetchDueDates";
import { useDeleteDueDate } from "@/hooks/dues/useDeleteDueDate";
import { canAddOrDelete } from "@/lib/permissions";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { DueDateListItemType } from "@/schemas/apiSchemas/dueDateSchema";

import { DueDateFormDialog } from "@/components/dialogs/DueDateFormDialog";

import {
  Calendar,
  Users,
  Clock,
  MoreVertical,
  Trash2,
  Eye,
  Archive,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

/* ---------------- utils ---------------- */

function formatDate(date?: string) {
  if (!date) return "No date";
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function relative(date?: string) {
  if (!date) return "";
  const today = new Date().setHours(0, 0, 0, 0);
  const d = new Date(date).setHours(0, 0, 0, 0);
  const diff = Math.ceil((d - today) / 86400000);
  if (diff === 0) return "Today";
  if (diff < 0) return `${Math.abs(diff)} days overdue`;
  return `In ${diff} days`;
}

/* ---------------- skeleton ---------------- */

function PageSkeleton() {
  return (
    <div className="p-4 md:p-5 space-y-5">
      <Skeleton className="h-14 w-full rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-56 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/* ---------------- page ---------------- */

export default function DueDatesPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data, isLoading } = useFetchDueDates();
  const deleteMutation = useDeleteDueDate();
  
  const canAdd = canAddOrDelete(session?.user?.role);

  const [showCompleted, setShowCompleted] = useState(false);

  const dues: DueDateListItemType[] = data ?? [];

  /* ---------- split dues ---------- */
  const activeDues = dues.filter(
    (d) => d.pendingCount > 0 || d.totalClients === 0
  );
  const completedDues = dues.filter(
    (d) => d.pendingCount === 0 && d.totalClients > 0
  );

  /* ---------- stats ---------- */
  const stats = useMemo(() => {
    return {
      totalClients: dues.reduce(
        (sum, d) => sum + (d.totalClients ?? 0),
        0
      ),
      pendingDues: activeDues.length,
    };
  }, [dues, activeDues]);

  /* ---------- sort active by urgency ---------- */
  const sortedActive = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);

    return [...activeDues].sort((a, b) => {
      const aDate = a.date ? new Date(a.date).setHours(0, 0, 0, 0) : Infinity;
      const bDate = b.date ? new Date(b.date).setHours(0, 0, 0, 0) : Infinity;

      const aOver = aDate < today;
      const bOver = bDate < today;

      if (aOver !== bOver) return aOver ? -1 : 1;
      return aDate - bDate;
    });
  }, [activeDues]);

  if (isLoading) return <PageSkeleton />;

  /* ---------------- card ---------------- */

  function DueCard({ d }: { d: DueDateListItemType }) {
    const totalClients = d.totalClients ?? 0;
    const pending = d.pendingCount ?? 0;
    const done = totalClients - pending;
    const progress = totalClients ? Math.round((done / totalClients) * 100) : 0;

    return (
      <Card className="group hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white hover:border-blue-300">
        <CardContent className="p-5 space-y-4">
          {/* header */}
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base text-gray-900 mb-1.5 truncate group-hover:text-blue-600 transition-colors">{d.title}</h3>
              <p className="text-sm text-gray-600 flex items-center gap-1.5">
                <Calendar size={13} />
                <span className="truncate">{formatDate(d.date)} • {relative(d.date)}</span>
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" aria-label="Due date actions">
                  <MoreVertical size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => router.push(`/app/duedates/${d._id}`)}
                >
                  <Eye size={14} className="mr-2" />
                  View
                </DropdownMenuItem>

                {canAdd && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/app/duedates/${d._id}/edit`)}
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}

                {canAdd && (
                  <DropdownMenuItem
                    className="text-red-600"
                    onSelect={(e) => e.preventDefault()}
                  >
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <span className="flex items-center">
                        <Trash2 size={14} className="mr-2" />
                        Delete
                      </span>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Due</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600"
                          disabled={deleteMutation.isPending}
                          onClick={() =>
                            deleteMutation.mutate(d._id, {
                              onSuccess: () =>
                                toast.success("Due deleted"),
                              onError: () =>
                                toast.error("Failed to delete due"),
                            })
                          }
                        >
                          {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
              <p className="text-xs font-medium text-gray-600 flex items-center justify-center gap-1 mb-1.5">
                <Users size={13} className="text-gray-500" /> Total
              </p>
              <p className="font-bold text-lg text-gray-900">{totalClients}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-center">
              <p className="text-xs font-medium text-amber-700 flex items-center justify-center gap-1 mb-1.5">
                <Clock size={13} className="text-amber-600" /> Pending
              </p>
              <p className="font-bold text-lg text-amber-900">{pending}</p>
            </div>
          </div>

          {/* progress */}
          {totalClients > 0 && (
            <Progress value={progress} className="h-2" />
          )}

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md text-sm transition-colors"
            onClick={() => router.push(`/app/duedates/${d._id}`)}
          >
            Manage Clients
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* ---------------- render ---------------- */

  return (
    <div className="p-4 md:p-5 space-y-5">
      {/* top summary (mobile safe) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white border border-gray-200 rounded-lg shadow-sm px-4 py-3.5">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-2.5 py-0.5 text-sm">
            Total Clients: <strong className="ml-1">{stats.totalClients}</strong>
          </Badge>
          <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 font-medium px-2.5 py-0.5 text-sm">
            Pending Dues: <strong className="ml-1">{stats.pendingDues}</strong>
          </Badge>
        </div>

        {canAdd && <DueDateFormDialog />}
      </div>

      {/* active dues */}
      {sortedActive.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-lg border border-gray-200 shadow-sm">
          <Calendar size={48} className="text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Active Due Dates
          </h3>
          <p className="text-gray-600 text-sm mb-5 max-w-md leading-relaxed px-4">
            {canAdd
              ? "Get started by creating your first due date to track compliance deadlines."
              : "All due dates have been completed or no access to create new ones."}
          </p>
          {canAdd && <DueDateFormDialog />}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedActive.map((d) => (
            <DueCard key={d._id} d={d} />
          ))}
        </div>
      )}

      {/* completed toggle */}
      {completedDues.length > 0 && (
        <div className="pt-2">
          <Button
            variant="outline"
            className="gap-2 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 font-medium text-sm"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            <Archive size={15} />
            {showCompleted
              ? "Hide Completed"
              : `Show Completed (${completedDues.length})`}
          </Button>
        </div>
      )}

      {/* completed dues */}
      {showCompleted && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {completedDues.map((d) => (
            <DueCard key={d._id} d={d} />
          ))}
        </div>
      )}
    </div>
  );
}
