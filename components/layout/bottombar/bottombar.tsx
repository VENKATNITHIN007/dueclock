// components/layout/BottomBar.tsx
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, CalendarDays,User
 } from "lucide-react";
import { cn } from "@/lib/utils";



export default function BottomBar() {
  const pathname = usePathname() ?? "";

  const LINKS = [
    { href: "/app/dashboard", label: "Dashboard", Icon: Home },
    { href: "/app/clients", label: "Clients", Icon: Users },
    { href: "/app/duedates", label: "Due Dates", Icon: CalendarDays },
     { href: "/app/user", label: "profile", Icon: User }

  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t bg-white">
      <div className="flex justify-around py-2">
        {LINKS.map((l) => {
          const active = pathname.startsWith(l.href);
          const Icon = l.Icon;
          return (
            <Link key={l.href} href={l.href} className={cn("flex flex-col items-center text-xs px-2", active ? "text-sky-600" : "text-slate-500")}>
              <Icon className="h-6 w-6" />
              <span className="mt-1 text-[11px]">{l.label}</span>
            </Link>
          );
        })}

      
      </div>
    </nav>
  );
}