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
import { Copy, Info } from "lucide-react";
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
      toast.success("Invite code created");
    } catch (err) {
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

      <DialogContent className="space-y-4 max-w-md">
        <DialogHeader>
          <DialogTitle>Invite team member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full rounded border px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              The invitee will use this email to join your firm after they sign in.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Role</label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex-1 rounded border px-3 py-2 text-sm transition-colors ${
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
                  className={`flex-1 rounded border px-3 py-2 text-sm transition-colors ${
                    role === "staff"
                      ? "border-primary bg-primary/10 text-primary font-medium"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  Staff
                </button>
              </div>

              <div className="rounded-md border border-blue-200 bg-blue-50 p-3 space-y-1">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900">
                      {ROLE_DESCRIPTIONS[role].title} Permissions:
                    </p>
                    <ul className="text-xs text-blue-800 mt-1 space-y-0.5 list-disc list-inside">
                      {ROLE_DESCRIPTIONS[role].permissions.map((perm, idx) => (
                        <li key={idx}>{perm}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={createInvite} disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Invite"}
          </Button>
        </div>

        {inviteCode && (
          <div className="space-y-2 pt-2 border-t">
            <label className="text-sm font-medium">Invite Code</label>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={inviteCode}
                className="flex-1 rounded border px-3 py-2 text-sm bg-muted font-mono"
              />
              <Button size="sm" variant="outline" onClick={copy} className="shrink-0">
                <Copy size={14} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this code with the person you want to invite. They will need to:
              <br />1. Sign in to DueClock
              <br />2. Select Join Existing Firm
              <br />3. Enter this code to join your firm as {role}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}