


"use client"

import React from "react"
import { useFetchUser } from "@/hooks/user/useFetchUser"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { UserFormDialog } from "@/components/dialogs/UserFormDialog"
import LogoutConfirmButton from "@/components/auth/logout"

export default function ProfilePage() {
  const { data: user, isLoading } = useFetchUser()

  if (isLoading)
    return (
      <div className="min-h-[220px] flex items-center justify-center">
        <p className="text-sm opacity-80">Loading profile...</p>
      </div>
    )

  if (!user)
    return (
      <div className="min-h-[220px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Failed to load profile ❌</p>
      </div>
    )

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Profile</h1>
        <LogoutConfirmButton />
      </div>
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Top section with avatar */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? "User"} />
              <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Details section */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{user.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email account</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mobile number</span>
              <span>{user.phoneNumber || "Add number"}</span>
            </div>
          </div>

          {/* Edit button */}
          <div className="flex justify-end">
            <UserFormDialog user={user}>
              
            </UserFormDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}