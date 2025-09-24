"use client";

import React from "react";
import Link from "next/link";
import { useFetchDashboard } from "@/hooks/dashboard/counts";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardCountsPage() {
  const { data: counts, isLoading, isError } = useFetchDashboard();

  const safeCount = (key: string) =>
    isLoading ? "…" : isError || !counts ? 0 : (counts as any)[key] ?? 0;

  const items = [
    {
      key: "urgent",
      label: "Urgent (3 days)",
      color: "bg-red-500",
      icon: AlertTriangle,
      value: safeCount("urgent"),
      link: "/app/dashboard/work?filter=urgent",
    },
    {
      key: "passed",
      label: "Overdue",
      color: "bg-red-600",
      icon: Clock,
      value: safeCount("passed"),
      link: "/app/dashboard/work?filter=passed",
    },
    {
      key: "pending",
      label: "Pending",
      color: "bg-yellow-500",
      icon: Clock,
      value: safeCount("pending"),
      link: "/app/dashboard/pending",
    },
    {
      key: "completed",
      label: "Completed",
      color: "bg-green-500",
      icon: CheckCircle,
      value: safeCount("completed"),
      link: "/app/dashboard/work?filter=completed",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h6 className="text-2xl md:text-3xl font-semibold mb-4">Dashboard</h6>

      {/* Row 1: plain inline info (side by side, not stacked) */}
      <div className="flex justify-around text-lg font-semibold">
        <div className="flex items-center gap-2  bg-slate-200">
          <span className="text-gray-800" >Total Clients:</span>
          <span>{safeCount("totalClients")}</span>
        </div>
        <div className="flex items-center gap-2  bg-slate-200">
          <span className="text-gray-800 ">Total Due Dates:</span>
          <span>{safeCount("totalDueDates")}</span>
        </div>
      </div>

      {/* Row 2+: colored clickable cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.key} href={item.link}>
              <div
                className={cn(
                  "rounded-lg p-4 h-24 flex flex-col justify-between cursor-pointer",
                  "transition hover:opacity-90 active:scale-95 text-white",
                  item.color
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <Icon className="h-4 w-4 opacity-80" />
                </div>
                <div className="text-2xl font-bold">{item.value}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}