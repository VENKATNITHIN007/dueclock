"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useFetchDueDates } from "@/hooks/due/useFetchDueDates"
import { useUpdateDueStatus } from "@/hooks/due/useUpdateDueStatus"
import { DueDateFormDialog } from "@/components/dialogs/DueDateFormDialog"


const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

export default function DueDatesPage() {
  // note: useFetchDueDates is expected to return GroupedDue[] (grouped by server)
  const { data: grouped, isLoading,isError } = useFetchDueDates()

  const updateStatus = useUpdateDueStatus()


  if (isLoading) return <p className="p-4">Loading...</p>
  if (isError) return <p className="p-4 text-red-600">Failed to load due dates</p>;
  if (!grouped || grouped.length === 0) {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Duedates</h1>
        <DueDateFormDialog />
      </div>
      <p>No due dates</p>
    </div>
  );
}
  
  const onStatusChange = (dueId: string, status: string) => {
    updateStatus.mutate({ dueId, status })
  }

  const statusColorClass = (status?: string) =>
    status === "completed"
      ? "text-green-600"
      : status === "pending"
      ? "text-yellow-600"
      : "text-yellow-600"

  return (
   <div className="p-4">
         {/* Header */}
         <div className="flex justify-between items-center mb-6">
           <h1 className="text-xl font-bold">Duedates</h1>
           <DueDateFormDialog />
         </div>
    
      {grouped?.map((group) => (
        <section key={`${group.year}-${String(group.month).padStart(2, "0")}`} className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {MONTH_NAMES[group.month - 1]} {group.year}
          </h2>

          {/* Mobile: Cards */}
          <div className="grid gap-4 md:hidden">
            {group.dues.map((d) => (
              <Card key={d._id} className="rounded-2xl shadow-md">
                <CardContent className="p-4 space-y-2">
                  <p className="font-semibold text-lg">{d.title}</p>
                  <p className="text-sm text-gray-600">Client: {d.clientName ?? "—"}</p>
                  <p className="text-sm text-gray-600">Date: {new Date(d.date).toLocaleDateString()}</p>

                  {/* merged select = status */}
                  <select
                    value={d.status ?? "pending"}
                    onChange={(e) => onStatusChange(d._id, e.target.value)}
                    className={`rounded-md border px-2 py-1 text-sm font-medium ${statusColorClass(d.status)}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/app/duedates/${d._id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>

                    
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
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Client</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.dues.map((d) => (
                    <tr key={d._id} className="border-b">
                      <td className="p-3">{d.title}</td>
                      <td className="p-3">{d.clientName ?? "—"}</td>
                      <td className="p-3">{new Date(d.date).toLocaleDateString()}</td>
                      <td className="p-3">
                        <select
                          value={d.status ?? "pending"}
                          onChange={(e) => onStatusChange(d._id, e.target.value)}
                          className={`rounded-md border px-2 py-1 text-sm font-medium ${statusColorClass(d.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="p-3 space-x-2">
                        <Link href={`/app/duedates/${d._id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                     

                        
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