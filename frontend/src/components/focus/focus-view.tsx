"use client"

import { useCallback } from "react"
import { useCurrentFocus } from "@/hooks/use-focus"
import { StartFocusForm } from "./start-focus-form"
import { ActiveFocusView } from "./active-focus-view"
import { Spinner } from "@/components/design-system/skeleton"

export function FocusView() {
  const { data, isLoading } = useCurrentFocus()

  const session = data?.data.session ?? null
  const hasActiveSession = session && (session.status === "RUNNING" || session.status === "PAUSED")

  const handleStartNewSession = useCallback(() => {
    // Focus session already ended — query invalidation will show start form
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-16">
        <Spinner size={24} />
      </div>
    )
  }

  if (hasActiveSession) {
    return (
      <div className="flex flex-col gap-6">
        <ActiveFocusView session={session!} startNewSession={handleStartNewSession} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full py-8">
      <StartFocusForm />
    </div>
  )
}
