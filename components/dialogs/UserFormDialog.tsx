"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import UserUpdateForm from "../forms/UserUpdateForm"
import {userProfileFormInput} from "@/lib/schemas";

export function UserFormDialog({ user }: { user: userProfileFormInput }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit User Profile</DialogTitle>
        </DialogHeader>

        <UserUpdateForm initialData={user} />
      </DialogContent>
    </Dialog>
  )
}