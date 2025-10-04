"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import DueDateForm from "@/components/forms/DueDateForm"
import {DueType} from "@/schemas/apiSchemas/dueDateSchema"


export function DueDateFormDialog({
  due,
  clientId
}: {
  due?: DueType
  clientId:string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={due ? "outline" : "default"}>
          {due ? "Edit" : "Add Due Date"}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{due ? "Edit Due Date" : "Add Due Date"}</DialogTitle>
        </DialogHeader>

        {/* Pass id + initialData if editing */}
        <DueDateForm
          id={due?._id}
          clientId={clientId}
          initialData={due}
          
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}