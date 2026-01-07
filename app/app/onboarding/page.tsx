"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Building2, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus, update } = useSession();
  const [firmName, setFirmName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");

  useEffect(() => {
    // Redirect if user already has a firm
    if (sessionStatus === "authenticated" && session?.user?.firmId) {
      router.push("/app/firm");
    }
  }, [sessionStatus, session, router]);

  if (sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    router.push("/");
    return null;
  }

  const handleCreateFirm = async () => {
    if (!firmName.trim()) {
      toast.error("Please enter a firm name");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/firm/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ firmName: firmName.trim() }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(json?.error || "Failed to create firm");
        return;
      }

      // Refresh session to get updated firmId
      await update();
      toast.success("Firm created successfully!");
      router.push("/app/firm");
    } catch (err: any) {
      toast.error(err?.message || "Failed to create firm");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFirm = async () => {
    if (!inviteCode.trim()) {
      toast.error("Please enter an invite code");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/invite/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: inviteCode.trim() }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) {
        toast.error(json?.error || "Failed to join firm");
        return;
      }

      // Refresh session to get updated firmId
      await update();
      toast.success("Successfully joined the firm!");
      router.push("/app/firm");
    } catch (err: any) {
      toast.error(err?.message || "Failed to join firm");
    } finally {
      setLoading(false);
    }
  };

  if (mode === "choose") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-2xl w-full space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
            <p className="text-muted-foreground">
              Choose how you would like to get started
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => setMode("create")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Create New Firm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Start a new firm and become the owner. You can invite team members later.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => setMode("join")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Join Existing Firm
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Join an existing firm using an invite code shared with you.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Create New Firm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Firm Name</label>
              <Input
                value={firmName}
                onChange={(e) => setFirmName(e.target.value)}
                placeholder="Enter your firm name"
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setMode("choose")}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleCreateFirm}
                disabled={loading || !firmName.trim()}
                className="flex-1"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Firm"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === "join") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Join Existing Firm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Invite Code</label>
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter invite code"
                disabled={loading}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Enter the invite code provided by the firm owner
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setMode("choose")}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
              <Button
                onClick={handleJoinFirm}
                disabled={loading || !inviteCode.trim()}
                className="flex-1"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Firm"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

