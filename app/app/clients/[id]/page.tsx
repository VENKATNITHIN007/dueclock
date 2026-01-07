"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFetchClientById } from "@/hooks/clients/useFetchClientById";
import { useDeleteClient } from "@/hooks/clients/useDeleteClient";
import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";

import { Phone, Mail as MailIcon, Copy, MessageCircle } from "lucide-react";
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
import { useState } from "react";


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

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  const router = useRouter();
  const { data: client, isLoading } = useFetchClientById(clientId as string);
  const deleteMutation = useDeleteClient();

  const [contactOpen, setContactOpen] = useState(false);

  if (isLoading) return <p className="p-6">Loading…</p>;
  if (!client) return <p className="p-6 text-red-600">Client not found</p>;

  const message = `Hello ${
    client.name ?? "Client"
  },\n\nThis is a quick request for the details we need to proceed with your work. Please reply at your convenience.\n\nThanks.`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
     

      {/* Client Info Card */}
      <Card className="border rounded-xl shadow-md">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-semibold text-sky-700 leading-tight">
              {client.name}
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <ClientFormDialog client={client} />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete {client.name} ? It will delete all duedates related
                    to client
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() =>
                      deleteMutation.mutate(client._id, {
                        onSuccess: () => {
                          toast("Client deleted ✅");
                          router.push("/app/clients");
                        },
                      })
                    }
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Key details in a responsive row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="flex items-center gap-2 text-slate-700 min-w-0">
              <Phone size={18} className="text-green-500 flex-shrink-0" />
              <div className="truncate">
                <div className="text-sm font-medium">Phone</div>
                <div className="text-xs text-muted-foreground truncate">
                  {client.phoneNumber ?? "—"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-700 min-w-0">
              <MailIcon size={18} className="text-rose-500 flex-shrink-0" />
              <div className="truncate">
                <div className="text-sm font-medium">Email</div>
                <div className="text-xs text-muted-foreground truncate">
                  {client.email ?? "—"}
                </div>
              </div>
            </div>
          </div>

          {/* Contact toggle + panel */}
          <div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                aria-expanded={contactOpen}
                aria-controls="contact-panel"
                onClick={() => setContactOpen((p) => !p)}
              >
                <MessageCircle size={14} className="mr-1" /> Contact
              </Button>
            </div>

            {contactOpen && (
              <div
                id="contact-panel"
                role="region"
                aria-live="polite"
                className="mt-3 space-y-3 border-t pt-3 border-slate-200"
              >
                <textarea
                  readOnly
                  rows={5}
                  className="w-full border rounded p-2 text-sm whitespace-pre-wrap"
                  value={message}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    onClick={copyToClipboard}
                    className="flex items-center gap-2"
                  >
                    <Copy size={14} /> Copy
                  </Button>

                  {client.email && (
                    <a
                      href={`mailto:${
                        client.email
                      }?subject=${encodeURIComponent(
                        "Quick request"
                      )}&body=${encodeURIComponent(message)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2 hover:bg-slate-100"
                      >
                        <MailIcon size={14} /> Email
                      </Button>
                    </a>
                  )}

                  {client.phoneNumber &&
                    sanitizePhoneForWa(client.phoneNumber) && (
                      <a
                        href={`https://wa.me/${sanitizePhoneForWa(
                          client.phoneNumber
                        )}?text=${encodeURIComponent(message)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2 hover:bg-slate-100"
                        >
                          <MessageCircle size={14} /> WhatsApp
                        </Button>
                      </a>
                    )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Due Dates */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Pending Due Dates</h2>

        {(() => {
          const pendingDueDates = client.dueDates.filter(
            (due:any) => due.workStatus === "pending"
          );

          if (pendingDueDates.length === 0) {
            return (
              <p className="text-muted-foreground">No pending due dates.</p>
            );
          }

          return (
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {pendingDueDates.map((due:any) => (
                <Card key={due.dueDate._id} className="p-3 shadow-sm bg-white border">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-red-900 truncate">
                        {due.dueDate.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatFriendly(due.dueDate.date)}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          );
        })()}
      </div>

      <div>
        <Link href="/app/clients">
          <Button variant="outline">← Back to Clients</Button>
        </Link>
      </div>
    </div>
  );
}
