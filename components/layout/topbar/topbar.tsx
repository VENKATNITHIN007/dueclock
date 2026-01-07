// components/layout/Topbar.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { User, Menu } from "lucide-react";

type TopbarProps = {
  onToggleSidebar?: () => void;
  sidebarVisible?: boolean;
};

export default function Topbar({
  onToggleSidebar,
  sidebarVisible = true,
}: TopbarProps) {
  const router = useRouter();
  const goProfile = () => router.push("/app/firm");

  return (
    <header className="hidden md:flex items-center justify-between px-4 py-3 border-b bg-white">
      {/* LEFT: app title + sidebar toggle (desktop) */}
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center">
          <button
            onClick={() => onToggleSidebar?.()}
            aria-pressed={sidebarVisible}
            aria-label={sidebarVisible ? "Hide sidebar" : "Show sidebar"}
            className="ml-2 px-2 py-1 rounded hover:bg-gray-50 flex items-center gap-2"
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* center (kept empty for now) */}
      <div />

      {/* RIGHT: desktop actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={goProfile}
          className="px-3 py-1 rounded hover:bg-gray-50"
          type="button"
          aria-label="Open profile"
        >
          <User className="inline-block h-4 w-4 mr-2" /> Profile
        </button>
       
      </div>
    </header>
  );
}