"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function InviteAcceptPage({ params }: { params: Promise<{ token: string }> | { token: string } }) {
  const router = useRouter();
  const { data: session, status: sessionStatus, update } = useSession();
  const [status, setStatus] = useState<"idle" | "loading" | "checking_auth" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");
  const hasProcessedRef = useRef(false);

  useEffect(() => {
    // Handle async params
    async function getToken() {
      const resolvedParams = "then" in params ? await params : params;
      setToken(resolvedParams.token);
    }
    getToken();
  }, [params]);

  // Handle invite acceptance flow
  useEffect(() => {
    if (!token) return;
    
    if (sessionStatus === "loading") {
      setStatus("checking_auth");
      return;
    }

    // If not authenticated, redirect to sign in
    if (sessionStatus === "unauthenticated") {
      // Store the token in sessionStorage so we can use it after login
      if (typeof window !== "undefined") {
        sessionStorage.setItem("invite_token", token);
      }
      // Redirect to Google sign-in
      signIn("google", { callbackUrl: `/invite/${token}` });
      return;
    }

    // User is authenticated, proceed with accepting invite
    // Add a small delay to ensure session is fully ready after redirect
    if (sessionStatus === "authenticated" && status === "idle" && token && !hasProcessedRef.current) {
      // Small delay to ensure session is fully loaded
      const timer = setTimeout(() => {
        if (!hasProcessedRef.current) {
          hasProcessedRef.current = true;
          acceptInvite(token);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [sessionStatus, token, status]);

  async function acceptInvite(inviteToken: string) {
    setStatus("loading");
    
    // Get token from sessionStorage if it exists (in case user just logged in)
    const finalToken = typeof window !== "undefined" 
      ? sessionStorage.getItem("invite_token") || inviteToken 
      : inviteToken;
    
    // Clear stored token
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("invite_token");
    }

    try {
      const res = await fetch("/api/invite/accept", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: finalToken }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        hasProcessedRef.current = false; // Allow retry
        setStatus("error");
        if (json?.error === "Email mismatch" || json?.error?.includes("Email mismatch")) {
          setMessage(
            `This invite was sent to a different email address. Please sign out and sign in with the Google account matching the email address that received the invite (${json?.inviteEmail || "the invited email"}).`
          );
        } else if (json?.error?.includes("already exists")) {
          setMessage(
            `A user with this email already exists. Invites can only be sent to new users.`
          );
        } else {
          setMessage(json?.error || `Failed to accept invite: ${res.status}`);
        }
        return;
      }
      setStatus("success");
      setMessage("Invite accepted! You've been added to the firm.");
      
      // Force session refresh to get updated firm/role
      try {
        await update();
      } catch (updateErr) {
        console.error("Session update error:", updateErr);
        // Continue anyway - session will refresh on next page load
      }
      
      // Redirect to app after a brief delay to show success message
      setTimeout(() => {
        // Use window.location for a full page reload to ensure session is fresh
        window.location.href = "/app/firm";
      }, 1500);
    } catch (err: any) {
      hasProcessedRef.current = false; // Allow retry
      setStatus("error");
      setMessage(String(err?.message || err));
    }
  }

  if (status === "checking_auth") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4 text-center">
          <h1 className="text-xl font-semibold">Checking authentication...</h1>
          <p className="text-sm text-muted-foreground">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4 text-center">
        <h1 className="text-xl font-semibold">
          {status === "loading" ? "Accepting Invite" : status === "success" ? "Success!" : "Accept Invite"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {message ?? (status === "loading" ? "Please wait..." : "")}
        </p>
        {status === "error" && (
          <div className="space-y-2">
            <Button onClick={() => router.push("/")}>Go Home</Button>
            <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        )}
        {status === "success" && (
          <p className="text-xs text-muted-foreground">Redirecting you to the firm page...</p>
        )}
      </div>
    </div>
  );
}
