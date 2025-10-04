"use client";

import React from "react";
import Link from "next/link";
import { useFetchDashboard } from "@/hooks/dashboard/counts";
import { AlertTriangle, Clock, CheckCircle, } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardCountsPage() {
  const { data: counts, isLoading, isError } = useFetchDashboard();

  const safeCount = (key: string) =>
    isLoading ? "…" : isError || !counts ? 0 : (counts as any)[key] ?? 0;


  const summaryItems = [
    
    { key: "totalClients", label: "Total Clients" },
    { key: "pendingDues", label: "Pending Dues" },

  ];

  const items = [
    {
      key: "urgent",
      label: "Urgent (3 days)",
      color: "bg-red-500",
      icon: AlertTriangle,
      value: safeCount("urgent"),
      link: "/app/duedates?filter=urgent",
    },
    {
      key: "passed",
      label: "Overdue",
      color: "bg-red-600",
      icon: Clock,
      value: safeCount("passed"),
      link: "/app/duedates?filter=overdue",
    },
    {
      key: "completed",
      label: "Monthly:Completed",
      color: "bg-green-600",
      icon: CheckCircle,
      value: safeCount("completedThisMonth"),
      link: "/app/duedates/completed",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-semibold mb-4">Dashboard</h1>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          {summaryItems.map((c) => {
            const val = safeCount(c.key);
            return (
              <div
                key={c.key}
                className="flex items-center justify-between gap-3 bg-slate-200 rounded-md px-3 py-2 min-w-0 flex-1"
              >
                <div className="min-w-0">
                  <div className="text-sm text-stone-600 truncate">{c.label}</div>
                </div>
                <div className="text-lg md:text-xl font-semibold ml-2 flex-shrink-0">
                  {val}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row 2+: colored clickable cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          let isActive = false;
          if (typeof window !== "undefined") {
            try {
              isActive = window.location.pathname.startsWith(item.link.split("?")[0]);
            } catch {
              isActive = false;
            }
          }

          return (
            <Link
              key={item.key}
              href={item.link}
              aria-label={`${item.label} - ${item.value}`}
              className={cn(
                "rounded-lg p-4 h-20 md:h-24 flex flex-col justify-between cursor-pointer",
                "transition hover:opacity-90 active:scale-95 text-white",
                item.color
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{item.label}</span>
                <Icon className="h-4 w-4 opacity-80" />
              </div>
              <div className="text-2xl font-bold">{item.value}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}