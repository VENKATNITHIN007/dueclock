"use client";

import React, { useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useFetchDueDates } from "@/hooks/due/useFetchDueDates";
import { useUpdateDueStatus } from "@/hooks/due/useUpdateDueStatus";
import { DueDateFormDialog } from "@/components/dialogs/DueDateFormDialog";
import { Mail as MailIcon, MessageCircle, Copy } from "lucide-react";

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
] as const;

type Period = "all" | "today" | "week" | "month";
type SpecialFilter = "urgent" | "overdue" | undefined;

const MONTHLY_LABELS = ["gst", "tds", "pf", "esi","other"] as const;

function sanitizePhoneForWa(raw?: string) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 7 ? digits : null;
}
function formatFriendly(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function recurrenceLetter(r?: string) {
  if (!r || r === "none") return null;
  if (r === "monthly") return "M";
  if (r === "quarterly") return "Q";
  if (r === "yearly") return "Y";
  return String(r)[0]?.toUpperCase?.() ?? null;
}

const LabelBadge: React.FC<{ text: string }> = ({ text }) => (
  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800">
    {text}
  </span>
);
const RecurrenceBadge: React.FC<{ text: string }> = ({ text }) => (
  <span className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
    {text}
  </span>
);

export default function DueDatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openContactId, setOpenContactId] = useState<string | null>(null);
  const rowRefs = useRef<Record<string, HTMLDivElement | HTMLTableRowElement | null>>({});

  const rawPeriod = (searchParams?.get("period") ?? "all");
  const period: Period = ["all","today","week","month"].includes(rawPeriod) ? (rawPeriod as Period) : "all";
  const rawFilter = searchParams?.get("filter") ?? undefined;
  const specialFilter: SpecialFilter = rawFilter === "urgent" || rawFilter === "overdue" ? (rawFilter as SpecialFilter) : undefined;
  const rawLabel = (searchParams?.get("label") ?? undefined);
  const labelFilter = rawLabel ? rawLabel : undefined;

  const status = "pending" as const;

  const { data: grouped, isLoading, isError } = useFetchDueDates({
    status,
    period: period === "all" ? undefined : (period as "today" | "week" | "month"),
    filter: specialFilter,
    label: labelFilter,
  });

  const updateStatus = useUpdateDueStatus();
  const onStatusChange = (dueId: string, newStatus: string) => {
    updateStatus.mutate({ dueId, status: newStatus });
  };

  const labelOptions = useMemo(() => Array.from(MONTHLY_LABELS), []);

  function updateQueryParams(next: { period?: Period | null; filter?: SpecialFilter | null; label?: string | null }) {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (Object.prototype.hasOwnProperty.call(next, "period")) {
      if (next.period && next.period !== "all") params.set("period", next.period);
      else params.delete("period");
    }
    if (Object.prototype.hasOwnProperty.call(next, "filter")) {
      if (next.filter) params.set("filter", next.filter as string);
      else params.delete("filter");
    }
    if (Object.prototype.hasOwnProperty.call(next, "label")) {
      if (next.label) params.set("label", next.label);
      else params.delete("label");
    }
    setOpenContactId(null);
    router.replace(`/app/duedates${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const applyPeriodOnly = (newPeriod: Period) => {
    updateQueryParams({ period: newPeriod, filter: null, label: null });
  };
  const applySpecialOnly = (f: SpecialFilter) => {
    updateQueryParams({ filter: f ?? null, period: null, label: null });
  };
  const applyLabelOnly = (l?: string) => {
    updateQueryParams({ label: l ?? null, period: null, filter: null });
  };

  const filteredGroups = useMemo(() => {
    if (!grouped) return [];
    return grouped
      .map((g: any) => {
        const dues = (g.dues || []).filter((d: any) => (labelFilter ? String(d.label) === labelFilter : true));
        return { ...g, dues };
      })
      .filter((g: any) => (g.dues?.length ?? 0) > 0);
  }, [grouped, labelFilter]);

  const copyContactMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const toggleContactAndScroll = (id: string) => {
    const willOpen = openContactId !== id;
    setOpenContactId(willOpen ? id : null);
    setTimeout(() => {
      const el = rowRefs.current[willOpen ? `${id}-panel` : id] ?? rowRefs.current[id];
      if (el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
    }, 60);
  };

  const activeHeading = (() => {
    if (specialFilter) return `${specialFilter === "urgent" ? "Urgent" : "Overdue"} due dates`;
    if (labelFilter) return `${String(labelFilter).toUpperCase()} due dates`;
    if (period && period !== "all") return `Due dates — ${period === "today" ? "Today" : period === "week" ? "This Week" : "This Month"}`;
    return "Due dates";
  })();

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (isError) return <p className="p-4 text-red-600">Failed to load due dates</p>;

  if (!filteredGroups || filteredGroups.length === 0) {
    const emptyTitle = specialFilter ? `No ${specialFilter === "urgent" ? "urgent" : "overdue"} due dates` : labelFilter ? `No ${String(labelFilter).toUpperCase()} due dates` : period !== "all" ? `No due dates for ${period === "today" ? "Today" : period === "week" ? "This Week" : "This Month"}` : "No due dates found";
    return (
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <h1 className="text-xl font-bold">{activeHeading}</h1>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted hidden sm:block">Period</label>
              <select value={period} onChange={(e) => applyPeriodOnly(e.target.value as Period)} className="rounded border px-2 py-1 text-sm">
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant={specialFilter === "urgent" ? "default" : "outline"} onClick={() => applySpecialOnly(specialFilter === "urgent" ? undefined : "urgent")}>Urgent</Button>
              <Button size="sm" variant={specialFilter === "overdue" ? "default" : "outline"} onClick={() => applySpecialOnly(specialFilter === "overdue" ? undefined : "overdue")}>Overdue</Button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-muted hidden sm:block">Label</label>
              <select value={labelFilter ?? ""} onChange={(e) => applyLabelOnly(e.target.value || undefined)} className="rounded border px-2 py-1 text-sm">
                <option value="">Label</option>
                {labelOptions.map((l) => <option key={l} value={l}>{String(l).toUpperCase()}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-center text-lg font-semibold">{emptyTitle}</p>
          <p className="text-center text-sm text-muted max-w-xs mt-2">Try clearing filters or add a new due date.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <h1 className="text-xl font-bold">{activeHeading}</h1>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted hidden sm:block">Period</label>
            <select value={period} onChange={(e) => applyPeriodOnly(e.target.value as Period)} className="rounded border px-2 py-1 text-sm">
              <option value="all">All</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant={specialFilter === "urgent" ? "default" : "outline"} onClick={() => applySpecialOnly(specialFilter === "urgent" ? undefined : "urgent")}>Urgent</Button>
            <Button size="sm" variant={specialFilter === "overdue" ? "default" : "outline"} onClick={() => applySpecialOnly(specialFilter === "overdue" ? undefined : "overdue")}>Overdue</Button>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-muted hidden sm:block">Label</label>
            <select value={labelFilter ?? ""} onChange={(e) => applyLabelOnly(e.target.value || undefined)} className="rounded border px-2 py-1 text-sm">
              <option value="">Label</option>
              {labelOptions.map((l) => <option key={l} value={l}>{String(l).toUpperCase()}</option>)}
            </select>
          </div>
        </div>
      </div>

      {filteredGroups.map((group) => (
        <section key={`${group.year}-${String(group.month).padStart(2, "0")}`} className="mb-8">
          <h2 className="text-lg font-semibold mb-4">{MONTH_NAMES[group.month - 1]} {group.year}</h2>

          <div className="grid gap-3 md:hidden">
            {group.dues.map((d: any) => {
              const whatsappNumber = sanitizePhoneForWa(d.phoneNumber);
              const message = `Hello ${d.clientName ?? "Client"},\n\nPlease share the details for "${d.title}" which is due on ${formatFriendly(d.date)}.\n\nThank you.`;
              return (
                <div key={d._id} ref={(el) => { rowRefs.current[d._id] = el; }}>
                  <Card className="rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
  <CardContent className="p-3 space-y-3">
    {/* Title + badges */}
    <div className="flex flex-wrap items-center gap-2">
      <p className="font-semibold text-[15px] text-slate-900 truncate">{d.title}</p>
      {d.label && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">
          {String(d.label).toUpperCase()}
        </span>
      )}
      {recurrenceLetter(d.recurrence) && (
        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
          {recurrenceLetter(d.recurrence)!}
        </span>
      )}
    </div>

    {/* Client + Date */}
    <div className="flex flex-col gap-1">
      <p className="text-[13px] font-medium text-slate-700">{d.clientName ?? "—"}</p>
      <p className="text-[12px] text-slate-500">{formatFriendly(d.date)}</p>
    </div>

    {/* Edit + Pending */}
    <div className="flex items-center gap-2">
      
        <DueDateFormDialog  clientId={d.clientId} due={d} />

      <select
        value={d.status ?? "pending"}
        onChange={(e) => onStatusChange(d._id, e.target.value)}
        className={`rounded-md border border-slate-300 bg-white px-2 py-1 text-[13px] font-medium h-7 ${
          d.status === "completed" ? "text-green-600" : "text-yellow-600"
        }`}
      >
        <option value="pending">Pending</option>
        <option value="completed">Completed</option>
      </select>
    </div>

    {/* Contact small */}
    <Button
      size="sm"
      variant={openContactId === d._id ? "default" : "outline"}
      onClick={() => toggleContactAndScroll(d._id)}
      className="text-[12px] h-7 px-3 rounded-md "
    >
      Contact
    </Button>
  </CardContent>
</Card>
                  {openContactId === d._id && (
                    <div ref={(el) => { rowRefs.current[`${d._id}-panel`] = el; }} className="mt-2 p-3 bg-white border rounded shadow-sm">
                      <textarea readOnly rows={4} className="w-full rounded-md border p-2 text-sm whitespace-pre-wrap resize-none" value={message} />
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={() => copyContactMessage(message)} className="flex items-center gap-2"><Copy size={14} /> Copy</Button>
                        {d.email && (
                          <a href={`mailto:${d.email}?subject=${encodeURIComponent(`Regarding: ${d.title}`)}&body=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="flex items-center gap-2"><MailIcon size={14} /> Email</Button>
                          </a>
                        )}
                        {whatsappNumber && (
                          <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline" className="flex items-center gap-2"><MessageCircle size={14} /> WhatsApp</Button>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="hidden md:block">
            <div className="overflow-x-auto rounded-xl shadow-sm">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Title</th>
                    <th className="p-3 text-left">Client</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {group.dues.map((d: any) => {

                    const whatsappNumber = sanitizePhoneForWa(d.phoneNumber);
                    const message = `Hello ${d.clientName ?? "Client"},\n\nPlease share the details for "${d.title}" which is due on ${formatFriendly(d.date)}.\n\nThank you.`;
                    return (
                      <React.Fragment key={d._id}>
                        <tr ref={(el) => { rowRefs.current[d._id] = el; }} className="border-b">
                          <td className="p-3 max-w-[24rem]">
                            <div className="flex items-center gap-2">
                              <span className="truncate">{d.title}</span>
                              {d.label && <LabelBadge text={String(d.label).toUpperCase()} />}
                              {recurrenceLetter(d.recurrence) && <RecurrenceBadge text={recurrenceLetter(d.recurrence)!} />}
                            </div>
                          </td>
                          <td className="p-3"><span className="font-medium text-slate-800">{d.clientName ?? "—"}</span></td>
                          <td className="p-3">{formatFriendly(d.date)}</td>
                          <td className="p-3">
                            <select value={d.status ?? "pending"} onChange={(e) => onStatusChange(d._id, e.target.value)} className={`rounded-md border px-2 py-1 text-sm ${d.status === "completed" ? "text-green-600" : "text-yellow-600"}`}>
                              <option value="pending">Pending</option>
                              <option value="completed">Completed</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <DueDateFormDialog clientId={d.clientId} due={d} />
                              <Button size="sm" variant={openContactId === d._id ? "default" : "outline"} onClick={() => toggleContactAndScroll(d._id)}>Contact</Button>
                            </div>
                          </td>
                        </tr>

                        {openContactId === d._id && (
                          <tr>
                            <td colSpan={5} className="p-3 bg-gray-50">
                              <div ref={(el) => { rowRefs.current[`${d._id}-panel`] = el; }} className="p-3 border rounded bg-white">
                                <textarea readOnly rows={4} className="w-full rounded-md border p-2 text-sm whitespace-pre-wrap resize-none" value={message} />
                                <div className="flex gap-2 mt-2">
                                  <Button size="sm" onClick={() => copyContactMessage(message)} className="flex items-center gap-2"><Copy size={14} /> Copy</Button>
                                  {d.email && (
                                    <a href={`mailto:${d.email}?subject=${encodeURIComponent(`Regarding: ${d.title}`)}&body=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
                                      <Button size="sm" variant="outline" className="flex items-center gap-2"><MailIcon size={14} /> Email</Button>
                                    </a>
                                  )}
                                  {whatsappNumber && (
                                    <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">
                                      <Button size="sm" variant="outline" className="flex items-center gap-2"><MessageCircle size={14} /> WhatsApp</Button>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
