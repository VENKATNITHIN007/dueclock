
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignInButton from "./login/page";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session?.user) redirect("/app/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center bg-white px-4">
    
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
           <span className="text-orange-400">Due</span>clock — Never miss A Duedate
        </h1>
        <p className="text-slate-600">
          One simple place to manage due dates and client follow-ups.
        </p>

        <div className="flex items-center justify-center">
          <SignInButton />
        </div>

        <p className="text-xs text-slate-400">No setup. Just start tracking.</p>
      </div>
    </main>
  );
}
