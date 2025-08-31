"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import DueDateForm from "../forms/DueDateForm"



export function DueDateFormDialog({
  clientId,
  due,
}: {
  clientId: string
  due?: any
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={due ? "secondary" : "default"}>
          {due ? "Edit Due" : "Add Due"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{due ? "Edit Due Date" : "New Due Date"}</DialogTitle>
        </DialogHeader>
        <DueDateForm id={due?._id} initialData={due} clientId={clientId} />
      </DialogContent>
    </Dialog>
  )
}