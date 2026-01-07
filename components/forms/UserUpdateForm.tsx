"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateUser } from "@/hooks/user/useUpdateUser";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  userProfileFormSchema,
  userProfileFormInput,
} from "@/schemas/formSchemas";
import { useValidationErrorHandler } from "@/hooks/useValidationEHandle";

export default function UserUpdateForm({
  initialData,
  onSuccess,
}: {
  initialData?: Partial<userProfileFormInput>;
  onSuccess?: () => void;
}) {
  const form = useForm<userProfileFormInput>({
    resolver: zodResolver(userProfileFormSchema),
    defaultValues: initialData ?? { name: "" },
  });

  const mutation = useUpdateUser();
  const handleError = useValidationErrorHandler(form);

  const onSubmit = (values: userProfileFormInput) => {
    mutation.mutate(
      { data: { name: values.name } },
      {
        onSuccess: () => {
          toast("Profile updated ✅");
          onSuccess?.();
        },
        onError: (e: any) => {
          handleError(e);
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}
