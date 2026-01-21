// components/layout/Sidebar.tsx
"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Users, CalendarDays, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { canAddOrDelete } from "@/lib/permissions";


const LINKS = [
  // { href: "/app/dashboard", label: "Dashboard", Icon: Home },
  { href: "/app/duedates", label: "Due Dates", Icon: CalendarDays },
  { href: "/app/clients", label: "Clients", Icon: Users },
  { href: "/app/subscription", label: "Subscription", Icon: CreditCard },
  
];

export default function Sidebar() {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { data: session } = useSession();
  const canManage = canAddOrDelete(session?.user?.role);

  // Filter out subscription link for staff
  const links = LINKS.filter(link => 
    link.href !== "/app/subscription" || canManage
  );

  return (
    <aside className="hidden md:flex md:flex-col md:w-60 border-r bg-white">
      <div className="px-4 py-3.5 border-b flex items-center">
        <div className="text-base font-bold" aria-label="Go to dashboard">
          <span className="text-blue-600">Due</span>clock
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1" aria-label="Main navigation">
        {links.map((l) => {
          const active = pathname.startsWith(l.href);
          const Icon = l.Icon;
          return (
            <button
              key={l.href}
              onClick={() => router.push(l.href)}
              className={cn(
                "flex items-center gap-2.5 w-full text-left rounded-md px-3 py-2.5 text-sm transition-colors",
                active ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
              )}
              type="button"
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{l.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}