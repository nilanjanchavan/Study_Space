"use client"

import { useState } from "react"
import { useStartFocus } from "@/hooks/use-focus"
import { useStartPomodoro } from "@/hooks/use-pomodoro"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { LoadingSpinner } from "@/components/common/loading-spinner"
import {
  loadPomodoroSettings,
  savePomodoroSettings,
  type PomodoroSettings,
} from "@/lib/pomodoro-settings"
import { toast } from "sonner"
import { PlayIcon, SettingsIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-sm w-full">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="goal">Goal</Label>
        <Input
          id="goal"
          placeholder="What are you working on?"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          maxLength={500}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="minutes">Duration (minutes)</Label>
        <Input
          id="minutes"
          type="number"
          min={1}
          max={720}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="strict">Strict mode</Label>
          <p className="text-xs text-muted-foreground">Leaving the tab will end the session</p>
        </div>
        <Switch
          id="strict"
          checked={strictMode}
          onCheckedChange={setStrictMode}
        />
      </div>

      <div className="rounded-lg border bg-muted/20">
        <button
          type="button"
          className="flex items-center justify-between w-full px-3 py-2.5 text-sm"
          onClick={() => setShowSettings(!showSettings)}
        >
          <div className="flex items-center gap-2">
            <SettingsIcon size={14} className="text-muted-foreground" />
            <span className="font-medium text-foreground">Pomodoro Settings</span>
          </div>
          {showSettings ? <ChevronUpIcon size={14} /> : <ChevronDownIcon size={14} />}
        </button>

        {showSettings && (
          <div className="flex flex-col gap-3 px-3 pb-3">
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
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="mt-1">
        {isPending ? <LoadingSpinner size={16} /> : <PlayIcon />}
        Start Deep Focus
      </Button>
    </form>
  )
}
