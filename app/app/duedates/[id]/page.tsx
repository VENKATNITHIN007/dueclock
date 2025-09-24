"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { useFetchDueDateById } from "@/hooks/due/useFetchDueDateById";
import { useDeleteDueDate } from "@/hooks/due/useDeleteDueDate";
import { DueDateFormDialog } from "@/components/dialogs/DueDateFormDialog";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

import {
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  Trash2,
  Copy as CopyIcon,
  MessageCircle,
} from "lucide-react";

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

function sanitizePhoneForWa(raw?: string) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 7 ? digits : null;
}

export default function DueDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: due, isLoading } = useFetchDueDateById(id as string);
  const deleteMutation = useDeleteDueDate();

  const [contactOpen, setContactOpen] = useState(false);

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (!due) return <div className="p-6 text-red-600">Due date not found</div>;

  const isPending = due.status === "pending";
  const statusPillClass = isPending
    ? "bg-amber-50 text-amber-800 ring-amber-100"
    : "bg-green-50 text-green-800 ring-green-100";
  const statusIcon = isPending ? (
    <Clock className="text-amber-500" size={18} />
  ) : (
    <CheckCircle2 className="text-green-500" size={18} />
  );

  const client = due.client ?? {};
  const whatsappNumber = sanitizePhoneForWa(client.phoneNumber);

  const message = `Hello ${client.name ?? "Client"},\n\nPlease share the details for "${due.title}" which is due on ${formatFriendly(
    due.date
  )}.\n\nThank you.`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate(due._id, {
      onSuccess: () => {
        toast.success("Due deleted");
        router.push("/app/duedates");
      },
      onError: (e: any) => toast.error(e?.error ?? "Delete failed"),
    });
  };

  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl">
        {/* header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Due details</h1>
          </div>

          {/* edit/delete actions */}
          <div className="flex items-center gap-2">
            <DueDateFormDialog due={due}></DueDateFormDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 border-rose-400 text-rose-900 hover:bg-rose-50"
                >
                  <Trash2 size={14} />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {due.title}?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-rose-600 text-white hover:bg-rose-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* main card */}
        <Card>
          <CardContent className="">
            {/* Due info section */}
            <div className="p-6 bg-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl text-amber-700 font-semibold leading-tight truncate">
                    {due.title}
                  </h2>
                  <p className="mt-3 text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">
                    {due.description ?? (
                      <span className="text-muted-foreground">
                        No description provided
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex-shrink-0 flex flex-col items-end gap-3">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ring-1 ${statusPillClass}`}
                  >
                    <span className="mr-2">{statusIcon}</span>
                    <span className="capitalize">
                      {due.status ?? "pending"}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground text-right">
                    <div className="text-xs">Due</div>
                    <div className="font-medium">{formatFriendly(due.date)}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* divider */}
            <div className="h-px bg-slate-600" />

            {/* Client info section */}
            <div className="p-6">
              <div className="flex items-start gap-3">
              
                <div>
                  <div className="text-sm font-medium">
                    {client.name ?? "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {client.type ?? "—"}
                  </div>

                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Phone className="text-sky-500" size={14} />
                      <span>{client.phoneNumber || "no phonenumber"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="text-rose-500" size={14} />
                      <span>{client.email|| "no email"}</span>
                    </div>
                  </div>

                  {/* Contact functionality */}
                  <div className="mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setContactOpen(!contactOpen)}
                      className="flex items-center gap-2 text-sky-700 border-sky-300 hover:bg-sky-50"
                    >
                      <MessageCircle size={14} /> Contact
                    </Button>
                  </div>

                  {contactOpen && (
                    <div className="mt-4 border rounded-md p-3 space-y-2">
                      <textarea
                        readOnly
                        rows={5}
                        className="w-full min-w-[300px] md:min-w-[500px] rounded-md border p-3 text-sm"
                        value={message} 
                      />
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={copyToClipboard}
                          className="flex items-center gap-2"
                        >
                          <CopyIcon size={14} /> Copy
                        </Button>
                        {client.email && (
                          <Link
                            href={`mailto:${client.email}?subject=${encodeURIComponent(
                              "Request"
                            )}&body=${encodeURIComponent(message)}`}
                          >
                            <Button size="sm" variant="outline" className="w-full">
                              Email
                            </Button>
                          </Link>
                        )}
                        {whatsappNumber && (
                          <Link
                            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                              message
                            )}`}
                          >
                            <Button size="sm" variant="outline" className="w-full">
                              WhatsApp
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Link href="/app/duedates" className="margin-10">
        <Button variant="outline">← Back to duedates</Button>
      </Link>
    </div>
  );
}