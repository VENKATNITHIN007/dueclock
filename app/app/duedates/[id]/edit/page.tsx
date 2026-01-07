"use client";

import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useFetchDueById } from "@/hooks/dues/useFetchDueById";
import { canAddOrDelete } from "@/lib/permissions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import DueDateForm from "@/components/forms/DueDateForm";

import { ArrowLeft } from "lucide-react";

export default function EditDueDatePage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const { data: dueDate, isLoading, error } = useFetchDueById(params.id as string);
  
  const canEdit = canAddOrDelete(session?.user?.role);

  if (!canEdit) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 font-medium">You don&apos;t have permission to edit due dates.</p>
            <Button 
              onClick={() => router.back()} 
              variant="outline" 
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
          <CardHeader>
            <Skeleton className="h-7 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !dueDate) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 font-medium mb-4">
              {error ? `Failed to load due date: ${error.message}` : "Due date not found"}
            </p>
            <Button 
              onClick={() => router.push("/app/duedates")} 
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Due Dates
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              onClick={() => router.back()} 
              variant="ghost" 
              size="icon"
              className="hover:bg-white/60"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Edit Due Date</h1>
              <p className="text-slate-600 mt-1">
                Update compliance tracking details for {dueDate.title}
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Due Date Details</CardTitle>
          </CardHeader>
          <CardContent>
            <DueDateForm 
              id={dueDate._id}
              initialData={{
                title: dueDate.title,
                date: dueDate.date.includes('T') ? dueDate.date.split('T')[0] : dueDate.date,
              }}
              onSuccess={() => {
                router.push("/app/duedates");
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}