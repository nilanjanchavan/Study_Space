// ───────────────────────────────────────────────────────────────────────────
// Accent Color Palette
//
// Maps accent color names (stored in localStorage) to oklch CSS variable
// values for light and dark themes.  Values follow the project's warm
// editorial scale (600 shade for light, 500/400 for dark) to ensure good
// contrast in both modes.
// ───────────────────────────────────────────────────────────────────────────

export type AccentColorName = "blue" | "violet" | "emerald" | "amber" | "rose" | "slate"

interface AccentPalette {
  light: {
    primary: string
    primaryForeground: string
    ring: string
    sidebarPrimary: string
    sidebarPrimaryForeground: string
  }
  dark: {
    primary: string
    primaryForeground: string
    ring: string
    sidebarPrimary: string
    sidebarPrimaryForeground: string
  }
}

// Oklch values from the warm scale defined in globals.css:
//   olive-600:  oklch(0.535 0.1 110)      olive-500:  oklch(0.63 0.105 110)
//   terracotta-600: oklch(0.535 0.12 45)  terracotta-500: oklch(0.63 0.125 45)
//   forest-600: oklch(0.52 0.11 160)      forest-500: oklch(0.615 0.115 160)
//   amber-600:  oklch(0.58 0.15 80)       amber-400:  oklch(0.76 0.14 80)
//   coral-600:  oklch(0.525 0.135 25)     coral-500:  oklch(0.62 0.14 25)
//   taupe-900:  oklch(0.3 0.014 70)       (neutral)

const PALETTE: Record<AccentColorName, AccentPalette> = {
  blue: {
    light: {
      primary: "oklch(0.535 0.1 110)",
      primaryForeground: "oklch(0.985 0.012 90)",
      ring: "oklch(0.535 0.1 110)",
      sidebarPrimary: "oklch(0.535 0.1 110)",
      sidebarPrimaryForeground: "oklch(0.985 0.012 90)",
    },
    dark: {
      primary: "oklch(0.63 0.105 110)",
      primaryForeground: "oklch(0.2 0.03 75)",
      ring: "oklch(0.63 0.105 110)",
      sidebarPrimary: "oklch(0.63 0.105 110)",
      sidebarPrimaryForeground: "oklch(0.2 0.03 75)",
    },
  },
  violet: {
    light: {
      primary: "oklch(0.535 0.12 45)",
      primaryForeground: "oklch(0.985 0.012 90)",
      ring: "oklch(0.535 0.12 45)",
      sidebarPrimary: "oklch(0.535 0.12 45)",
      sidebarPrimaryForeground: "oklch(0.985 0.012 90)",
    },
    dark: {
      primary: "oklch(0.63 0.125 45)",
      primaryForeground: "oklch(0.2 0.03 75)",
      ring: "oklch(0.63 0.125 45)",
      sidebarPrimary: "oklch(0.63 0.125 45)",
      sidebarPrimaryForeground: "oklch(0.2 0.03 75)",
    },
  },
  emerald: {
    light: {
      primary: "oklch(0.52 0.11 160)",
      primaryForeground: "oklch(0.985 0.012 90)",
      ring: "oklch(0.52 0.11 160)",
      sidebarPrimary: "oklch(0.52 0.11 160)",
      sidebarPrimaryForeground: "oklch(0.985 0.012 90)",
    },
    dark: {
      primary: "oklch(0.615 0.115 160)",
      primaryForeground: "oklch(0.2 0.03 75)",
      ring: "oklch(0.615 0.115 160)",
      sidebarPrimary: "oklch(0.615 0.115 160)",
      sidebarPrimaryForeground: "oklch(0.2 0.03 75)",
    },
  },
  amber: {
    light: {
      primary: "oklch(0.58 0.15 80)",
      primaryForeground: "oklch(0.2 0.03 75)",
      ring: "oklch(0.58 0.15 80)",
      sidebarPrimary: "oklch(0.58 0.15 80)",
      sidebarPrimaryForeground: "oklch(0.2 0.03 75)",
    },
    dark: {
      primary: "oklch(0.76 0.14 80)",
      primaryForeground: "oklch(0.2 0.03 75)",
      ring: "oklch(0.76 0.14 80)",
      sidebarPrimary: "oklch(0.76 0.14 80)",
      sidebarPrimaryForeground: "oklch(0.2 0.03 75)",
    },
  },
  rose: {
    light: {
      primary: "oklch(0.525 0.135 25)",
      primaryForeground: "oklch(0.985 0.012 90)",
      ring: "oklch(0.525 0.135 25)",
      sidebarPrimary: "oklch(0.525 0.135 25)",
      sidebarPrimaryForeground: "oklch(0.985 0.012 90)",
    },
    dark: {
      primary: "oklch(0.62 0.14 25)",
      primaryForeground: "oklch(0.2 0.03 75)",
      ring: "oklch(0.62 0.14 25)",
      sidebarPrimary: "oklch(0.62 0.14 25)",
      sidebarPrimaryForeground: "oklch(0.2 0.03 75)",
    },
  },
  slate: {
    light: {
      primary: "oklch(0.3 0.014 70)",
      primaryForeground: "oklch(0.985 0.012 90)",
      ring: "oklch(0.755 0.018 70)",
      sidebarPrimary: "oklch(0.3 0.014 70)",
      sidebarPrimaryForeground: "oklch(0.985 0.012 90)",
    },
    dark: {
      primary: "oklch(0.91 0.014 70)",
      primaryForeground: "oklch(0.24 0.012 70)",
      ring: "oklch(0.66 0.018 70)",
      sidebarPrimary: "oklch(0.46 0.02 70)",
      sidebarPrimaryForeground: "oklch(0.985 0.012 90)",
    },
  },
}

// ── CSS variable mapping ───────────────────────────────────────────────────

const CSS_VARS: Array<[keyof AccentPalette["light"], string]> = [
  ["primary", "--primary"],
  ["primaryForeground", "--primary-foreground"],
  ["ring", "--ring"],
  ["sidebarPrimary", "--sidebar-primary"],
  ["sidebarPrimaryForeground", "--sidebar-primary-foreground"],
]

// ── Apply / remove functions ───────────────────────────────────────────────

export function applyAccentColor(colorName: AccentColorName, isDark: boolean): void {
  if (typeof document === "undefined") return
  const palette = PALETTE[colorName]?.[isDark ? "dark" : "light"]
  if (!palette) return
  const root = document.documentElement
  for (const [key, cssVar] of CSS_VARS) {
    root.style.setProperty(cssVar, palette[key])
  }
}

export function removeAccentColor(): void {
  if (typeof document === "undefined") return
  const root = document.documentElement
  for (const [, cssVar] of CSS_VARS) {
    root.style.removeProperty(cssVar)
  }
}
