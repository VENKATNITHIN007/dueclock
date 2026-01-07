"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import FirmUpdateForm from "../forms/FirmUpdateForm";

export function FirmFormDialog({ firmName, userName }: { firmName: string; userName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Firm</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Firm Details</DialogTitle>
        </DialogHeader>

        <FirmUpdateForm
          initialFirmName={firmName}
          initialUserName={userName}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

