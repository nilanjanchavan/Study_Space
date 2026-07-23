"use client"

import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Loader2Icon } from "lucide-react"

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-8 text-center px-6 max-w-md">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Study Workspace
          </h1>
          <p className="text-muted-foreground">
            A multi-user productivity platform for focused work.
          </p>
        </div>

        {isLoading ? (
          <Button disabled>
            <Loader2Icon className="animate-spin" />
            Loading...
          </Button>
        ) : isAuthenticated ? (
          <Link href="/dashboard">
            <Button size="lg">Go to Dashboard</Button>
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="lg">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg">Sign up</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
