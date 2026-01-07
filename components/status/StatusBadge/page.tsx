// components/status/StatusBadge/page.tsx
import React from "react";
import { FileText, Check } from "lucide-react";

type BadgeVariant = "pill" | "icon";

export function StatusBadge({
  type,
  value,
  variant = "pill",
}: {
  type: "doc" | "work";
  value: string;
  variant?: BadgeVariant;
}) {
  // compact icon-only variant (used inline next to client name)
  if (variant === "icon") {
    if (type === "doc" && value === "received") {
      return <FileText size={16} className="text-emerald-600 inline-block ml-2" />;
    }
    if (type === "work" && value === "completed") {
      return <Check size={16} className="text-emerald-600 inline-block ml-2" />;
    }
    return null;
  }

  // full pill variant (fallback / other places)
  const style =
    type === "doc"
      ? value === "received"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-yellow-100 text-yellow-700"
      : value === "completed"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${style}`}
      aria-hidden
    >
      {value}
    </span>
  );
}