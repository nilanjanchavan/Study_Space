"use client"

import { SettingsSection, SettingRow } from "./settings-section"
import { usePomodoroSettings } from "@/hooks/use-settings"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function PomodoroSettings() {
  const [settings, updateSettings] = usePomodoroSettings()

  return (
    <SettingsSection
      title="Pomodoro"
      description="Configure your focus and break intervals"
    >
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {[
          { id: "work-minutes", label: "Work", key: "workMinutes" as const, min: 1, max: 180 },
          { id: "short-break", label: "Short Break", key: "shortBreakMinutes" as const, min: 1, max: 60 },
          { id: "long-break", label: "Long Break", key: "longBreakMinutes" as const, min: 1, max: 120 },
          { id: "long-interval", label: "After (pomodoros)", key: "longBreakInterval" as const, min: 1, max: 10 },
          { id: "daily-goal", label: "Daily Goal", key: "dailyGoal" as const, min: 1, max: 20 },
        ].map((field) => (
          <div key={field.id} className="flex flex-col gap-1.5 min-w-0 rounded-lg border border-border/50 bg-card/50 px-2.5 py-2 dark:bg-white/[0.03]">
            <Label htmlFor={field.id} className="text-xs truncate">{field.label}</Label>
            <Input
              id={field.id}
              type="number"
              min={field.min}
              max={field.max}
              value={settings[field.key]}
              onChange={(e) => updateSettings({ [field.key]: Number(e.target.value) })}
            />
          </div>
        ))}
      </div>

      <SettingRow
        label="Auto-start Work"
        description="Start work after a break"
      >
        <Switch
          checked={settings.autoStartWork}
          onCheckedChange={(v) => updateSettings({ autoStartWork: v })}
        />
      </SettingRow>

      <SettingRow
        label="Auto-start Breaks"
        description="Start breaks after work"
      >
        <Switch
          checked={settings.autoStartBreaks}
          onCheckedChange={(v) => updateSettings({ autoStartBreaks: v })}
        />
      </SettingRow>
    </SettingsSection>
  )
}
