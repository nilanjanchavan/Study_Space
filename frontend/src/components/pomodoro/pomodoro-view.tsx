"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useCurrentPomodoro, useStartPomodoro, usePausePomodoro, useResumePomodoro, useCompletePomodoro, useCancelPomodoro, usePomodoroHistory } from "@/hooks/use-pomodoro"
import { useCompletionEffects } from "@/hooks/use-completion-effects"
import { startTitleTimer, stopTitleTimer } from "@/lib/page-title"
import {
  loadPomodoroSettings,
  savePomodoroSettings,
  getDurationForType,
  type PomodoroSettings,
} from "@/lib/pomodoro-settings"
import { TimerDisplay } from "./timer-display"
import { TimerControls } from "./timer-controls"
import { PageHeader } from "@/components/common/page-header"
import { LoadingSpinner } from "@/components/common/loading-spinner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { TimerIcon, SettingsIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import type { PomodoroType, PomodoroSessionItem } from "@/types"

const MODE_LABELS: Record<string, string> = {
  WORK: "Work",
  SHORT_BREAK: "Short Break",
  LONG_BREAK: "Long Break",
}

const DAILY_GOAL = 8

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

  useCompletionEffects(session)

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

  const autoCycle = useCallback(
    (completedType: string) => {
      const s = loadPomodoroSettings()
      const nextType =
        completedType === "WORK"
          ? s.autoStartBreaks
            ? ("SHORT_BREAK" as PomodoroType)
            : null
          : s.autoStartWork
            ? ("WORK" as PomodoroType)
            : null
      if (nextType) {
        startPomodoro.mutate(
          { type: nextType, durationMinutes: getDurationForType(s, nextType) },
          {
            onSuccess: () => toast.success(`${MODE_LABELS[nextType]} started automatically`),
            onError: handleError,
          }
        )
      }
    },
    [startPomodoro]
  )

  useEffect(() => {
    if (!session) return
    const prev = prevStatusRef.current
    prevStatusRef.current = session.status
    if (prev === "RUNNING" && session.status === "COMPLETED" && completedIdRef.current !== session.id) {
      completedIdRef.current = session.id
      autoCycle(session.type)
    }
  }, [session, autoCycle])

  const handleModeChange = (newMode: PomodoroType) => {
    setMode(newMode)
  }

  const isIdle = !session || session.status === "COMPLETED" || session.status === "CANCELLED" || session.status === "ABANDONED"
  const displayStatus = isIdle ? "IDLE" : session.status
  const displayMode = isIdle ? mode : session.type
  const displayMinutes = isIdle ? getDurationForType(settings, mode) : session.plannedMinutes
  const completedType = isIdle && session?.status === "COMPLETED" ? session.type : null

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

  const handleComplete = () => {
    completePomodoro.mutate(undefined, { onError: handleError })
  }

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
        <LoadingSpinner size={24} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Pomodoro"
        description="Focus timer with work and break intervals."
      />

      <div className="flex flex-col items-center gap-6 py-4">
        <Badge variant="secondary" className="text-xs font-medium px-3 py-1">
          {MODE_LABELS[displayMode]}
        </Badge>

        <TimerDisplay session={session} plannedMinutes={displayMinutes} />

        <div className="flex flex-col items-center gap-2">
          {displayStatus === "RUNNING" && (
            <p className="text-sm text-muted-foreground">Focus time — stay on task</p>
          )}
          {displayStatus === "PAUSED" && (
            <p className="text-sm text-muted-foreground">Paused — resume when ready</p>
          )}
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

        {isIdle && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">Duration:</span>
            {(["WORK", "SHORT_BREAK", "LONG_BREAK"] as const).map((m) => (
              <Button
                key={m}
                variant={mode === m ? "default" : "outline"}
                size="sm"
                onClick={() => handleModeChange(m)}
              >
                {getDurationForType(settings, m)}m
              </Button>
            ))}
          </div>
        )}

        {isIdle && (
          <div className="w-full max-w-sm rounded-lg border bg-muted/20">
            <button
              type="button"
              className="flex items-center justify-between w-full px-3 py-2.5 text-sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <div className="flex items-center gap-2">
                <SettingsIcon size={14} className="text-muted-foreground" />
                <span className="font-medium text-foreground">Settings</span>
              </div>
              {showSettings ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
            </button>

            {showSettings && (
              <div className="flex flex-col gap-3 px-3 pb-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
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
                  <div className="flex flex-col gap-1">
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
                  <div className="flex flex-col gap-1">
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
                  <div className="flex flex-col gap-1">
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

                <div className="flex items-center justify-between">
                  <Label htmlFor="pv-autoBreaks" className="text-xs">Auto-start breaks</Label>
                  <Switch
                    id="pv-autoBreaks"
                    checked={settings.autoStartBreaks}
                    onCheckedChange={(v) => updateSetting("autoStartBreaks", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pv-autoWork" className="text-xs">Auto-start work</Label>
                  <Switch
                    id="pv-autoWork"
                    checked={settings.autoStartWork}
                    onCheckedChange={(v) => updateSetting("autoStartWork", v)}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <DailyProgress />
    </div>
  )
}

function DailyProgress() {
  const { data } = usePomodoroHistory({ status: "COMPLETED", limit: 50 })
  const sessions = data?.data.sessions ?? []

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayMs = todayStart.getTime()

  const todayCount = sessions.filter(
    (s) => new Date(s.createdAt).getTime() >= todayMs
  ).length

  const percent = Math.min(100, Math.round((todayCount / DAILY_GOAL) * 100))

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 px-5 py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Today&apos;s Progress</span>
        <span className="text-sm text-muted-foreground">
          <TimerIcon size={13} className="inline-block mr-1 -mt-0.5" />
          {todayCount} / {DAILY_GOAL} Pomodoros
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
