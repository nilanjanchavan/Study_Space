"use client"

import { SettingsSection, SettingRow } from "./settings-section"
import { useFocusSettings } from "@/hooks/use-settings"
import { Switch } from "@/components/ui/switch"

export function FocusSettings() {
  const [settings, updateSettings] = useFocusSettings()

  return (
    <SettingsSection
      title="Focus"
      description="Customize the deep focus experience."
    >
      <SettingRow
        label="Default Strict Mode"
        description="Enable strict mode by default for new focus sessions."
      >
        <Switch
          checked={settings.defaultStrictMode}
          onCheckedChange={(v) => updateSettings({ defaultStrictMode: v })}
        />
      </SettingRow>

      <SettingRow
        label="Motivational Quotes"
        description="Display motivational quotes during focus sessions."
      >
        <Switch
          checked={settings.motivationalQuotes}
          onCheckedChange={(v) => updateSettings({ motivationalQuotes: v })}
        />
      </SettingRow>

      <SettingRow
        label="Celebration Animation"
        description="Show a celebration effect when a focus session completes."
      >
        <Switch
          checked={settings.celebrationAnimation}
          onCheckedChange={(v) => updateSettings({ celebrationAnimation: v })}
        />
      </SettingRow>
    </SettingsSection>
  )
}
