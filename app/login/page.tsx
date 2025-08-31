
"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-6 space-y-4 rounded-lg border w-full max-w-sm bg-card text-center">
        <h1 className="text-xl font-semibold">Login</h1>

        <Button
          onClick={() => signIn("google", { callbackUrl: "/clients/new" })}
          className="w-full"
        >
          Continue with Google
        </Button>
      </div>
    </div>
  )
}