"use client"

import { useCallback } from "react"
import { useCurrentFocus } from "@/hooks/use-focus"
import { StartFocusForm } from "./start-focus-form"
import { ActiveFocusView } from "./active-focus-view"
import { PageHeader } from "@/components/common/page-header"
import { LoadingSpinner } from "@/components/common/loading-spinner"
import { CrosshairIcon } from "lucide-react"

export function FocusView() {
  const { data, isLoading } = useCurrentFocus()

  const session = data?.data.session ?? null
  const hasActiveSession = session && (session.status === "RUNNING" || session.status === "PAUSED")

  const handleStartNewSession = useCallback(() => {
    // Focus session already ended — query invalidation will show start form
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <LoadingSpinner size={24} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Deep Focus"
        description="Immersive focus sessions with automatic pomodoro cycles."
      />

      {hasActiveSession ? (
        <div className="flex flex-col items-center py-4">
          <ActiveFocusView session={session!} startNewSession={handleStartNewSession} />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 py-4">
          <CrosshairIcon size={40} className="text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Start a deep focus session to begin tracking your work.</p>
          <StartFocusForm />
        </div>
      )}
    </div>
  )
}
