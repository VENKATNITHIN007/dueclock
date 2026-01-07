// components/layout/Sidebar.tsx
"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Users, CalendarDays, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";


const LINKS = [
  // { href: "/app/dashboard", label: "Dashboard", Icon: Home },
  { href: "/app/duedates", label: "Due Dates", Icon: CalendarDays },
  { href: "/app/clients", label: "Clients", Icon: Users },
  { href: "/app/subscription", label: "Subscription", Icon: CreditCard },
  
];

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 border-r bg-white">
      <div className="px-4 py-4 border-b flex items-center">
        <div  className="text-lg font-bold"  aria-label="Go to dashboard"><span className="text-orange-400">Due</span>clock</div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1" aria-label="Main navigation">
        {LINKS.map((l) => {
          const active = pathname.startsWith(l.href);
          const Icon = l.Icon;
          return (
            <button
              key={l.href}
              onClick={() => router.push(l.href)}
              className={cn(
                "flex items-center gap-3 w-full text-left rounded-md px-3 py-2 text-sm transition",
                active ? "bg-sky-100 text-sky-800" : "text-slate-700 hover:bg-slate-100"
              )}
              type="button"
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden />
              <span>{l.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}