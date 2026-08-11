"use client"

import { useState } from "react"
import { useStartFocus } from "@/hooks/use-focus"
import { useStartPomodoro } from "@/hooks/use-pomodoro"
import { GlassCard } from "@/components/design-system/glass-card"
import { FloatingCard } from "@/components/design-system/floating-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/design-system/skeleton"
import {
  loadPomodoroSettings,
  savePomodoroSettings,
  type PomodoroSettings,
} from "@/lib/pomodoro-settings"
import { toast } from "sonner"
import {
  PlayIcon,
  SettingsIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ShieldIcon,
  ClockIcon,
  TargetIcon,
} from "lucide-react"

interface StartFocusFormProps {
  onSuccess?: () => void
}

export function StartFocusForm({ onSuccess }: StartFocusFormProps) {
  const startFocus = useStartFocus()
  const startPomodoro = useStartPomodoro()
  const [goal, setGoal] = useState("")
  const [minutes, setMinutes] = useState(60)
  const [strictMode, setStrictMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState<PomodoroSettings>(loadPomodoroSettings)

  const isPending = startFocus.isPending || startPomodoro.isPending

  const updateSetting = <K extends keyof PomodoroSettings>(
    key: K,
    value: PomodoroSettings[K]
  ) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    savePomodoroSettings(next)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (minutes < 1) {
      toast.error("Duration must be at least 1 minute")
      return
    }
    startFocus.mutate(
      {
        mode: strictMode ? "STRICT" : "NORMAL",
        goal: goal.trim() || undefined,
        plannedMinutes: minutes,
      },
      {
        onSuccess: () => {
          startPomodoro.mutate(
            { type: "WORK", durationMinutes: Math.min(settings.workMinutes, minutes) },
            {
              onSuccess: () => {
                toast.success("Deep focus session started")
                onSuccess?.()
              },
              onError: async () => {
                toast.error("Failed to start pomodoro, ending focus session")
                const { focusApi } = await import("@/services/focus")
                await focusApi.end()
              },
            }
          )
        },
        onError: (err) => {
          const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message
          toast.error(msg || "Failed to start focus session")
        },
      }
    )
  }

  const estimatedPomodoros = Math.ceil(minutes / settings.workMinutes)

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500 mb-4">
          <TargetIcon size={28} />
        </div>
        <h2 className="text-heading text-foreground">Start Deep Focus</h2>
        <p className="text-sm text-muted-foreground">
          Set your goal and duration to begin a focused work session
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Goal */}
        <GlassCard className="p-5 space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="goal" className="text-xs font-medium">What are you working on?</Label>
            <Input
              id="goal"
              placeholder="e.g. Finish the design report"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              maxLength={500}
              className="text-base"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="minutes" className="text-xs font-medium">Duration (minutes)</Label>
            <Input
              id="minutes"
              type="number"
              min={1}
              max={720}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="text-base"
            />
          </div>
        </GlassCard>

        {/* Quick Duration Presets */}
        <div className="flex items-center gap-2">
          {[25, 45, 60, 90, 120].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMinutes(m)}
              className={`flex-1 h-9 rounded-lg border px-2 text-xs font-medium tabular-nums transition-all duration-150 ${
                minutes === m
                  ? "border-violet-500 bg-violet-500/10 text-violet-500"
                  : "border-border/50 bg-muted/20 text-muted-foreground hover:border-violet-300/60 hover:bg-muted/40 dark:hover:border-violet-400/40"
              }`}
            >
              {m}m
            </button>
          ))}
        </div>

        {/* Strict Mode */}
        <FloatingCard className="p-4" hover>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">Strict Mode</p>
                <p className="text-xs text-muted-foreground">Leaving the tab will end the session</p>
              </div>
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                <ShieldIcon size={18} />
              </div>
            </div>
            <Switch
              id="strict"
              checked={strictMode}
              onCheckedChange={setStrictMode}
            />
          </div>
        </FloatingCard>

        {/* Settings */}
        <GlassCard className="overflow-hidden">
          <button
            type="button"
            className="flex items-center justify-between w-full px-4 py-3 text-sm transition-colors hover:bg-muted/40"
            onClick={() => setShowSettings(!showSettings)}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">Pomodoro Settings</span>
              <span className="flex size-7 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500">
                <SettingsIcon size={14} />
              </span>
            </div>
            {showSettings ? <ChevronUpIcon size={14} className="text-muted-foreground" /> : <ChevronDownIcon size={14} className="text-muted-foreground" />}
          </button>

          {showSettings && (
            <div className="flex flex-col gap-3 px-4 pb-4 border-t border-border/30 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="workMinutes" className="text-xs">Work (min)</Label>
                  <Input
                    id="workMinutes"
                    type="number"
                    min={1}
                    max={180}
                    value={settings.workMinutes}
                    onChange={(e) => updateSetting("workMinutes", Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="shortBreak" className="text-xs">Short Break (min)</Label>
                  <Input
                    id="shortBreak"
                    type="number"
                    min={1}
                    max={60}
                    value={settings.shortBreakMinutes}
                    onChange={(e) => updateSetting("shortBreakMinutes", Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="longBreak" className="text-xs">Long Break (min)</Label>
                  <Input
                    id="longBreak"
                    type="number"
                    min={1}
                    max={120}
                    value={settings.longBreakMinutes}
                    onChange={(e) => updateSetting("longBreakMinutes", Number(e.target.value))}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="longBreakInterval" className="text-xs">Long Break After</Label>
                  <Input
                    id="longBreakInterval"
                    type="number"
                    min={1}
                    max={10}
                    value={settings.longBreakInterval}
                    onChange={(e) => updateSetting("longBreakInterval", Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoStartBreaks" className="text-xs">Auto-start breaks</Label>
                <Switch
                  id="autoStartBreaks"
                  checked={settings.autoStartBreaks}
                  onCheckedChange={(v) => updateSetting("autoStartBreaks", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="autoStartWork" className="text-xs">Auto-start work</Label>
                <Switch
                  id="autoStartWork"
                  checked={settings.autoStartWork}
                  onCheckedChange={(v) => updateSetting("autoStartWork", v)}
                />
              </div>
            </div>
          )}
        </GlassCard>

        {/* Summary */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
          <span className="flex items-center gap-1 tabular-nums">
            {minutes} minutes
            <ClockIcon size={12} />
          </span>
          <span className="tabular-nums">~{estimatedPomodoros} pomodoro{estimatedPomodoros !== 1 ? "s" : ""}</span>
          {strictMode && (
            <span className="flex items-center gap-1 text-amber-500/70">
              Strict
              <ShieldIcon size={12} />
            </span>
          )}
        </div>

        {/* Submit */}
        <Button type="submit" size="lg" disabled={isPending} className="w-full h-11 rounded-xl gap-2">
          {isPending ? "Starting..." : "Start Deep Focus"}
          {isPending ? <Spinner size={18} /> : <PlayIcon size={18} />}
        </Button>
      </form>
    </div>
  )
}
