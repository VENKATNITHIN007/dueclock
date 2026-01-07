"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import DueDateForm from "@/components/forms/DueDateForm"
import {DueType} from "@/schemas/apiSchemas/dueClientSchema"
import { Edit, Plus } from "lucide-react"


export function DueDateFormDialog({
  due,
  children,
}: {
  due?: DueType
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={due ? "outline" : "default"} className="gap-2">
            {due ? (
              <>
                <Edit className="h-4 w-4" />
                Edit
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Due Date
              </>
            )}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{due ? "Edit Due Date" : "Add Due Date"}</DialogTitle>
        </DialogHeader>

        {/* Pass id + initialData if editing */}
        <DueDateForm
          id={due?._id}
          initialData={due}
          
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}