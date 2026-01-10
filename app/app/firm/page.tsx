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
    <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">
          Firm
        </h1>

        {/* Owner actions + logout */}
        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <InviteMemberDialog />
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs"
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
      <Card className="border-gray-200">
        <CardContent className="p-4 space-y-4">
          {/* Firm avatar + name */}
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 flex-shrink-0">
              <AvatarFallback className="text-sm font-semibold">
                {firm?.firmName?.[0] ?? user?.name?.[0] ?? "F"}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-semibold truncate">
                {firm?.firmName ?? user?.name ?? "Your Firm"}
              </h2>
              <p className="text-xs text-gray-600 truncate">
                {user?.email ?? "—"}
              </p>
            </div>
          </div>

          {/* Firm details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Firm</span>
              <span className="truncate text-right max-w-[60%] font-medium">{firm?.firmName ?? "—"}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Name</span>
              <span className="truncate text-right max-w-[60%] font-medium">{user?.name ?? "—"}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Email</span>
              <span className="truncate text-right max-w-[60%] font-medium">{user?.email ?? "—"}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Role</span>
              <Badge variant="outline" className="capitalize text-xs">
                {user?.role ?? "—"}
              </Badge>
            </div>
          </div>

          {/* Edit buttons */}
          <div className="pt-3 border-t">
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
        <Card className="border-gray-200">
          <CardHeader className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg">Team Members</CardTitle>
              <InviteMemberDialog />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {membersLoading ? (
              <p className="text-sm text-gray-500">Loading members...</p>
            ) : members && members.length > 0 ? (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-white"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="text-xs">
                          {member.name?.[0]?.toUpperCase() ?? member.email?.[0]?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{member.name || "Unknown"}</p>
                        <p className="text-xs text-gray-600 truncate">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
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
                              className="h-7 w-7 p-0"
                              disabled={deleteMemberMutation.isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-base">Remove Member</AlertDialogTitle>
                              <AlertDialogDescription className="text-sm">
                                Remove {member.name || member.email} from the firm? 
                                They will lose access.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="text-sm">Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 text-sm"
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
              <p className="text-sm text-gray-500">No members. Invite team members to get started.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}