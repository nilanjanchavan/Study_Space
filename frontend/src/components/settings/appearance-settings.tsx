"use client"

import { useTheme } from "next-themes"
import { SettingsSection, SettingRow } from "./settings-section"
import { useAppearanceSettings } from "@/hooks/use-settings"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { CheckIcon } from "lucide-react"

const ACCENT_COLORS = [
  { name: "Blue", value: "blue", color: "bg-blue-500", ring: "ring-blue-500/30" },
  { name: "Violet", value: "violet", color: "bg-violet-500", ring: "ring-violet-500/30" },
  { name: "Emerald", value: "emerald", color: "bg-emerald-500", ring: "ring-emerald-500/30" },
  { name: "Amber", value: "amber", color: "bg-amber-500", ring: "ring-amber-500/30" },
  { name: "Rose", value: "rose", color: "bg-rose-500", ring: "ring-rose-500/30" },
  { name: "Slate", value: "slate", color: "bg-slate-500", ring: "ring-slate-500/30" },
]

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [settings, updateSettings] = useAppearanceSettings()

  return (
    <SettingsSection
      title="Appearance"
      description="Customize how the application looks and feels"
    >
      <SettingRow label="Theme" description="Choose how the app appears on this device">
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

      <SettingRow label="Accent Color" description="Select your preferred accent color">
        <div className="flex flex-wrap items-center gap-2">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => updateSettings({ accentColor: c.value })}
              className={cn(
                "relative size-7 rounded-full transition-all duration-150",
                c.color,
                settings.accentColor === c.value
                  ? "ring-2 ring-offset-2 ring-offset-background scale-110 " + c.ring
                  : "hover:scale-105 opacity-70 hover:opacity-100"
              )}
              title={c.name}
            >
              {settings.accentColor === c.value && (
                <CheckIcon size={12} className="absolute inset-0 m-auto text-white" />
              )}
            </button>
          ))}
        </div>
      </SettingRow>
    </SettingsSection>
  )
}
