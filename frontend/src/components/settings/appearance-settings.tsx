"use client"

import { useTheme } from "next-themes"
import { SettingsSection, SettingRow } from "./settings-section"
import { useAppearanceSettings } from "@/hooks/use-settings"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const ACCENT_COLORS = [
  { name: "Blue", value: "blue", color: "bg-blue-500" },
  { name: "Violet", value: "violet", color: "bg-violet-500" },
  { name: "Emerald", value: "emerald", color: "bg-emerald-500" },
  { name: "Amber", value: "amber", color: "bg-amber-500" },
  { name: "Rose", value: "rose", color: "bg-rose-500" },
  { name: "Slate", value: "slate", color: "bg-slate-500" },
]

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [settings, updateSettings] = useAppearanceSettings()

  return (
    <SettingsSection
      title="Appearance"
      description="Customize how the application looks."
    >
      <SettingRow label="Theme">
        <Select
          value={theme ?? settings.theme}
          onValueChange={(v) => {
            setTheme(v as string)
            updateSettings({ theme: v as "system" | "light" | "dark" })
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow label="Accent Color" description="Select your preferred accent color.">
        <div className="flex items-center gap-2">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => updateSettings({ accentColor: c.value })}
              className={cn(
                "size-6 rounded-full border-2 transition-all",
                c.color,
                settings.accentColor === c.value
                  ? "border-foreground scale-110"
                  : "border-transparent hover:scale-105"
              )}
              title={c.name}
            />
          ))}
        </div>
      </SettingRow>
    </SettingsSection>
  )
}
