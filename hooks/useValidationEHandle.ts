// hooks/useValidationErrorHandler.ts use f
"use client"
import { toast } from "sonner"
import { FieldValues, UseFormReturn, Path } from "react-hook-form"

export function useValidationErrorHandler<T extends FieldValues>(
  form: UseFormReturn<T>
) {
  return (e: any) => {
    const fe: Record<string, string[]> | undefined = e?.response?.data?.errors?.fieldErrors
    if (fe) {
      Object.entries(fe).forEach(([field, messages]) => {
        form.setError(field as Path<T>, {
          type: "server",
          message: (messages as string[])[0],
        })
      })
    } else {
      toast(e?.response?.data?.error || "Something went wrong")
    }
  }
}