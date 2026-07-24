"use client"

import { useEffect, useRef } from "react"
import type { FocusSessionItem } from "@/types"

const AWAY_THRESHOLD_MS = 3000

export function useFocusStrictMode(
  focusSession: FocusSessionItem | null,
  onViolation: () => void,
  onDistraction: () => void,
) {
  const awayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isStrict = focusSession?.strictModeEnabled ?? false
  const isActive = focusSession?.status === "RUNNING"

  useEffect(() => {
    if (!isActive) return

    const clearAwayTimer = () => {
      if (awayTimerRef.current) {
        clearTimeout(awayTimerRef.current)
        awayTimerRef.current = null
      }
    }

    const startAwayTimer = () => {
      if (awayTimerRef.current) return
      if (isStrict) {
        awayTimerRef.current = setTimeout(() => {
          awayTimerRef.current = null
          onViolation()
        }, AWAY_THRESHOLD_MS)
      } else {
        onDistraction()
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        startAwayTimer()
      } else {
        clearAwayTimer()
      }
    }

    const handleBlur = () => {
      startAwayTimer()
    }

    const handleFocus = () => {
      clearAwayTimer()
    }

    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("blur", handleBlur)
    window.addEventListener("focus", handleFocus)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("blur", handleBlur)
      window.removeEventListener("focus", handleFocus)
      clearAwayTimer()
    }
  }, [isActive, isStrict, onViolation, onDistraction])
}
