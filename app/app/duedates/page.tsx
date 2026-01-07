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
    <div className="p-6 space-y-6">
      <Skeleton className="h-16 w-full rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
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
    const total = d.totalClients;
    const pending = d.pendingCount;
    const done = total - pending;
    const progress = total ? Math.round((done / total) * 100) : 0;

    return (
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:scale-105">
        <CardContent className="p-6 space-y-6">
          {/* header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{d.title}</h3>
              <p className="text-sm text-slate-500 flex items-center gap-2">
                <Calendar size={14} />
                {formatDate(d.date)} • {relative(d.date)}
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" aria-label="Due date actions">
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
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-lg p-4 text-center">
              <p className="text-xs font-medium text-slate-600 flex items-center justify-center gap-1 mb-2">
                <Users size={14} className="text-slate-500" /> Total Clients
              </p>
              <p className="font-bold text-xl text-slate-800">{total}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-4 text-center">
              <p className="text-xs font-medium text-amber-700 flex items-center justify-center gap-1 mb-2">
                <Clock size={14} className="text-amber-600" /> Pending
              </p>
              <p className="font-bold text-xl text-amber-800">{pending}</p>
            </div>
          </div>

          {/* progress */}
          {total > 0 && (
            <Progress value={progress} className="h-2" />
          )}

          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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
    <div className="p-6 space-y-6">
      {/* top summary (mobile safe) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg px-6 py-4">
        <div className="flex flex-wrap gap-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold px-3 py-1">
            Total Clients: <strong className="ml-1">{stats.totalClients}</strong>
          </Badge>
          <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 font-semibold px-3 py-1">
            Pending Dues: <strong className="ml-1">{stats.pendingDues}</strong>
          </Badge>
        </div>

        {canAdd && <DueDateFormDialog />}
      </div>

      {/* active dues */}
      {sortedActive.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white/60 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
          <Calendar size={64} className="text-slate-400 mb-6" />
          <h3 className="text-xl font-bold text-slate-800 mb-3">
            No Active Due Dates
          </h3>
          <p className="text-slate-600 text-lg mb-6 max-w-md leading-relaxed">
            {canAdd
              ? "Get started by creating your first due date to track compliance deadlines."
              : "All due dates have been completed or no access to create new ones."}
          </p>
          {canAdd && <DueDateFormDialog />}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedActive.map((d) => (
            <DueCard key={d._id} d={d} />
          ))}
        </div>
      )}

      {/* completed toggle */}
      {completedDues.length > 0 && (
        <div className="pt-4">
          <Button
            variant="outline"
            className="gap-2 bg-white/80 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            <Archive size={16} />
            {showCompleted
              ? "Hide Completed"
              : `Show Completed (${completedDues.length})`}
          </Button>
        </div>
      )}

      {/* completed dues */}
      {showCompleted && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {completedDues.map((d) => (
            <DueCard key={d._id} d={d} />
          ))}
        </div>
      )}
    </div>
  );
}
