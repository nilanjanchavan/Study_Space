"use client"

import { SettingsSection, SettingRow } from "./settings-section"
import { useNotificationSettings } from "@/hooks/use-settings"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const NOTIFICATION_SOUNDS = [
  { label: "Notification", value: "notification" },
  { label: "Bell", value: "bell" },
  { label: "Forest", value: "forest" },
  { label: "Digital", value: "digital" },
]

export function NotificationSettings() {
  const [settings, updateSettings] = useNotificationSettings()

  return (
    <SettingsSection
      title="Notifications"
      description="Control how you receive alerts."
    >
      <SettingRow
        label="Browser Notifications"
        description="Show desktop notifications for timers."
      >
        <Switch
          checked={settings.browserNotifications}
          onCheckedChange={(v) => updateSettings({ browserNotifications: v })}
        />
      </SettingRow>

      <SettingRow
        label="Sound"
        description="Play sounds for timer events."
      >
        <Switch
          checked={settings.soundEnabled}
          onCheckedChange={(v) => updateSettings({ soundEnabled: v })}
        />
      </SettingRow>

      <SettingRow label="Volume" description="Adjust the playback volume">
        <div className="flex items-center gap-2 min-w-0">
          <Input
            type="range"
            min={0}
            max={100}
            value={settings.volume}
            onChange={(e) => updateSettings({ volume: Number(e.target.value) })}
            className="w-20 sm:w-24 h-8"
          />
          <span className="text-xs text-muted-foreground w-7 sm:w-8 text-right tabular-nums shrink-0">
            {settings.volume}%
          </span>
        </div>
      </SettingRow>

      <SettingRow label="Notification Sound" description="Choose the sound played for alerts">
        <Select
          value={settings.notificationSound ?? undefined}
          onValueChange={(v) => updateSettings({ notificationSound: v ?? "notification" })}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NOTIFICATION_SOUNDS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>
    </SettingsSection>
  )
}
