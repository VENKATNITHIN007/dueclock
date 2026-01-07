"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useFetchFirm } from "@/hooks/firm/useFetchFirm";
import { useFetchMembers } from "@/hooks/firm/useFetchMembers";
import { InviteMemberDialog } from "@/components/dialogs/InviteMemberDialog";
import { FirmFormDialog } from "@/components/dialogs/FirmFormDialog";
import { UserFormDialog } from "@/components/dialogs/UserFormDialog";
import LogoutConfirmButton from "@/components/auth/logout";
import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/querykeys";
import { toast } from "sonner";
import { UserType } from "@/schemas/apiSchemas/userSchema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function FirmPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { data, isLoading } = useFetchFirm();
  const { data: members, isLoading: membersLoading } = useFetchMembers();

  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/members/${memberId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || "Failed to delete member");
      }
      return res.json();
    },
    onSuccess: () => {
      // Invalidate members list
      qc.invalidateQueries({ queryKey: queryKeys.firm.members });
      // Invalidate firm details (may affect member count display)
      qc.invalidateQueries({ queryKey: queryKeys.firm.details });
      // Invalidate activity
      qc.invalidateQueries({ 
        predicate: (query) => query.queryKey[0] === "activity" 
      });
      toast.success("Member removed successfully");
    },
    onError: (err: Error) => {
      toast.error(err?.message || "Failed to remove member");
    },
  });

  const handleDeleteMember = (memberId: string) => {
    deleteMemberMutation.mutate(memberId);
  };

  if (isLoading)
    return (
      <div className="min-h-[220px] flex items-center justify-center">
        <p className="text-sm opacity-80">Loading firm...</p>
      </div>
    );

  if (!data)
    return (
      <div className="min-h-[220px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Failed to load firm ❌
        </p>
      </div>
    );

  const firm = data?.firm;
  const user = data?.user;

  const isOwner = user?.role === "owner";

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold leading-tight">
          Firm
        </h1>

        {/* Owner actions + logout */}
        <div className="flex items-center flex-wrap gap-2">
          {isOwner && (
            <>
              <InviteMemberDialog />
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs sm:text-sm"
                onClick={() => router.push("/app/firm/activity")}
              >
                Activity
              </Button>
            </>
          )}
          <LogoutConfirmButton />
        </div>
      </div>

      {/* Firm Info Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Firm avatar + name */}
          <div className="flex flex-col xs:flex-row xs:items-center gap-3 sm:gap-4">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0">
              <AvatarFallback>
                {firm?.firmName?.[0] ?? user?.name?.[0] ?? "F"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold truncate">
                {firm?.firmName ?? user?.name ?? "Your Firm"}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                {user?.email ?? "—"}
              </p>
            </div>
          </div>

          {/* Firm details */}
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Firm name</span>
              <span className="truncate text-right max-w-[60%]">{firm?.firmName ?? "—"}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Your name</span>
              <span className="truncate text-right max-w-[60%]">{user?.name ?? "—"}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Your email</span>
              <span className="truncate text-right max-w-[60%]">{user?.email ?? "—"}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Your role</span>
              <Badge variant="outline" className="capitalize text-xs">
                {user?.role ?? "—"}
              </Badge>
            </div>
          </div>

          {/* Edit buttons */}
          <div className="pt-3 sm:pt-4 border-t">
            {isOwner ? (
              <FirmFormDialog firmName={firm?.firmName || ""} userName={user?.name || ""} />
            ) : (
              <UserFormDialog user={user as UserType} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Members Section - Only visible to owner */}
      {isOwner && (
        <Card>
          <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2">
              <CardTitle className="text-lg sm:text-xl">Team Members</CardTitle>
              <InviteMemberDialog />
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            {membersLoading ? (
              <p className="text-sm text-muted-foreground">Loading members...</p>
            ) : members && members.length > 0 ? (
              <div className="space-y-2 sm:space-y-3">
                {members.map((member) => (
                  <div
                    key={member._id}
                    className="flex flex-col xs:flex-row xs:items-center justify-between p-3 rounded-lg border bg-card gap-2 sm:gap-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarFallback>
                          {member.name?.[0]?.toUpperCase() ?? member.email?.[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{member.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between xs:justify-end gap-2 w-full xs:w-auto">
                      <Badge
                        variant={member.role === "owner" ? "default" : member.role === "admin" ? "secondary" : "outline"}
                        className="capitalize text-xs"
                      >
                        {member.role}
                      </Badge>
                      {member.role !== "owner" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              disabled={deleteMemberMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[95vw] sm:max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Member</AlertDialogTitle>
                              <AlertDialogDescription className="text-sm">
                                Are you sure you want to remove {member.name || member.email} from the firm? 
                                They will no longer be able to access the firm.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDeleteMember(member._id)}
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No members found. Invite team members to get started.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}