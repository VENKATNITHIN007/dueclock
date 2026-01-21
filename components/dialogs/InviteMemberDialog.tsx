"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";

type Role = "admin" | "staff";

const ROLE_DESCRIPTIONS = {
  admin: {
    title: "Admin",
    permissions: [
      "Can add, edit, and delete due dates, clients, and due date clients",
      "Cannot edit firm details",
      "Cannot invite or remove members",
    ],
  },
  staff: {
    title: "Staff",
    permissions: [
      "Can only edit status and communication for due date clients",
      "Cannot add or delete anything",
      "Cannot edit due dates or clients",
      "Cannot manage firm settings or members",
    ],
  },
};

export function InviteMemberDialog() {
  const [open, setOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("staff");

  useEffect(() => {
    if (open) {
      setInviteCode(null);
      setEmail("");
      setRole("staff");
    }
  }, [open]);

  async function copy() {
    if (!inviteCode) return;
    await navigator.clipboard.writeText(inviteCode);
    toast.success("Invite code copied");
  }

  async function createInvite() {
    if (!email) {
      toast.error("Please enter an email to invite");
      return;
    }
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/invite", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error || "Failed to create invite");
        return;
      }
      setInviteCode(data.inviteCode || data.inviteLink || null);
      if (data.existing) {
        toast.success("Retrieved existing invite code for this email");
      } else {
        toast.success("Invite code created");
      }
    } catch {
      toast.error("Failed to create invite");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Invite member</Button>
      </DialogTrigger>

      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto p-4">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base">Invite team member</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full rounded border px-2.5 py-1.5 text-sm"
            />
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Must use same email to sign in
            </p>
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Role</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setRole("admin")}
                className={`flex-1 rounded border px-2 py-1.5 text-xs transition-colors ${
                  role === "admin"
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setRole("staff")}
                className={`flex-1 rounded border px-2 py-1.5 text-xs transition-colors ${
                  role === "staff"
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                Staff
              </button>
            </div>

            <details className="rounded border border-blue-200 bg-blue-50 p-2">
              <summary className="text-xs font-medium text-blue-900 cursor-pointer">
                {ROLE_DESCRIPTIONS[role].title} Permissions
              </summary>
              <ul className="text-[10px] text-blue-800 mt-1 space-y-0.5 list-disc list-inside">
                {ROLE_DESCRIPTIONS[role].permissions.map((perm, idx) => (
                  <li key={idx}>{perm}</li>
                ))}
              </ul>
            </details>
          </div>

          <Button onClick={createInvite} disabled={loading} className="w-full text-sm py-2">
            {loading ? "Creating..." : "Create Invite"}
          </Button>
        </div>

        {inviteCode && (
          <div className="space-y-2 pt-2 mt-2 border-t">
            <label className="text-xs font-medium">Invite Code</label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteCode}
                className="flex-1 rounded border px-2 py-1.5 text-xs bg-muted font-mono"
              />
              <Button size="sm" variant="outline" onClick={copy} className="h-7 px-2">
                <Copy size={12} />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Share this code. They need to sign in, select Join Existing Firm, and enter this code.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}