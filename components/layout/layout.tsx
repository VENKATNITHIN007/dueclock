// components/layout/AppLayout.tsx
"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Sidebar from "./sidebar/sidebar";
import Topbar from "./topbar/topbar";
import BottomBar from "./bottombar/bottombar";
import MobileHeader from "./mobileheader/mobileheader";

type AppLayoutProps = {
  children: ReactNode;
  // optional: when true, remembers user choice in localStorage
  persistSidebar?: boolean;
};

export default function AppLayout({
  children,
  persistSidebar = false,
}: AppLayoutProps) {
  // Visible by default
  const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);

  // optional persistence
  useEffect(() => {
    if (!persistSidebar) return;
    try {
      const raw = localStorage.getItem("sidebarVisible");
      if (raw !== null) setSidebarVisible(JSON.parse(raw));
    } catch {}
  }, [persistSidebar]);

  useEffect(() => {
    if (!persistSidebar) return;
    try {
      localStorage.setItem("sidebarVisible", JSON.stringify(sidebarVisible));
    } catch {}
  }, [persistSidebar, sidebarVisible]);

  const toggleSidebar = () => setSidebarVisible((v) => !v);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar visible only on md+ and only when sidebarVisible is true */}
      {sidebarVisible && (
        <aside className="hidden md:block md:w-60 border-r bg-white">
          <Sidebar />
        </aside>
      )}

      {/* Main area: when sidebar hidden the main expands naturally */}
      <div className="flex-1 flex flex-col min-h-screen">
        <Topbar
          onToggleSidebar={toggleSidebar}
          sidebarVisible={sidebarVisible}
        />
        {/* mobile header */}
        <div className="md:hidden">
          <MobileHeader />
        </div>

        <main className="flex-1 overflow-auto transition-colors duration-150 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom bar */}
      <div className="md:hidden">
        <BottomBar />
      </div>
    </div>
  );
}
