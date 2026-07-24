"use client"

import { SettingsSection, SettingRow } from "./settings-section"
import { useMusicSettings } from "@/hooks/use-settings"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const AMBIENT_TRACKS = [
  { label: "None", value: "none" },
  { label: "Lo-Fi", value: "lofi" },
  { label: "Nature", value: "nature" },
  { label: "White Noise", value: "white_noise" },
  { label: "Custom", value: "custom" },
]

export function MusicSettings() {
  const [settings, updateSettings] = useMusicSettings()

  return (
    <SettingsSection
      title="Music"
      description="Configure ambient music playback."
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="default-track">Default Ambient Track</Label>
        <Select
          value={settings.defaultTrack ?? undefined}
          onValueChange={(v) => updateSettings({ defaultTrack: v ?? "none" })}
        >
          <SelectTrigger className="w-full max-w-[240px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {AMBIENT_TRACKS.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <SettingRow
        label="Auto-play During Work"
        description="Start ambient music when a work session begins."
      >
        <Switch
          checked={settings.autoPlayDuringWork}
          onCheckedChange={(v) => updateSettings({ autoPlayDuringWork: v })}
        />
      </SettingRow>

      <SettingRow
        label="Auto-stop During Breaks"
        description="Pause music when a break starts."
      >
        <Switch
          checked={settings.autoStopDuringBreaks}
          onCheckedChange={(v) => updateSettings({ autoStopDuringBreaks: v })}
        />
      </SettingRow>

      <SettingRow label="Volume">
        <div className="flex items-center gap-2">
          <Input
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
            className="w-24 h-8"
          />
          <span className="text-xs text-muted-foreground w-8 text-right tabular-nums">
            {settings.volume}%
          </span>
        </div>
      </SettingRow>
    </SettingsSection>
  )
}
