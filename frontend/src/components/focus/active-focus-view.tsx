"use client"

import { useState, useEffect } from "react"
import { useFocusCycle } from "@/hooks/use-focus-cycle"
import { useFocusStrictMode } from "@/hooks/use-focus-strict-mode"
import { TimerDisplay } from "@/components/pomodoro/timer-display"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { FocusSummaryDialog } from "./focus-summary-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/common/loading-spinner"
import { toast } from "sonner"
import {
  TargetIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeOffIcon,
  ShieldIcon,
  ZapIcon,
  XCircleIcon,
} from "lucide-react"
import type { FocusSessionItem } from "@/types"

function formatElapsed(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}m`
  }
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`
}

const PHASE_LABELS: Record<string, string> = {
  WORK: "Focus",
  SHORT_BREAK: "Short Break",
  LONG_BREAK: "Long Break",
}

interface ActiveFocusViewProps {
  session: FocusSessionItem
  startNewSession?: () => void
}

export function ActiveFocusView({ session, startNewSession }: ActiveFocusViewProps) {
  const [giveUpOpen, setGiveUpOpen] = useState(false)
  const [elapsed, setElapsed] = useState(session.elapsedMs)

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

  const handleViolation = () => {
    toast.error("Focus session failed. You left the workspace.")
    endSessionStrict()
  }

  useFocusStrictMode(session, handleViolation, incrementDistractions)

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

  const focusElapsed = Date.now() - new Date(session.startedAt).getTime()
  const focusPlanned = session.plannedMinutes * 60 * 1000
  const focusPercent = Math.min(100, Math.round((focusElapsed / focusPlanned) * 100))

  const handleGiveUp = () => {
    endSessionGiveUp()
    setGiveUpOpen(false)
  }

  const isBusy = startPomodoroPending || endFocusPending

  return (
    <>
      <div className="flex flex-col gap-6 max-w-lg w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TargetIcon size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Deep Focus</span>
          </div>
          <div className="flex items-center gap-2">
            {session.strictModeEnabled && (
              <Badge variant="default" className="text-xs gap-1">
                <ShieldIcon size={10} />
                Strict
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {PHASE_LABELS[pomodoro?.type ?? "WORK"] ?? "Focus"}
            </Badge>
          </div>
        </div>

        {session.goal && (
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <p className="text-sm font-medium text-foreground truncate">{session.goal}</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-4 py-2">
          {pomodoro ? (
            <TimerDisplay
              session={pomodoro}
              plannedMinutes={session.plannedMinutes}
              focusStartedAt={session.startedAt}
            />
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <LoadingSpinner size={16} />
              <span className="text-sm">Preparing next session...</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-1">
          <ClockIcon size={14} className="text-muted-foreground shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Session Progress</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {formatElapsed(elapsed)} / {session.plannedMinutes}m
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
                style={{ width: `${focusPercent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<CheckCircleIcon size={14} className="text-emerald-600 dark:text-emerald-400" />}
            label="Completed"
            value={String(completedWorkCount)}
          />
          <StatCard
            icon={<ZapIcon size={14} className="text-amber-600 dark:text-amber-400" />}
            label="Cycle"
            value={`${currentCycle} / ${totalCycles}`}
          />
          <StatCard
            icon={<EyeOffIcon size={14} />}
            label="Distractions"
            value={String(distractions)}
          />
          <StatCard
            icon={<XCircleIcon size={14} className="text-muted-foreground" />}
            label="Breaks"
            value={String(completedBreakCount)}
          />
        </div>

        <div className="flex items-center justify-center pt-2">
          <Button
            variant="destructive"
            size="lg"
            onClick={() => setGiveUpOpen(true)}
            disabled={isBusy}
          >
            Give Up
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={giveUpOpen}
        onOpenChange={setGiveUpOpen}
        title="Give Up?"
        description="Are you sure you want to end this focus session? Your progress will be saved."
        confirmLabel="Give Up"
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

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border bg-muted/20 px-3 py-2.5">
      <span className="text-muted-foreground">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[11px] text-muted-foreground leading-none">{label}</span>
        <span className="text-sm font-semibold tabular-nums mt-0.5">{value}</span>
      </div>
    </div>
  )
}
