const STORAGE_KEY = "pomodoro-settings"

export interface PomodoroSettings {
  workMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  longBreakInterval: number
  autoStartBreaks: boolean
  autoStartWork: boolean
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartWork: false,
}

export function loadPomodoroSettings(): PomodoroSettings {
  if (typeof window === "undefined") return DEFAULT_POMODORO_SETTINGS
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return DEFAULT_POMODORO_SETTINGS
  try {
    const parsed = JSON.parse(raw) as Partial<PomodoroSettings>
    return {
      workMinutes: clamp(parsed.workMinutes ?? DEFAULT_POMODORO_SETTINGS.workMinutes, 1, 180),
      shortBreakMinutes: clamp(parsed.shortBreakMinutes ?? DEFAULT_POMODORO_SETTINGS.shortBreakMinutes, 1, 60),
      longBreakMinutes: clamp(parsed.longBreakMinutes ?? DEFAULT_POMODORO_SETTINGS.longBreakMinutes, 1, 120),
      longBreakInterval: clamp(parsed.longBreakInterval ?? DEFAULT_POMODORO_SETTINGS.longBreakInterval, 1, 10),
      autoStartBreaks: parsed.autoStartBreaks ?? DEFAULT_POMODORO_SETTINGS.autoStartBreaks,
      autoStartWork: parsed.autoStartWork ?? DEFAULT_POMODORO_SETTINGS.autoStartWork,
    }
  } catch {
    return DEFAULT_POMODORO_SETTINGS
  }
}

export function savePomodoroSettings(settings: PomodoroSettings): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch { /* quota exceeded — ignore */ }
}

export function getDurationForType(
  settings: PomodoroSettings,
  type: string
): number {
  switch (type) {
    case "WORK":
      return settings.workMinutes
    case "SHORT_BREAK":
      return settings.shortBreakMinutes
    case "LONG_BREAK":
      return settings.longBreakMinutes
    default:
      return settings.workMinutes
  }
}

function clamp(value: number, min: number, max: number): number {
  if (typeof value !== "number" || isNaN(value)) return min
  return Math.max(min, Math.min(max, Math.round(value)))
}
