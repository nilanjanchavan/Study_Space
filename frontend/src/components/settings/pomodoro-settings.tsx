"use client"

import { SettingsSection } from "./settings-section"
import { usePomodoroSettings } from "@/hooks/use-settings"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function PomodoroSettings() {
  const [settings, updateSettings] = usePomodoroSettings()

  return (
    <SettingsSection
      title="Pomodoro"
      description="Configure your focus and break intervals."
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="work-minutes">Work Duration (min)</Label>
          <Input
            id="work-minutes"
            type="number"
            min={1}
            max={180}
            value={settings.workMinutes}
            onChange={(e) => updateSettings({ workMinutes: Number(e.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="short-break">Short Break (min)</Label>
          <Input
            id="short-break"
            type="number"
            min={1}
            max={60}
            value={settings.shortBreakMinutes}
            onChange={(e) => updateSettings({ shortBreakMinutes: Number(e.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="long-break">Long Break (min)</Label>
          <Input
            id="long-break"
            type="number"
            min={1}
            max={120}
            value={settings.longBreakMinutes}
            onChange={(e) => updateSettings({ longBreakMinutes: Number(e.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="long-interval">Long Break After</Label>
          <Input
            id="long-interval"
            type="number"
            min={1}
            max={10}
            value={settings.longBreakInterval}
            onChange={(e) => updateSettings({ longBreakInterval: Number(e.target.value) })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="daily-goal">Daily Goal</Label>
          <Input
            id="daily-goal"
            type="number"
            min={1}
            max={20}
            value={settings.dailyGoal}
            onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Auto-start Work</p>
          <p className="text-xs text-muted-foreground">Automatically start work after a break.</p>
        </div>
        <Switch
          checked={settings.autoStartWork}
          onCheckedChange={(v) => updateSettings({ autoStartWork: v })}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Auto-start Breaks</p>
          <p className="text-xs text-muted-foreground">Automatically start breaks after work.</p>
        </div>
        <Switch
          checked={settings.autoStartBreaks}
          onCheckedChange={(v) => updateSettings({ autoStartBreaks: v })}
        />
      </div>
    </SettingsSection>
  )
}
