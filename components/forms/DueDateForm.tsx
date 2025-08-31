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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import axios from "axios"
import { toast } from "sonner"
import { dueFormSchema ,dueFormInput} from "@/lib/schemas"

export default function DueDateForm({
  id,
  initialData,
  clientId,
}: {
  id?: string
  initialData?:dueFormInput
  clientId: string
}) {
  const form = useForm<dueFormInput>({
    resolver: zodResolver(dueFormSchema),
    defaultValues: initialData ?? {
      title: "",
      description: "",
      date: new Date(),
      status: "notReadyToFile",
      clientId,
    },
  })

  const onSubmit = async (values: any) => {
    try {
      if (id) {
        await axios.patch(`/api/dues/${id}`, values, { withCredentials: true })
        toast("Due updated")
      } else {
        await axios.post("/api/dues", values, { withCredentials: true })
        toast("Due created")
      }
    } catch (e: any) {
      console.error("Due submit error:", e)

      // Case 1: validation errors
      const fe = e?.response?.data?.errors?.fieldErrors
      if (fe) {
        if (fe.title) form.setError("title", { type: "server", message: fe.title[0] })
        if (fe.description) form.setError("description", { type: "server", message: fe.description[0] })
        if (fe.date) form.setError("date", { type: "server", message: fe.date[0] })
        if (fe.status) form.setError("status", { type: "server", message: fe.status[0] })
        return
      }

      // Case 2: general error
      toast(e?.response?.data?.error || "Something went wrong")
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 max-w-md mx-auto p-6 bg-card rounded-xl shadow"
      >
        {/* Title */}
        <FormField
          name="title"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <input
                  {...field}
                  className="w-full border rounded-md p-2"
                  placeholder="e.g. GST Filing"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          name="description"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <input
                  {...field}
                  className="w-full border rounded-md p-2"
                  placeholder="Optional notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date (Calendar) */}
        <FormField
          name="date"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? format(field.value, "PPP") : "Pick a date"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          name="status"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="border rounded-md p-2 w-full bg-background"
                >
                  <option value="notReadyToFile">Not Ready</option>
                  <option value="readyToFile">Ready</option>
                  <option value="completed">Completed</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {id ? "Update Due" : "Create Due"}
        </Button>
      </form>
    </Form>
  )
}