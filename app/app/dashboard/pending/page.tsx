"use client";

import React, { useState } from "react";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DueType } from "@/schemas/apiSchemas/dueDateSchema";
import { useUpdateDueStatus } from "@/hooks/due/useUpdateDueStatus";
import { useFetchNotReady } from "@/hooks/dashboard/pending";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export default function NotReadyPage() 
{

  const {data, isLoading,isError}=useFetchNotReady();
  const updateStatus = useUpdateDueStatus();

  // which due's contact block is open (one at a time)
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleExpand = (id: string) => setExpandedId(prev => (prev === id ? null : id));

  const generateMessage = (d: DueType) => {
    const name = d.clientName ?? "Client";
    const title = d.title ?? "task";
    const dateStr = d.date ? new Date(d.date).toLocaleDateString() : "the due date";
    return `Hello ${name},\n\nThis is a reminder that the due date for "${title}" is on ${dateStr}. Please share the required details at the earliest so we can proceed.\n\nThank you.`;
  };

  if (isLoading) return <p className="p-4">Loading…</p>;
  if (isError) return <p className="p-4 text-red-500">Failed to load</p>;
  if (!data || data.length === 0) return <p className="p-4">No not ready due dates</p>;

  const onStatusChange = (dueId: string, status: string) => {
    updateStatus.mutate({ dueId, status })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Not Ready to File</h1>

      {data.map((group) => (
        <section key={`${group.year}-${group.month}`} className="mb-8">
          <h2 className="text-lg font-semibold mb-4">
            {MONTH_NAMES[group.month - 1]} {group.year}
          </h2>

          {/* Mobile: Cards */}
          <div className="grid gap-4 md:hidden">
            {group.dues.map((d) => (
              <Card
                key={d._id}
                className="rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-transform"
              >
                <CardContent className="p-4 space-y-3">
                  <div>
                    <div className="font-semibold text-lg">{d.title}</div>
                    <div className="text-sm text-gray-600">Client: {d.clientName ?? "—"}</div>
                    <div className="text-sm text-gray-600">Date: {d.date ? new Date(d.date).toLocaleDateString() : "—"}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/app/duedates/${d._id}`}>
                      <Button size="sm" variant="outline">View</Button>
                    </Link>

                   

                    <select
                      value={d.status ?? "pending"}
                      onChange={(e) => onStatusChange(d._id, e.target.value)}
                      className="rounded border px-2 py-1 text-sm"
                    >
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                    </select>

                    <Button size="sm" variant="secondary" onClick={() => toggleExpand(d._id)}>
                      Contact
                    </Button>
                  </div>

                  {expandedId === d._id && (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      <textarea
                        readOnly
                        rows={4}
                        className="w-full border rounded p-2 text-sm"
                        value={generateMessage(d)}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => navigator.clipboard.writeText(generateMessage(d))}>
                          Copy
                        </Button>
                        {d.email && (
                          <a
                            href={`mailto:${d.email}?subject=Required Details&body=${encodeURIComponent(generateMessage(d))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline">Email</Button>
                          </a>
                        )}
                        {d.phoneNumber && (
                          <a
                            href={`https://wa.me/${d.phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(generateMessage(d))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline">WhatsApp</Button>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop: Table */}
          <div className="hidden md:block">
            <div className="overflow-x-auto rounded-2xl shadow-sm border">
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
                  {group.dues.map((d) => (
                    <tr key={d._id} className="border-b">
                      <td className="p-3 align-top">{d.title}</td>
                      <td className="p-3 align-top">{d.clientName ?? "—"}</td>
                      <td className="p-3 align-top">{d.date ? new Date(d.date).toLocaleDateString() : "—"}</td>
                      <td className="p-3 align-top">
                        <select
                          value={d.status ?? "pending"}
                          onChange={(e) => updateStatus.mutate({ dueId: d._id, status: e.target.value })}
                          className="rounded border px-2 py-1 text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="p-3 align-top">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <Link href={`/app/duedates/${d._id}`}>
                            <Button size="sm" variant="outline">View</Button>
                          </Link>

                          

                          <Button size="sm" variant="secondary" onClick={() => toggleExpand(d._id)}>
                            Contact
                          </Button>
                        </div>

                        {expandedId === d._id && (
                          <div className="mt-3 space-y-2">
                            <textarea
                              readOnly
                              rows={4}
                              className="w-full border rounded p-2 text-sm"
                              value={generateMessage(d)}
                            />
                            <div className="flex flex-wrap gap-2">
                              <Button size="sm" onClick={() => navigator.clipboard.writeText(generateMessage(d))}>
                                Copy
                              </Button>
                              {d.email && (
                                <a
                                  href={`mailto:${d.email}?subject=Required Details&body=${encodeURIComponent(generateMessage(d))}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button size="sm" variant="outline">Email</Button>
                                </a>
                              )}
                              {d.phoneNumber && (
                                <a
                                  href={`https://wa.me/${d.phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(generateMessage(d))}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button size="sm" variant="outline">WhatsApp</Button>
                                </a>
                              )}
                            </div>
                          </div>
                        )}
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
  );
}