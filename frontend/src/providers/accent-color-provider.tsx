"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { useAppearanceSettings } from "@/hooks/use-settings"
import { applyAccentColor, removeAccentColor, type AccentColorName } from "@/lib/accent-colors"

const VALID_COLORS = new Set<string>(["blue", "violet", "emerald", "amber", "rose", "slate"])

export function AccentColorProvider({ children }: { children: React.ReactNode }) {
  const [settings] = useAppearanceSettings()
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const color = settings.accentColor
    if (!VALID_COLORS.has(color)) {
      removeAccentColor()
      return
    }
    applyAccentColor(color as AccentColorName, resolvedTheme === "dark")
  }, [settings.accentColor, resolvedTheme])

  return <>{children}</>
}
