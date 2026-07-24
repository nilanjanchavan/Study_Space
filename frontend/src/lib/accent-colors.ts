// ───────────────────────────────────────────────────────────────────────────
// Accent Color Palette
//
// Maps accent color names (stored in localStorage) to oklch CSS variable
// values for light and dark themes.  The palette is derived from
// Tailwind CSS v4's default color scale (600 shade for light, 500/400 for
// dark) to ensure good contrast in both modes.
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

// Oklch values sourced from Tailwind CSS v4 theme.css:
//   blue-600:  oklch(0.546 0.245 262.881)   blue-500:  oklch(0.623 0.214 259.815)
//   violet-600: oklch(0.541 0.281 293.009)  violet-500: oklch(0.606 0.25  292.717)
//   emerald-600: oklch(0.596 0.145 163.225) emerald-500: oklch(0.696 0.17  162.48)
//   amber-600: oklch(0.666 0.179 58.318)    amber-400:  oklch(0.828 0.189 84.429)
//   rose-600:  oklch(0.586 0.253 17.585)    rose-500:   oklch(0.645 0.246 16.439)
//   slate-500: oklch(0.554 0.046 257.417)   (neutral)

const PALETTE: Record<AccentColorName, AccentPalette> = {
  blue: {
    light: {
      primary: "oklch(0.546 0.245 262.881)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.546 0.245 262.881)",
      sidebarPrimary: "oklch(0.546 0.245 262.881)",
      sidebarPrimaryForeground: "oklch(0.985 0 0)",
    },
    dark: {
      primary: "oklch(0.623 0.214 259.815)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.623 0.214 259.815)",
      sidebarPrimary: "oklch(0.623 0.214 259.815)",
      sidebarPrimaryForeground: "oklch(0.145 0 0)",
    },
  },
  violet: {
    light: {
      primary: "oklch(0.541 0.281 293.009)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.541 0.281 293.009)",
      sidebarPrimary: "oklch(0.541 0.281 293.009)",
      sidebarPrimaryForeground: "oklch(0.985 0 0)",
    },
    dark: {
      primary: "oklch(0.606 0.25 292.717)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.606 0.25 292.717)",
      sidebarPrimary: "oklch(0.606 0.25 292.717)",
      sidebarPrimaryForeground: "oklch(0.145 0 0)",
    },
  },
  emerald: {
    light: {
      primary: "oklch(0.596 0.145 163.225)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.596 0.145 163.225)",
      sidebarPrimary: "oklch(0.596 0.145 163.225)",
      sidebarPrimaryForeground: "oklch(0.985 0 0)",
    },
    dark: {
      primary: "oklch(0.696 0.17 162.48)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.696 0.17 162.48)",
      sidebarPrimary: "oklch(0.696 0.17 162.48)",
      sidebarPrimaryForeground: "oklch(0.145 0 0)",
    },
  },
  amber: {
    light: {
      primary: "oklch(0.666 0.179 58.318)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.666 0.179 58.318)",
      sidebarPrimary: "oklch(0.666 0.179 58.318)",
      sidebarPrimaryForeground: "oklch(0.145 0 0)",
    },
    dark: {
      primary: "oklch(0.828 0.189 84.429)",
      primaryForeground: "oklch(0.145 0 0)",
      ring: "oklch(0.828 0.189 84.429)",
      sidebarPrimary: "oklch(0.828 0.189 84.429)",
      sidebarPrimaryForeground: "oklch(0.145 0 0)",
    },
  },
  rose: {
    light: {
      primary: "oklch(0.586 0.253 17.585)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.586 0.253 17.585)",
      sidebarPrimary: "oklch(0.586 0.253 17.585)",
      sidebarPrimaryForeground: "oklch(0.985 0 0)",
    },
    dark: {
      primary: "oklch(0.645 0.246 16.439)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.645 0.246 16.439)",
      sidebarPrimary: "oklch(0.645 0.246 16.439)",
      sidebarPrimaryForeground: "oklch(0.985 0 0)",
    },
  },
  slate: {
    light: {
      primary: "oklch(0.205 0 0)",
      primaryForeground: "oklch(0.985 0 0)",
      ring: "oklch(0.708 0 0)",
      sidebarPrimary: "oklch(0.205 0 0)",
      sidebarPrimaryForeground: "oklch(0.985 0 0)",
    },
    dark: {
      primary: "oklch(0.922 0 0)",
      primaryForeground: "oklch(0.205 0 0)",
      ring: "oklch(0.556 0 0)",
      sidebarPrimary: "oklch(0.488 0.243 264.376)",
      sidebarPrimaryForeground: "oklch(0.985 0 0)",
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
