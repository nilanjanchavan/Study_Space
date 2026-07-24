"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { FocusSessionItem } from "@/types"

interface FocusGuardProps {
  focusSession: FocusSessionItem | null
  children: React.ReactNode
}

export function FocusGuard({ focusSession, children }: FocusGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isActive = focusSession && (focusSession.status === "RUNNING" || focusSession.status === "PAUSED")

  useEffect(() => {
    if (isActive && pathname !== "/focus") {
      router.replace("/focus")
    }
  }, [isActive, pathname, router])

  if (isActive && pathname !== "/focus") {
    return null
  }

  return <>{children}</>
}
