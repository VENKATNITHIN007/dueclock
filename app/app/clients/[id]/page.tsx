"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFetchClientById } from "@/hooks/client/useFetchClientById";
import { useDeleteClient } from "@/hooks/client/useDeleteClient";
import { ClientFormDialog } from "@/components/dialogs/ClientFormDialog";

import {
  User,
  Phone,
  Mail as MailIcon,
  Copy,
  MessageCircle,
} from "lucide-react";
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
  const { id } = useParams();
  const router = useRouter();
  const { data: client, isLoading } = useFetchClientById(id as string);
  const deleteMutation = useDeleteClient();

  const [contactOpen, setContactOpen] = useState(false);

  if (isLoading) return <p className="p-6">Loading…</p>;
  if (!client) return <p className="p-6 text-red-600">Client not found</p>;

  const message = `Hello ${client.name ?? "Client"},\n\nThis is a quick request for the details we need to proceed with your work. Please reply at your convenience.\n\nThanks.`;

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

      {/* Client Info */}
      <Card className="border-2 border-sky-200 rounded-xl shadow-md">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold text-sky-700">
            {client.name}
          </CardTitle>
          <div className="flex gap-2">
            <ClientFormDialog client={client} />

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete {client.name}?
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
          {/* Client details */}
          <div className="flex items-center gap-2 text-slate-700">
            <User size={18} className="text-sky-500" /> {client.type ?? "—"}
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <Phone size={18} className="text-green-500" />{" "}
            {client.phoneNumber ?? "—"}
          </div>
          <div className="flex items-center gap-2 text-slate-700">
            <MailIcon size={18} className="text-rose-500" />{" "}
            {client.email ?? "—"}
          </div>

          {/* Contact */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setContactOpen((p) => !p)}
          >
            <MessageCircle size={14} /> Contact
          </Button>

          {contactOpen && (
            <div className="mt-3 space-y-2 border-t pt-3 border-slate-200">
              <textarea
                readOnly
                rows={5}
                className="w-full border rounded p-2 text-sm whitespace-pre-wrap"
                value={message}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={copyToClipboard}
                  className="flex items-center gap-2"
                >
                  <Copy size={14} /> Copy
                </Button>

                {client.email && (
                  <a
                    href={`mailto:${client.email}?subject=${encodeURIComponent(
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

                {client.phoneNumber && sanitizePhoneForWa(client.phoneNumber) && (
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
        </CardContent>
      </Card>

      {/* Due Dates */}
<div>
  <h2 className="text-lg font-semibold mb-4">Pending Due Dates</h2>
  {client.dueDates.length === 0 ? (
    <p className="text-muted-foreground">No pending due dates.</p>
  ) : (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {client.dueDates.map((due) => (
        <Card key={due._id} className="p-3 shadow-sm bg-gray-100">
          <div className="flex flex-col">
            <span className="font-medium text-sm truncate text-red-900">{due.title}</span>
            <span className="text-xs text-muted-foreground mt-1">
              {formatFriendly(due.date)}
            </span>
          </div>
        </Card>
      ))}
    </div>
  )}
</div>

<Link href="/app/clients">
        <Button variant="outline">← Back to Clients</Button>
      </Link>
    </div>
  );
}