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
import { useFetchClients } from "@/hooks/client/useFetchClients"
import { useValidationErrorHandler } from "@/hooks/useValidationEHandle"

export default function DueDateForm({
  id,
  initialData,
  onSuccess,
}: {
  id?: string
  initialData?: Partial<dueFormInput>
  onSuccess?: () => void
}) {
  const form = useForm<dueFormInput>({
    resolver: zodResolver(dueFormSchema),
    defaultValues: {
      clientId: initialData?.clientId ?? "",
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      date: initialData?.date ?? "",
      status: initialData?.status ?? "pending", // ✅ required by schema
    },
    mode: "onChange",
  })

  const { data: clients } = useFetchClients()
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
    } else {
      createMutation.mutate(data, {
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
        {/* Client Select */}
        {/* Client Select */}
<FormField
  control={form.control}
  name="clientId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>
        Client <span className="text-red-500">*</span>
      </FormLabel>
      <FormControl>
        {clients && clients.length > 0 ? (
          <select {...field} className="w-full rounded-md border px-3 py-2">
            <option value="">Select client…</option>
            {clients.map((c: any) => (
              <option key={c._id} value={c._id}>
                {c.name} — {c.phoneNumber || c.email}
              </option>
            ))}
          </select>
        ) : (
          <b className="text-sm text-muted-foreground">
            Please add a client first.
          </b>
        )}
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea {...field} className="w-full rounded-md border px-3 py-2" />
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
              <FormLabel>Due Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select {...field} className="w-full rounded-md border px-3 py-2">
                  <option value="pending">pending</option>
                  <option value="completed">Completed</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">{id ? "Update Due" : "Create Due"}</Button>
      </form>
    </Form>
  )
}