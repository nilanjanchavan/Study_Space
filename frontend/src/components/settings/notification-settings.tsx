"use client"

import { SettingsSection, SettingRow } from "./settings-section"
import { useNotificationSettings } from "@/hooks/use-settings"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Volume2Icon } from "lucide-react"

const NOTIFICATION_SOUNDS = [
  { label: "Notification", value: "notification" },
  { label: "Bell", value: "bell" },
  { label: "Digital", value: "digital" },
]

export function NotificationSettings() {
  const [settings, updateSettings] = useNotificationSettings()

  const playPreview = (soundName: string) => {
    const soundFile = soundName === "bell" ? "/sounds/bell.mp3" : soundName === "digital" ? "/sounds/digital.mp3" : "/sounds/notification.mp3"
    const audio = new Audio(soundFile)
    audio.volume = Math.max(0, Math.min(1, settings.volume / 100))
    audio.play().catch(() => {})
  }

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
        <div className="flex items-center gap-2">
          <Select
            value={settings.notificationSound ?? undefined}
            onValueChange={(v) => updateSettings({ notificationSound: v ?? "notification" })}
          >
            <SelectTrigger className="w-[140px] sm:w-[150px]">
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="size-9 p-0 shrink-0"
            title="Preview sound"
            onClick={() => playPreview(settings.notificationSound ?? "notification")}
          >
            <Volume2Icon size={14} />
          </Button>
        </div>
      </SettingRow>
    </SettingsSection>
  )
}
