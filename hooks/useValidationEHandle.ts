"use client";

import { toast } from "sonner";
import { FieldValues, UseFormReturn, Path } from "react-hook-form";

export function useValidationErrorHandler<T extends FieldValues>(
  form: UseFormReturn<T>
) {
  return (err: any) => {
    // your API throws JSON from res.json()
    const fieldErrors = err?.errors?.fieldErrors;

    if (fieldErrors) {
      Object.entries(fieldErrors).forEach(([field, messages]) => {
        const msg = Array.isArray(messages) ? messages[0] : String(messages);
        form.setError(field as Path<T>, { type: "server", message: msg });
      });
    } else {
      toast.error(err?.error || err?.message || "Something went wrong");
    }
  };
}