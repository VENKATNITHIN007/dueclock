"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import ClientForm from "@/components/forms/ClientForm"
import type { ClientType } from "@/lib/databaseSchemas"

export function ClientFormDialog({ client }: { client?: ClientType }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={client ? "outline" : "default"}>
          {client ? "Edit" : "Add Client"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{client ? "Edit Client" : "Add Client"}</DialogTitle>
        </DialogHeader>

        {/* Pass id + initialData if editing */}
        <ClientForm id={client?._id} initialData={client} onSuccess={() => setOpen(false)}  />
      </DialogContent>
    </Dialog>
  )
}