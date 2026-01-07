"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdateFirm } from "@/hooks/firm/useUpdateFirm";
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
import { useValidationErrorHandler } from "@/hooks/useValidationEHandle";

const firmUpdateSchema = z.object({
  firmName: z.string().min(1, "Firm name is required"),
  userName: z.string().min(1, "Name is required"),
});

type FirmUpdateInput = z.infer<typeof firmUpdateSchema>;

export default function FirmUpdateForm({
  initialFirmName,
  initialUserName,
  onSuccess,
}: {
  initialFirmName: string;
  initialUserName: string;
  onSuccess?: () => void;
}) {
  const form = useForm<FirmUpdateInput>({
    resolver: zodResolver(firmUpdateSchema),
    defaultValues: {
      firmName: initialFirmName || "",
      userName: initialUserName || "",
    },
  });

  const firmMutation = useUpdateFirm();
  const userMutation = useUpdateUser();
  const handleError = useValidationErrorHandler(form);

  const onSubmit = async (values: FirmUpdateInput) => {
    try {
      // Update firm name
      await firmMutation.mutateAsync({
        firmName: values.firmName,
      });

      // Update user name if changed
      if (values.userName !== initialUserName) {
        await userMutation.mutateAsync({
          data: { name: values.userName },
        });
      }

      toast("Firm and profile updated ✅");
      onSuccess?.();
    } catch (e: any) {
      handleError(e);
    }
  };

  const isLoading = firmMutation.isPending || userMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          name="firmName"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Firm Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="userName"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </form>
    </Form>
  );
}

