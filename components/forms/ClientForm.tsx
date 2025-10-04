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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { clientFormSchema, clientFormInput } from "@/schemas/formSchemas"
import { useUpdateClient } from "@/hooks/client/useUpdateClient"
import { useCreateClient } from "@/hooks/client/useCreateClient"
import { useValidationErrorHandler } from "@/hooks/useValidationEHandle"


export default function ClientForm({
  id,
  initialData,
  onSuccess
}: {
  id?: string
  initialData?: Partial<clientFormInput>
  onSuccess?:()=>void
}) {
  const form = useForm<clientFormInput>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: initialData ?? {
      name: "",
      phoneNumber: "",
      email: "",
    },
    mode: "onChange",
  })

  // hooks
  const updateMutation = useUpdateClient()
  const createMutation = useCreateClient()
  const handleError = useValidationErrorHandler(form)

  const onSubmit = (values: clientFormInput) => {
    if (id) {
      updateMutation.mutate(
        { id, data: values },
        {
          onSuccess: () => {
            toast("Client updated ✅")
            onSuccess?.()
          },
          onError: (e: any) => {
            handleError(e)
          },
        }
      )
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          toast("Client created ✅")
          form.reset()
          onSuccess?.() // reset after creation
        },
        onError: (e: any) => {
          toast(e?.message || "Create failed ❌")
        },
      })
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-md mx-auto p-6"
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name*</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Client name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

       

        <FormField
          name="phoneNumber"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input {...field} placeholder="+919876543210" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="email"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" {...field} placeholder="you@example.com" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={updateMutation.isPending || createMutation.isPending}
        >
          {id
            ? updateMutation.isPending
              ? "Updating..."
              : "Update Client"
            : createMutation.isPending
            ? "Creating..."
            : "Create Client"}
        </Button>
      </form>
    </Form>
  )
}