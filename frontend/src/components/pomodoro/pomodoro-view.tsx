"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useCurrentPomodoro, useStartPomodoro, usePausePomodoro, useResumePomodoro, useCompletePomodoro, useCancelPomodoro, usePomodoroHistory } from "@/hooks/use-pomodoro"
import { useCompletionEffects } from "@/hooks/use-completion-effects"
import { usePomodoroMusic } from "@/hooks/use-pomodoro-music"
import { useStreakAnalytics } from "@/hooks/use-analytics"
import { startTitleTimer, stopTitleTimer } from "@/lib/page-title"
import { getDurationForType } from "@/lib/pomodoro-settings"
import {
  loadPomodoroSettings,
  savePomodoroSettings,
} from "@/lib/settings-storage"
import type { PomodoroSettings } from "@/lib/settings-storage"
import { getNextPomodoroType, incrementWorkInCycle, resetCycleState, loadCycleState } from "@/lib/pomodoro-cycle-state"
import { getQuoteForIndex, getQuoteIndex, advanceQuoteIndex } from "./session-quotes"
import { TimerDisplay } from "./timer-display"
import { TimerControls } from "./timer-controls"
import { SessionInfo } from "./session-info"
import { SessionHistory } from "./session-history"
import { Spinner } from "@/components/design-system/skeleton"
import { GlassCard } from "@/components/design-system/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { SettingsIcon, ChevronDownIcon, ChevronUpIcon, QuoteIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PomodoroType, PomodoroSessionItem } from "@/types"

const MODE_LABELS: Record<string, string> = {
  WORK: "Work",
  SHORT_BREAK: "Short Break",
  LONG_BREAK: "Long Break",
}

function handleError(err: unknown) {
  const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message
  toast.error(msg || "Something went wrong")
}

export function PomodoroView() {
  const { data, isLoading } = useCurrentPomodoro()
  const startPomodoro = useStartPomodoro()
  const pausePomodoro = usePausePomodoro()
  const resumePomodoro = useResumePomodoro()
  const completePomodoro = useCompletePomodoro()
  const cancelPomodoro = useCancelPomodoro()

  const session: PomodoroSessionItem | null = data?.data.session ?? null
  const [mode, setMode] = useState<PomodoroType>("WORK")
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<PomodoroSettings>(loadPomodoroSettings)
  const prevStatusRef = useRef(session?.status)
  const completedIdRef = useRef<string | null>(null)

  // Quote rotation - persists across sessions via localStorage
  const [quoteIndex, setQuoteIndex] = useState(getQuoteIndex)
  const [quote] = useState(() => getQuoteForIndex(quoteIndex))

  useCompletionEffects(session)
  usePomodoroMusic(session)

  // Session history for cycle tracking
  const { data: historyData } = usePomodoroHistory({ status: "COMPLETED", limit: 50 })
  const { data: streakData } = useStreakAnalytics()

  const allSessions = historyData?.data.sessions ?? []
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayMs = todayStart.getTime()
  const todayCount = allSessions.filter((s) => new Date(s.createdAt).getTime() >= todayMs).length

  const dailyGoal = settings.dailyGoal ?? 8
  const cycleState = loadCycleState()
  const currentCycle = cycleState.completedWorkInCycle % settings.longBreakInterval
  const streak = streakData?.data.currentStreak ?? 0

  const isIdle = !session || session.status === "COMPLETED" || session.status === "CANCELLED" || session.status === "ABANDONED"
  const displayStatus = isIdle ? "IDLE" : session.status
  const displayMode = isIdle ? mode : session.type
  const displayMinutes = isIdle ? getDurationForType(settings, mode) : session.plannedMinutes
  const completedType = isIdle && session?.status === "COMPLETED" ? session.type : null

  // Title timer
  useEffect(() => {
    if (!session || session.status === "COMPLETED" || session.status === "CANCELLED" || session.status === "ABANDONED") {
      stopTitleTimer()
      return
    }
    if (session.status === "RUNNING" || session.status === "PAUSED") {
      const cleanup = startTitleTimer(session)
      return cleanup
    }
  }, [session])

  // Auto-cycle after completion
  const autoCycle = useCallback(
    (completedType: PomodoroType) => {
      const s = loadPomodoroSettings()
      const nextType = getNextPomodoroType(completedType, s)
      const shouldAutoStart =
        (completedType === "WORK" && s.autoStartBreaks) ||
        (completedType !== "WORK" && s.autoStartWork)
      if (shouldAutoStart) {
        startPomodoro.mutate(
          { type: nextType, durationMinutes: getDurationForType(s, nextType) },
          {
            onSuccess: () => {
              toast.success(`${MODE_LABELS[nextType]} started automatically`)
            },
            onError: handleError,
          }
        )
      }
    },
    [startPomodoro]
  )

  // Detect completion and advance quote
  useEffect(() => {
    if (!session) return
    const prev = prevStatusRef.current
    const shouldTrigger = prev === "RUNNING" && session.status === "COMPLETED" && completedIdRef.current !== session.id
    prevStatusRef.current = session.status
    if (shouldTrigger) {
      completedIdRef.current = session.id
      advanceQuoteIndex()
      setQuoteIndex(getQuoteIndex())
      if (session.type === "WORK") {
        incrementWorkInCycle()
      } else if (session.type === "LONG_BREAK") {
        resetCycleState()
      }
      autoCycle(session.type as PomodoroType)
    }
  }, [session, autoCycle])

  const handleModeChange = (newMode: PomodoroType) => setMode(newMode)

  const handleStart = () => {
    startPomodoro.mutate(
      { type: mode, durationMinutes: getDurationForType(settings, mode) },
      {
        onSuccess: () => toast.success("Session started"),
        onError: handleError,
      }
    )
  }

  const handlePause = () => {
    pausePomodoro.mutate(undefined, {
      onSuccess: () => toast.success("Session paused"),
      onError: handleError,
    })
  }

  const handleResume = () => {
    resumePomodoro.mutate(undefined, {
      onSuccess: () => toast.success("Session resumed"),
      onError: handleError,
    })
  }

  const handleComplete = useCallback(async () => {
    if (!session) return
    const completedType = session.type as PomodoroType
    const completedId = session.id
    try {
      await completePomodoro.mutateAsync(undefined)
      completedIdRef.current = completedId
      autoCycle(completedType)
    } catch (err) {
      handleError(err)
    }
  }, [session, completePomodoro, autoCycle])

  const handleCancel = () => {
    cancelPomodoro.mutate(undefined, {
      onSuccess: () => toast.success("Session cancelled"),
      onError: handleError,
    })
  }

  const updateSetting = <K extends keyof PomodoroSettings>(key: K, value: PomodoroSettings[K]) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    savePomodoroSettings(next)
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner size={24} />
      </div>
    )
  }

  const isWorkMode = displayMode === "WORK"

  return (
    <div className="flex flex-col items-center gap-8 py-4">
      {/* Center: Timer */}
      <div className="flex flex-col items-center gap-5">
        <Badge
          variant="secondary"
          className={cn(
            "text-xs font-medium px-3 py-1 rounded-full",
            isWorkMode
              ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
              : "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
          )}
        >
          {MODE_LABELS[displayMode]}
        </Badge>

        <TimerDisplay session={session} plannedMinutes={displayMinutes} onFinished={handleComplete} />

        {/* Motivational quote */}
        <div className="flex items-center gap-2 max-w-xs text-center px-4">
          <QuoteIcon size={12} className="text-muted-foreground/40 shrink-0" />
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            &ldquo;{quote.text}&rdquo;
          </p>
        </div>

        <TimerControls
          status={displayStatus}
          completedType={completedType}
          isStarting={startPomodoro.isPending}
          isPausing={pausePomodoro.isPending}
          isResuming={resumePomodoro.isPending}
          isCompleting={completePomodoro.isPending}
          isCancelling={cancelPomodoro.isPending}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />

        {/* Mode selector (idle only) */}
        {isIdle && (
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
            <span className="text-xs text-muted-foreground shrink-0">Duration:</span>
            {(["WORK", "SHORT_BREAK", "LONG_BREAK"] as const).map((m) => (
              <Button
                key={m}
                variant={mode === m ? "default" : "outline"}
                size="sm"
                onClick={() => handleModeChange(m)}
                className="rounded-lg h-7 text-[11px] sm:text-xs px-2 sm:px-3"
              >
                {getDurationForType(settings, m)}m
              </Button>
            ))}
          </div>
        )}

        {/* Inline settings (idle only) */}
        {isIdle && (
          <GlassCard className="w-full max-w-sm overflow-hidden p-0">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <div className="flex items-center gap-2">
                <SettingsIcon size={14} className="text-muted-foreground" />
                <span className="font-medium text-foreground">Settings</span>
              </div>
              {showSettings ? <ChevronUpIcon size={14} className="text-muted-foreground shrink-0" /> : <ChevronDownIcon size={14} className="text-muted-foreground shrink-0" />}
            </button>

            {showSettings && (
              <div className="flex flex-col gap-3 border-t px-4 pb-4">
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="flex min-w-0 flex-col gap-1">
                    <Label htmlFor="pv-work" className="text-xs">Work (min)</Label>
                    <Input
                      id="pv-work"
                      type="number"
                      min={1}
                      max={180}
                      value={settings.workMinutes}
                      onChange={(e) => updateSetting("workMinutes", Number(e.target.value))}
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <Label htmlFor="pv-short" className="text-xs">Short Break (min)</Label>
                    <Input
                      id="pv-short"
                      type="number"
                      min={1}
                      max={60}
                      value={settings.shortBreakMinutes}
                      onChange={(e) => updateSetting("shortBreakMinutes", Number(e.target.value))}
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <Label htmlFor="pv-long" className="text-xs">Long Break (min)</Label>
                    <Input
                      id="pv-long"
                      type="number"
                      min={1}
                      max={120}
                      value={settings.longBreakMinutes}
                      onChange={(e) => updateSetting("longBreakMinutes", Number(e.target.value))}
                    />
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <Label htmlFor="pv-interval" className="text-xs">Long Break After</Label>
                    <Input
                      id="pv-interval"
                      type="number"
                      min={1}
                      max={10}
                      value={settings.longBreakInterval}
                      onChange={(e) => updateSetting("longBreakInterval", Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="pv-autoBreaks" className="text-xs shrink-0">Auto-start breaks</Label>
                  <Switch
                    id="pv-autoBreaks"
                    checked={settings.autoStartBreaks}
                    onCheckedChange={(v) => updateSetting("autoStartBreaks", v)}
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <Label htmlFor="pv-autoWork" className="text-xs shrink-0">Auto-start work</Label>
                  <Switch
                    id="pv-autoWork"
                    checked={settings.autoStartWork}
                    onCheckedChange={(v) => updateSetting("autoStartWork", v)}
                  />
                </div>
              </div>
            )}
          </GlassCard>
        )}
      </div>

      {/* Left: Session Info */}
      <div className="w-full max-w-sm">
        <SessionInfo
          todayCount={todayCount}
          dailyGoal={dailyGoal}
          currentCycle={currentCycle}
          longBreakInterval={settings.longBreakInterval}
          streak={streak}
          completedSessions={todayCount}
        />
      </div>

      {/* Bottom: Session History */}
      <div className="w-full max-w-lg">
        <SessionHistory />
      </div>
    </div>
  )
}
