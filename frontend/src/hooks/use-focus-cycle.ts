"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useCurrentPomodoro, useStartPomodoro, useCompletePomodoro } from "@/hooks/use-pomodoro"
import { useEndFocus } from "@/hooks/use-focus"
import { showBrowserNotification, requestNotificationPermission } from "@/lib/notifications"
import {
  getAudioManager,
  COMPLETION_SOUNDS,
  FOCUS_EVENT_SOUNDS,
  type FocusSoundEvent,
} from "@/lib/audio-manager"
import { startTitleFlash, stopTitleFlash, restoreTitle, startTitleTimer } from "@/lib/page-title"
import {
  loadFocusCycleState,
  saveFocusCycleState,
  clearFocusCycleState,
  getNextPomodoroType,
  type FocusCycleState,
} from "@/lib/focus-cycle-state"
import { loadPomodoroSettings, getDurationForType } from "@/lib/pomodoro-settings"
import { toast } from "sonner"
import type { FocusSessionItem, PomodoroSessionItem } from "@/types"

const COMPLETION_MESSAGES: Record<string, { toastTitle: string; toastBody: string; title: string; body: string }> = {
  WORK: {
    toastTitle: "\uD83C\uDF45 Pomodoro Completed",
    toastBody: "Time for a short break.",
    title: "\uD83C\uDF45 Pomodoro Complete",
    body: "Great work! Time for a break.",
  },
  SHORT_BREAK: {
    toastTitle: "\u2615 Break Finished",
    toastBody: "Let\u2019s get back to work.",
    title: "\u2615 Break Complete",
    body: "Break finished. Time to focus again.",
  },
  LONG_BREAK: {
    toastTitle: "\uD83C\uDF34 Long Break Finished",
    toastBody: "Ready for another session?",
    title: "\uD83C\uDF34 Long Break Complete",
    body: "Ready for another productive session?",
  },
}

const FOCUS_NOTIFICATIONS: Record<string, { title: string; body: string }> = {
  WORK_END: {
    title: "\uD83C\uDF45 Pomodoro Complete",
    body: "Time for a break.",
  },
  SHORT_BREAK_END: {
    title: "\u2615 Break Over",
    body: "Let\u2019s get back to work.",
  },
  LONG_BREAK_END: {
    title: "\uD83C\uDF34 Long Break Over",
    body: "Ready for another session?",
  },
  FOCUS_COMPLETE: {
    title: "\uD83C\uDF89 Focus Session Complete!",
    body: "Great job! Your focus session has ended.",
  },
  FOCUS_ABANDON: {
    title: "Focus Session Ended",
    body: "Your focus session was ended early.",
  },
  STRICT_FAIL: {
    title: "\u26A0\uFE0F Focus Session Failed",
    body: "You left the workspace during strict mode.",
  },
}

export interface FocusCycleState2 {
  completedWorkCount: number
  completedBreakCount: number
  distractions: number
  endedBy: "natural" | "giveup" | "strict" | null
}

interface UseFocusCycleOptions {
  startNewSession?: () => void
}

function computePomodoroEndMs(pomodoro: PomodoroSessionItem): number {
  const startedMs = new Date(pomodoro.startedAt).getTime()
  return startedMs + pomodoro.plannedMinutes * 60 * 1000 + pomodoro.accumulatedPausedMs
}

function computeFocusElapsed(focusSession: FocusSessionItem): number {
  return Date.now() - new Date(focusSession.startedAt).getTime()
}

export function useFocusCycle(focusSession: FocusSessionItem | null, options?: UseFocusCycleOptions) {
  const { data: pomodoroData, isLoading: pomodoroLoading } = useCurrentPomodoro()
  const startPomodoro = useStartPomodoro()
  const completePomodoro = useCompletePomodoro()
  const endFocus = useEndFocus()

  const pomodoro: PomodoroSessionItem | null = pomodoroData?.data.session ?? null

  const prevPomodoroStatusRef = useRef(pomodoro?.status)
  const completedPomodoroIdRef = useRef<string | null>(null)
  const autoStartingRef = useRef(false)
  const completingRef = useRef(false)
  const pomodoroTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focusTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [cycleState, setCycleState] = useState<FocusCycleState>(() => {
    if (!focusSession) return { completedWorkCount: 0, completedBreakCount: 0, distractions: 0, endedBy: null }
    return loadFocusCycleState(focusSession.id) ?? { completedWorkCount: 0, completedBreakCount: 0, distractions: 0, endedBy: null }
  })

  const [showSummary, setShowSummary] = useState(false)
  const [summarySession, setSummarySession] = useState<FocusSessionItem | null>(null)

  const updateCycleState = useCallback((updater: (prev: FocusCycleState) => FocusCycleState) => {
    setCycleState((prev) => {
      const next = updater(prev)
      if (focusSession) {
        saveFocusCycleState(focusSession.id, next)
      }
      return next
    })
  }, [focusSession])

  const incrementDistractions = useCallback(() => {
    updateCycleState((prev) => ({ ...prev, distractions: prev.distractions + 1 }))
  }, [updateCycleState])

  const setEndedBy = useCallback((endedBy: "natural" | "giveup" | "strict") => {
    updateCycleState((prev) => ({ ...prev, endedBy }))
  }, [updateCycleState])

  const playSound = useCallback((event: FocusSoundEvent) => {
    const src = FOCUS_EVENT_SOUNDS[event]
    if (src) {
      getAudioManager().play(src)
    }
  }, [])

  const notify = useCallback((key: string, tag: string) => {
    const msg = FOCUS_NOTIFICATIONS[key]
    if (!msg) return
    if (document.visibilityState !== "visible") {
      showBrowserNotification(msg.title, msg.body, tag)
      startTitleFlash()
    }
  }, [])

  const endFocusSession = useCallback(
    (endedBy: "natural" | "giveup" | "strict") => {
      if (!focusSession || completingRef.current) return
      completingRef.current = true
      setEndedBy(endedBy)
      endFocus.mutate(undefined, {
        onSuccess: (res) => {
          setSummarySession(res.data.session)
          setShowSummary(true)
          clearFocusCycleState(focusSession.id)
        },
        onSettled: () => {
          completingRef.current = false
        },
      })
    },
    [focusSession, endFocus, setEndedBy]
  )

  useEffect(() => {
    if (!focusSession) return
    requestNotificationPermission()
    return () => {
      stopTitleFlash()
      restoreTitle()
    }
  }, [focusSession])

  useEffect(() => {
    if (!pomodoro || !focusSession) return
    if (focusSession.status !== "RUNNING" && focusSession.status !== "PAUSED") return

    if (pomodoro.status === "RUNNING" || pomodoro.status === "PAUSED") {
      const cleanup = startTitleTimer(pomodoro)
      return cleanup
    }
  }, [pomodoro, focusSession])

  useEffect(() => {
    if (!pomodoro || !focusSession) return
    if (autoStartingRef.current) return

    const prevStatus = prevPomodoroStatusRef.current
    prevPomodoroStatusRef.current = pomodoro.status

    if (
      prevStatus === "RUNNING" &&
      pomodoro.status === "COMPLETED" &&
      completedPomodoroIdRef.current !== pomodoro.id
    ) {
      completedPomodoroIdRef.current = pomodoro.id

      const msg = COMPLETION_MESSAGES[pomodoro.type]
      if (msg) {
        toast.success(msg.toastTitle, { description: msg.toastBody })
        const soundSrc = COMPLETION_SOUNDS[pomodoro.type]
        if (soundSrc) {
          getAudioManager().play(soundSrc)
        }
        if (document.visibilityState !== "visible") {
          showBrowserNotification(msg.title, msg.body, `pomodoro-${pomodoro.id}`)
          startTitleFlash()
        }
      }

      if (pomodoro.type === "WORK") {
        requestAnimationFrame(() => {
          updateCycleState((prev) => ({ ...prev, completedWorkCount: prev.completedWorkCount + 1 }))
        })
      } else {
        requestAnimationFrame(() => {
          updateCycleState((prev) => ({ ...prev, completedBreakCount: prev.completedBreakCount + 1 }))
        })
      }

      const focusElapsed = computeFocusElapsed(focusSession)
      const focusPlanned = focusSession.plannedMinutes * 60 * 1000

      if (focusElapsed >= focusPlanned) {
        playSound("FOCUS_COMPLETE")
        notify("FOCUS_COMPLETE", `focus-end-${focusSession.id}`)
        endFocusSession("natural")
        return
      }

      const settings = loadPomodoroSettings()
      const state = loadFocusCycleState(focusSession.id) ?? cycleState
      const nextType = getNextPomodoroType(
        pomodoro.type,
        state.completedWorkCount,
        settings.longBreakInterval
      )
      const focusRemainingMs = Math.max(0, focusSession.plannedMinutes * 60 * 1000 - computeFocusElapsed(focusSession))
      const desiredDuration = getDurationForType(settings, nextType)
      const clampedDuration = Math.min(desiredDuration, Math.max(1, Math.ceil(focusRemainingMs / 60000)))
      autoStartingRef.current = true
      startPomodoro.mutate(
        { type: nextType, durationMinutes: clampedDuration },
        {
          onSettled: () => {
            autoStartingRef.current = false
          },
        }
      )
    }
  }, [pomodoro, focusSession, cycleState, endFocus, startPomodoro, updateCycleState, setEndedBy, playSound, notify, endFocusSession])

  useEffect(() => {
    if (!pomodoro || !focusSession) return
    if (focusSession.status !== "RUNNING" && focusSession.status !== "PAUSED") return
    if (pomodoro.status !== "RUNNING") return

    const endMs = computePomodoroEndMs(pomodoro)
    const remaining = endMs - Date.now()

    if (remaining <= 0) {
      if (!completingRef.current) {
        completingRef.current = true
        completePomodoro.mutate(undefined, {
          onSettled: () => {
            completingRef.current = false
          },
        })
      }
      return
    }

    pomodoroTimeoutRef.current = setTimeout(() => {
      if (!completingRef.current) {
        completingRef.current = true
        completePomodoro.mutate(undefined, {
          onSettled: () => {
            completingRef.current = false
          },
        })
      }
    }, remaining)

    return () => {
      if (pomodoroTimeoutRef.current) {
        clearTimeout(pomodoroTimeoutRef.current)
        pomodoroTimeoutRef.current = null
      }
    }
  }, [pomodoro, focusSession, completePomodoro])

  useEffect(() => {
    if (!focusSession) return
    if (focusSession.status !== "RUNNING" && focusSession.status !== "PAUSED") return

    const focusElapsed = computeFocusElapsed(focusSession)
    const focusPlanned = focusSession.plannedMinutes * 60 * 1000
    const focusRemaining = focusPlanned - focusElapsed

    if (focusRemaining <= 0) {
      if (!completingRef.current) {
        endFocusSession("natural")
      }
      return
    }

    focusTimeoutRef.current = setTimeout(() => {
      if (!completingRef.current) {
        completingRef.current = true
        if (pomodoro && pomodoro.status === "RUNNING") {
          completePomodoro.mutate(undefined, {
            onSettled: () => {
              completingRef.current = false
              playSound("FOCUS_COMPLETE")
              notify("FOCUS_COMPLETE", `focus-end-${focusSession.id}`)
              endFocusSession("natural")
            },
          })
        } else {
          completingRef.current = false
          playSound("FOCUS_COMPLETE")
          notify("FOCUS_COMPLETE", `focus-end-${focusSession.id}`)
          endFocusSession("natural")
        }
      }
    }, focusRemaining)

    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current)
        focusTimeoutRef.current = null
      }
    }
  }, [focusSession, pomodoro, completePomodoro, endFocusSession, playSound, notify])

  const endSessionGiveUp = useCallback(() => {
    if (!focusSession) return
    playSound("FOCUS_ABANDON")
    notify("FOCUS_ABANDON", `focus-abandon-${focusSession.id}`)
    endFocusSession("giveup")
  }, [focusSession, endFocusSession, playSound, notify])

  const endSessionStrict = useCallback(() => {
    if (!focusSession) return
    playSound("STRICT_FAIL")
    notify("STRICT_FAIL", `focus-strict-${focusSession.id}`)
    endFocusSession("strict")
  }, [focusSession, endFocusSession, playSound, notify])

  const dismissSummary = useCallback(() => {
    setShowSummary(false)
    setSummarySession(null)
  }, [])

  useEffect(() => {
    if (document.visibilityState === "visible") {
      stopTitleFlash()
    }
  }, [pomodoro?.status])

  return {
    pomodoro,
    pomodoroLoading,
    completedWorkCount: cycleState.completedWorkCount,
    completedBreakCount: cycleState.completedBreakCount,
    distractions: cycleState.distractions,
    currentCycle: (cycleState.completedWorkCount % loadPomodoroSettings().longBreakInterval) + 1,
    totalCycles: loadPomodoroSettings().longBreakInterval,
    showSummary,
    summarySession: summarySession ?? focusSession,
    endedBy: cycleState.endedBy,
    incrementDistractions,
    endSessionGiveUp,
    endSessionStrict,
    dismissSummary,
    startNewSession: options?.startNewSession,
    startPomodoroPending: startPomodoro.isPending,
    endFocusPending: endFocus.isPending,
  }
}
