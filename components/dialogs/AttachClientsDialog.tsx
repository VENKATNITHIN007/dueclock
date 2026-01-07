// components/dialogs/AttachClientsDialog.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useFetchClients } from "@/hooks/clients/useFetchClients";
import { useAttachClients } from "@/hooks/dueClients/useAttachClients";
import { toast } from "sonner";

type Client = {
  _id: string;
  name: string;
};

type AttachClientsDialogProps = {
  dueDateId: string;
  attachedClientIds?: string[];
};

function normalizeId(id?: unknown) {
  return id == null ? "" : String(id).trim().toLowerCase();
}

export function AttachClientsDialog({
  dueDateId,
  attachedClientIds = [],
}: AttachClientsDialogProps) {
  const { data: clients = [], isLoading } = useFetchClients();
  const attachMutation = useAttachClients(dueDateId);

  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // memoize normalized attached set so comparisons are stable & fast
  const attachedSet = useMemo(() => {
    return new Set(attachedClientIds.map((id) => normalizeId(id)));
  }, [attachedClientIds]);

  // compute available & already-attached lists from latest clients + attachedSet
  const { availableClients, alreadyAttached } = useMemo(() => {
    const available: Client[] = [];
    const attached: Client[] = [];

    for (const c of clients) {
      const nid = normalizeId(c._id);
      if (attachedSet.has(nid)) attached.push(c);
      else available.push(c);
    }

    return { availableClients: available, alreadyAttached: attached };
  }, [clients, attachedSet]);

  useEffect(() => {
    if (!open) setSelected([]);
  }, [open]);

  const toggle = (id: string) => {
    // prevent selecting an already-attached client (safety)
    if (attachedSet.has(normalizeId(id))) return;
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const attach = () => {
    if (!selected.length) {
      toast.error("Select at least one client");
      return;
    }

    attachMutation.mutate(selected, {
      onSuccess: (res: any) => {
        const inserted = res?.inserted ?? 0;
        const skipped = res?.skipped ?? 0;
        const skippedIds: string[] = (res?.skippedIds ?? []).map(String);

        if (inserted > 0) toast.success(`${inserted} client(s) attached`);
        if (skipped > 0) {
          const skippedNames = clients
            .filter((c: Client) => skippedIds.includes(normalizeId(c._id)))
            .map((c: Client) => c.name)
            .slice(0, 5)
            .join(", ");
          const more = skipped > 5 ? ` +${skipped - 5} more` : "";
          toast(`${skipped} skipped (already attached): ${skippedNames}${more}`);
        }

        setSelected([]);
        setOpen(false);
      },
      onError: () => {
        toast.error("Attach failed");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Attach Clients</Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Clients</DialogTitle>
        </DialogHeader>

        {isLoading && <p className="text-sm">Loading...</p>}

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Available</h4>
            {availableClients.length === 0 && (
              <p className="text-sm text-slate-500">No clients available to attach</p>
            )}
            <div className="space-y-2">
              {availableClients.map((c: Client) => (
                <label
                  key={normalizeId(c._id)}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(String(c._id))}
                    onChange={() => toggle(String(c._id))}
                    className="accent-slate-600"
                  />
                  <span className="truncate">{c.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Already attached</h4>
            {alreadyAttached.length === 0 ? (
              <p className="text-sm text-slate-500">None</p>
            ) : (
              <div className="space-y-2">
                {alreadyAttached.map((c: Client) => (
                  <div
                    key={normalizeId(c._id)}
                    className="flex items-center gap-2 text-sm text-slate-500 line-through opacity-60 select-none"
                    title="Already attached"
                  >
                    <input type="checkbox" disabled />
                    <span className="truncate">{c.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={!selected.length || attachMutation.isPending} onClick={attach}>
            Attach ({selected.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}