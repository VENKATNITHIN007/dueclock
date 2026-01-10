// components/layout/mobileHeader/mobileHeader.tsx
"use client";
import React from "react";
import { CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MobileHeader() {
  const router = useRouter();
  
  return (
    <div className="md:hidden flex items-center justify-between px-3 py-2 border-b bg-white">
      {/* <button
        onClick={() => onMenu?.()}
        aria-label="Open menu"
        className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-sky-300"
      >
       
      </button> */}

      <div className="text-sm  font-bold pl-2"><span className="text-orange-400">Due</span>clock</div>

      <button
        onClick={() => router.push('/app/subscription')}
        aria-label="Open subscription"
        className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-300 hover:bg-gray-50 transition-colors"
      >
        <CreditCard className="h-5 w-5" />
      </button>
    </div>
  );
}