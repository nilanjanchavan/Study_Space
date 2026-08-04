import type { PomodoroType } from "@/types"
import type { PomodoroSettings } from "@/lib/pomodoro-settings"

const STORAGE_KEY = "pomodoro-cycle-state"
const STORAGE_DATE_KEY = "pomodoro-cycle-date"

interface StandaloneCycleState {
  completedWorkInCycle: number
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function loadCycleState(): StandaloneCycleState {
  if (typeof window === "undefined") return { completedWorkInCycle: 0 }
  try {
    const date = localStorage.getItem(STORAGE_DATE_KEY)
    if (date !== todayKey()) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_DATE_KEY)
      return { completedWorkInCycle: 0 }
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { completedWorkInCycle: 0 }
    const parsed: Record<string, unknown> = JSON.parse(raw)
    return {
      completedWorkInCycle: typeof parsed.completedWorkInCycle === "number" ? parsed.completedWorkInCycle : 0,
    }
  } catch {
    return { completedWorkInCycle: 0 }
  }
}

export function saveCycleState(state: StandaloneCycleState): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_DATE_KEY, todayKey())
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* quota exceeded — ignore */ }
}

export function resetCycleState(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(STORAGE_DATE_KEY)
}

export function incrementWorkInCycle(): StandaloneCycleState {
  const current = loadCycleState()
  const next = { completedWorkInCycle: current.completedWorkInCycle + 1 }
  saveCycleState(next)
  return next
}

export function getNextPomodoroType(
  completedType: PomodoroType,
  settings: PomodoroSettings,
  cycleState?: StandaloneCycleState,
): PomodoroType {
  const state = cycleState ?? loadCycleState()
  const interval = settings.longBreakInterval
  if (completedType === "WORK") {
    if (state.completedWorkInCycle > 0 && state.completedWorkInCycle % interval === 0) {
      return "LONG_BREAK"
    }
    return "SHORT_BREAK"
  }
  return "WORK"
}
