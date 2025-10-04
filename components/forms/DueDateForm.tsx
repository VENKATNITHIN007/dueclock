"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

import { dueFormSchema, dueFormInput } from "@/schemas/formSchemas"
import { useCreateDueDate } from "@/hooks/due/useCreateDueDate"
import { useUpdateDueDate } from "@/hooks/due/useUpdateDueDate"
//for slecting import { useFetchClients } from "@/hooks/client/useFetchClients"
import { useValidationErrorHandler } from "@/hooks/useValidationEHandle"

export default function DueDateForm({
  id,
  clientId,
  initialData,
  onSuccess,
}: {
  id?: string
  clientId:string
  initialData?: Partial<dueFormInput>
  onSuccess?: () => void
}) {
  const form = useForm<dueFormInput>({
    resolver: zodResolver(dueFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      date: initialData?.date ?? "",
      label:initialData?.label ?? "other",
      recurrence:initialData?.recurrence ?? "none",
    },
    mode: "onChange",
  })

  // for selecting const { data: clients } = useFetchClients()
  const createMutation = useCreateDueDate()
  const updateMutation = useUpdateDueDate()
  const handleError = useValidationErrorHandler(form)

  const onSubmit = (values: dueFormInput) => {
    // ✅ convert date string → ISO string before sending
    const data:dueFormInput = {
      ...values,
      date: new Date(values.date).toISOString(),
    }

    if (id) {
      updateMutation.mutate(
        { dueId:id, data },
        {
          onSuccess: () => {
            toast("Due updated ✅")
            onSuccess?.()
          },
          onError: handleError,
        }
      )

    if (!clientId) {
    toast.error("Client ID missing")
    return
  }

    } else {
      createMutation.mutate({clientId,data}, {
        onSuccess: () => {
          toast("Due created ✅")
          onSuccess?.()
        },
        onError: handleError,
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date*</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>label*</FormLabel>
              <FormControl>
                <select {...field} className="w-full rounded-md border px-3 py-2">
                  <option value="gst">gst</option>
                  <option value="tds">tds</option>
                   <option value="pf">pf</option>
                    <option value="esi">esi</option>
                  <option value="other">other</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="recurrence"
          render={({ field }) => (
            <FormItem>
              <FormLabel>recurrence*</FormLabel>
              <FormControl>
                <select {...field} className="w-full rounded-md border px-3 py-2">
                  <option value="none">none</option>
                  <option value="monthly">monthly</option>
                  <option value="quarterly">quarterly</option>
                  <option value="yearly">yearly</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        

        <Button type="submit"  disabled={updateMutation.isPending || createMutation.isPending}>{id
            ? updateMutation.isPending
              ? "Updating..."
              : "Update Duedate"
            : createMutation.isPending
            ? "Creating..."
            : "Create DueDate"}</Button>
      </form>
    </Form>
  )
}