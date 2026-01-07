"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { dueFormSchema, dueFormInput } from "@/schemas/formSchemas";
import { useCreateDueDate } from "@/hooks/dues/useCreateDueDate";
import { useUpdateDueDate } from "@/hooks/dues/useUpdateDueDate";
//for slecting import { useFetchClients } from "@/hooks/client/useFetchClients"
import { useValidationErrorHandler } from "@/hooks/useValidationEHandle";

export default function DueDateForm({
  id,
  initialData,
  onSuccess,
}: {
  id?: string;
  initialData?: Partial<dueFormInput>;
  onSuccess?: () => void;
}) {
  const form = useForm<dueFormInput>({
    resolver: zodResolver(dueFormSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      date: initialData?.date ?? "", 
    },
    mode: "onChange",
  });

  // for selecting const { data: clients } = useFetchClients()
  const createMutation = useCreateDueDate();
  const updateMutation = useUpdateDueDate();
  const handleError = useValidationErrorHandler(form);

  const onSubmit = (values: dueFormInput) => {
    // ✅ convert date string → ISO string before sending
    const data: dueFormInput = {
      ...values,
      date: new Date(values.date).toISOString(),
    };

    if (id) {
      updateMutation.mutate(
        { dueId: id, data },
        {
          onSuccess: () => {
            toast("Due updated ✅");
            onSuccess?.();
          },
          onError: handleError,
        }
      );

     
    } else {
      createMutation.mutate(
        { data },
        {
          onSuccess: () => {
            toast("Due created ✅");
            onSuccess?.();
          },
          onError: handleError,
        }
      );
    }
  };

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
        <Button
          type="submit"
          disabled={updateMutation.isPending || createMutation.isPending}
        >
          {id
            ? updateMutation.isPending
              ? "Updating..."
              : "Update Duedate"
            : createMutation.isPending
            ? "Creating..."
            : "Create DueDate"}
        </Button>
      </form>
    </Form>
  );
}
