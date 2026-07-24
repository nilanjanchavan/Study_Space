const STORAGE_PREFIX = "focus-cycle-"

export interface FocusCycleState {
  completedWorkCount: number
  completedBreakCount: number
  distractions: number
  endedBy: "natural" | "giveup" | "strict" | null
}

export function saveFocusCycleState(focusId: string, state: FocusCycleState): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_PREFIX + focusId, JSON.stringify(state))
  } catch { /* quota exceeded — ignore */ }
}

export function loadFocusCycleState(focusId: string): FocusCycleState | null {
  if (typeof window === "undefined") return null
  const raw = localStorage.getItem(STORAGE_PREFIX + focusId)
  if (!raw) return null
  try {
    return JSON.parse(raw) as FocusCycleState
  } catch {
    return null
  }
}

export function clearFocusCycleState(focusId: string): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_PREFIX + focusId)
}

export function getNextPomodoroType(
  completedType: string,
  completedWorkCount: number,
  longBreakInterval: number = 4
): "WORK" | "SHORT_BREAK" | "LONG_BREAK" {
  if (completedType === "WORK") {
    if (completedWorkCount > 0 && completedWorkCount % longBreakInterval === 0) {
      return "LONG_BREAK"
    }
    return "SHORT_BREAK"
  }
  return "WORK"
}
