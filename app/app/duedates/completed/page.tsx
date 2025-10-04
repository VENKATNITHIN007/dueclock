"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useFetchDueDates } from "@/hooks/due/useFetchDueDates"
import { useDeleteDueDate } from "@/hooks/due/useDeleteDueDate"
import { toast } from "sonner"
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


const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

type Period = "all" | "month"

export default function CompletedPage() {
  const [period, setPeriod] = useState<Period>("all")
  const { data: grouped, isLoading, isError} = useFetchDueDates({
    status: "completed",
    period: period === "all" ? undefined : "month",
  })

  const deleteMutation = useDeleteDueDate()


  function formatFriendly(dateStr?: string) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  if (isLoading) return <p className="p-4">Loading...</p>
  if (isError) return <p className="p-4 text-red-600">Failed to load completed due dates</p>;
  if (!grouped || grouped.length === 0) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Completed</h1>
          <div className="flex items-center gap-2">
            <Button variant={period === "all" ? "default" : "outline"} onClick={() => setPeriod("all")}>All</Button>
            <Button variant={period === "month" ? "default" : "outline"} onClick={() => setPeriod("month")}>This Month</Button>
          </div>
        </div>
        <p>No completed due dates</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Header + toolbar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Completed</h1>
        <div className="flex items-center gap-2">
          <Button variant={period === "all" ? "default" : "outline"} onClick={() => setPeriod("all")}>All</Button>
          <Button variant={period === "month" ? "default" : "outline"} onClick={() => setPeriod("month")}>This Month</Button>
        </div>
      </div>

      {grouped?.map((group: any) => (
        <section key={`${group.year}-${String(group.month).padStart(2, "0")}`} className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {MONTH_NAMES[group.month - 1]} {group.year}
          </h2>

          {/* Mobile */}
          <div className="grid gap-4 md:hidden">
            {group.dues.map((d: any) => (
              <Card key={d._id} className="rounded-2xl shadow-md">
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold text-lg">{d.title}</p>
                  <p className="text-sm text-gray-600">Client: {d.clientName ?? "—"}</p>
                  <p className="text-sm text-gray-600">Date: {formatFriendly(d.date)}</p>

                  <div className="flex flex-row flex-wrap items-center gap-2 pt-2">
                      <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete {d.title} ?
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      deleteMutation.mutate(d._id, {
                        onSuccess: () => {
                          toast("due deleted ✅");
                        },
                      })
                    }
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

                    
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop */}
          <div className="hidden md:block">
            <div className="overflow-x-auto rounded-2xl shadow-md">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Client</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.dues.map((d: any) => (
                    <tr key={d._id} className="border-b">
                      <td className="p-3">{d.title}</td>
                      <td className="p-3">{d.clientName ?? "—"}</td>
                      <td className="p-3">{formatFriendly(d.date)}</td>
                      <td className="p-3 space-x-2">
                       <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete {d.title} ? 
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      deleteMutation.mutate(d._id, {
                        onSuccess: () => {
                          toast("due deleted ✅");
                        },
                      })
                    }
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}