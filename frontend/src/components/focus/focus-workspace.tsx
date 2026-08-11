"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useFocusCycle } from "@/hooks/use-focus-cycle"
import { useFocusStrictMode } from "@/hooks/use-focus-strict-mode"
import { useFocusMusic } from "@/hooks/use-focus-music"
import { HeroTimer } from "./hero-timer"
import { FocusSessionInfo } from "./focus-session-info"
import { SessionProgress } from "./session-progress"
import { DeepFocusStatus } from "./deep-focus-status"
import { FocusTimeline, type TimelineEvent } from "./focus-timeline"
import { CompletionCelebration } from "./completion-celebration"
import { FocusMusicWidget } from "./focus-music-widget"
import { FocusQuotes } from "./focus-quotes"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { FocusSummaryDialog } from "./focus-summary-dialog"
import { Button } from "@/components/ui/button"
import { BadgeWork, BadgeBreak } from "@/components/design-system/premium-badge"
import { toast } from "sonner"
import { ShieldIcon, XCircleIcon } from "lucide-react"
import type { FocusSessionItem } from "@/types"

function formatTimeDisplay(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

const PHASE_LABELS: Record<string, string> = {
  WORK: "Work",
  SHORT_BREAK: "Short Break",
  LONG_BREAK: "Long Break",
}

interface FocusWorkspaceProps {
  session: FocusSessionItem
  startNewSession?: () => void
}

export function FocusWorkspace({ session, startNewSession }: FocusWorkspaceProps) {
  const router = useRouter()
  const [giveUpOpen, setGiveUpOpen] = useState(false)
  const [elapsed, setElapsed] = useState(session.elapsedMs)
  const timelineIdCounter = useRef(0)

  const {
    pomodoro,
    completedWorkCount,
    completedBreakCount,
    distractions,
    currentCycle,
    totalCycles,
    showSummary,
    summarySession,
    endedBy,
    incrementDistractions,
    endSessionGiveUp,
    endSessionStrict,
    dismissSummary,
    startPomodoroPending,
    endFocusPending,
  } = useFocusCycle(session, { startNewSession })

  const { handleStrictFail } = useFocusMusic(session)

  const handleViolation = useCallback(() => {
    toast.error("Focus session failed. You left the workspace.")
    handleStrictFail()
    endSessionStrict()
  }, [handleStrictFail, endSessionStrict])

  useFocusStrictMode(session, handleViolation, incrementDistractions)

  // Elapsed timer
  useEffect(() => {
    if (session.status !== "RUNNING") return
    const rafId = requestAnimationFrame(function tick() {
      const now = Date.now()
      const started = new Date(session.startedAt).getTime()
      setElapsed(now - started)
      requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(rafId)
  }, [session.startedAt, session.status])

  // Compute timer display
  const pomodoroRemaining = useMemo(() => {
    if (!pomodoro || pomodoro.status !== "RUNNING") return null
    const endMs = new Date(pomodoro.startedAt).getTime() + pomodoro.plannedMinutes * 60 * 1000 + pomodoro.accumulatedPausedMs
    return Math.max(0, endMs - Date.now())
  }, [pomodoro])

  const timerDisplay = useMemo(() => {
    if (pomodoroRemaining !== null) return formatTimeDisplay(pomodoroRemaining)
    const focusPlanned = session.plannedMinutes * 60 * 1000
    const remaining = Math.max(0, focusPlanned - elapsed)
    return formatTimeDisplay(remaining)
  }, [pomodoroRemaining, elapsed, session.plannedMinutes])

  const timerPercent = useMemo(() => {
    if (pomodoro && pomodoroRemaining !== null) {
      const totalMs = pomodoro.plannedMinutes * 60 * 1000
      return Math.min(100, Math.round(((totalMs - pomodoroRemaining) / totalMs) * 100))
    }
    const focusPlanned = session.plannedMinutes * 60 * 1000
    return Math.min(100, Math.round((elapsed / focusPlanned) * 100))
  }, [pomodoro, pomodoroRemaining, elapsed, session.plannedMinutes])

  const isRunning = session.status === "RUNNING" && pomodoro?.status === "RUNNING"
  const isPreparing = !pomodoro || (pomodoro.status !== "RUNNING" && pomodoro.status !== "PAUSED")
  const currentPhase = PHASE_LABELS[pomodoro?.type ?? "WORK"] ?? "Preparing..."

  // Build timeline events
  const [timelineEvents] = useState<TimelineEvent[]>(() => [
    {
      id: String(timelineIdCounter.current++),
      type: "session_start",
      label: "Started Focus Session",
      detail: session.goal ? `"${session.goal}"` : `${session.plannedMinutes}min session`,
      timestamp: new Date(session.startedAt),
    },
  ])

  const handleGiveUp = useCallback(() => {
    endSessionGiveUp()
    setGiveUpOpen(false)
  }, [endSessionGiveUp])

  const isBusy = startPomodoroPending || endFocusPending

  // Session completed - show completion screen
  if (endedBy && (endedBy === "natural" || endedBy === "giveup" || endedBy === "strict")) {
    return (
      <div className="flex flex-col items-center py-4">
        <CompletionCelebration
          completedWorkCount={completedWorkCount}
          completedBreakCount={completedBreakCount}
          distractions={distractions}
          elapsedMs={elapsed}
          endedBy={endedBy}
          goal={session.goal}
          strictMode={session.strictModeEnabled}
          onStartAgain={startNewSession}
          onGoHome={() => router.push("/dashboard")}
        />
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-6 lg:gap-8">
        {/* 3-Column Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          {/* Left Column: Session Info + Progress */}
          <div className="lg:col-span-1 space-y-4 order-2 lg:order-1">
            <FocusSessionInfo session={session} />
            <SessionProgress
              session={session}
              completedWorkCount={completedWorkCount}
              completedBreakCount={completedBreakCount}
              distractions={distractions}
              currentCycle={currentCycle}
              totalCycles={totalCycles}
              elapsed={elapsed}
            />
          </div>

          {/* Center Column: Hero Timer + Status + Controls */}
          <div className="lg:col-span-3 flex flex-col items-center gap-6 order-1 lg:order-2">
            {/* Deep Focus Status */}
            <DeepFocusStatus
              status={isPreparing ? "WORKING" : pomodoro?.type === "WORK" ? "WORKING" : "BREAK"}
              phase={currentPhase}
              goal={session.goal}
            />

            {/* Hero Timer */}
            <div className="flex flex-col items-center gap-4">
              <HeroTimer
                value={timerPercent}
                timeDisplay={timerDisplay}
                isRunning={isRunning}
                size={320}
                strokeWidth={8}
              />

              {/* Phase badge */}
              <div className="flex items-center gap-2">
                {session.strictModeEnabled && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Strict Mode
                    <ShieldIcon size={10} />
                  </span>
                )}
                {isPreparing || pomodoro?.type === "WORK" ? (
                  <BadgeWork className="px-2.5 py-1">{currentPhase}</BadgeWork>
                ) : (
                  <BadgeBreak className="px-2.5 py-1">{currentPhase}</BadgeBreak>
                )}
                <span className="text-xs text-muted-foreground/50 tabular-nums">
                  {currentCycle}/{totalCycles} cycles
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={() => setGiveUpOpen(true)}
                  disabled={isBusy}
                  className="gap-2"
                >
                  End Session
                  <XCircleIcon size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Music + Quotes */}
          <div className="lg:col-span-1 space-y-4 order-3">
            <div className="lg:sticky lg:top-4 space-y-4">
              <FocusMusicWidget />
              <FocusQuotes />
            </div>
          </div>
        </div>

        {/* Bottom: Timeline */}
        <div className="max-w-2xl mx-auto w-full">
          <FocusTimeline events={timelineEvents} />
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={giveUpOpen}
        onOpenChange={setGiveUpOpen}
        title="End Session?"
        description="Are you sure you want to end this focus session? Your progress will be saved."
        confirmLabel="End Session"
        cancelLabel="Keep Going"
        onConfirm={handleGiveUp}
        isLoading={endFocusPending}
      />

      <FocusSummaryDialog
        open={showSummary}
        onOpenChange={dismissSummary}
        session={summarySession}
        completedWorkCount={completedWorkCount}
        completedBreakCount={completedBreakCount}
        distractions={distractions}
        endedBy={endedBy}
        startNewSession={startNewSession}
      />
    </>
  )
}
