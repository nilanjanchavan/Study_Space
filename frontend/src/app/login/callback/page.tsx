"use client"

import { useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import api, { setAccessToken, setRefreshToken } from "@/lib/api"
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"

function GoogleCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()

  useEffect(() => {
    const token = searchParams.get("token")
    const refreshToken = searchParams.get("refreshToken")
    const error = searchParams.get("error")

    if (error) {
      if (error === "GOOGLE_NOT_CONFIGURED") {
        toast.error("Google Sign-In is not configured", {
          description: "Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the server .env file.",
          duration: 6000,
        })
      } else {
        toast.error("Google login failed", {
          description: error.replace(/_/g, " "),
        })
      }
      router.replace("/login")
      return
    }

    if (token) {
      try {
        setAccessToken(token)
        if (refreshToken) {
          setRefreshToken(refreshToken)
        }
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] })
        toast.success("Signed in successfully with Google!")
        router.replace("/dashboard")
      } catch {
        toast.error("Failed to store authentication token.")
        router.replace("/login")
      }
    } else {
      router.replace("/login")
    }
  }, [searchParams, router, queryClient])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-soft ring-1 ring-primary/20 animate-pulse">
          <svg className="size-7" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Completing Google Sign In...</h2>
          <p className="text-xs text-muted-foreground mt-1">Authenticating and preparing your workspace</p>
        </div>
        <Loader2Icon size={18} className="animate-spin text-primary mt-1" />
      </div>
    </div>
  )
}

export default function GoogleCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2Icon size={24} className="animate-spin text-primary" />
        </div>
      }
    >
      <GoogleCallbackContent />
    </Suspense>
  )
}
