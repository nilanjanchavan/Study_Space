"use client"

import { useEffect, useRef } from "react"
import { useMusic } from "@/providers/music-provider"
import { loadMusicSettings } from "@/lib/settings-storage"
import type { FocusSessionItem } from "@/types"

export function useFocusMusic(focusSession: FocusSessionItem | null) {
  const music = useMusic()
  const prevStatusRef = useRef(focusSession?.status)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!focusSession) return

    const prevStatus = prevStatusRef.current
    prevStatusRef.current = focusSession.status

    const settings = loadMusicSettings()

    // Focus session started → auto-play
    if (focusSession.status === "RUNNING" && prevStatus !== "RUNNING" && !startedRef.current) {
      startedRef.current = true
      if (settings.autoPlayDuringWork && settings.defaultTrack !== "none") {
        music.play(settings.defaultTrack || "rain")
      }
    }

    // Focus session completed → fade out
    if (focusSession.status === "COMPLETED" && prevStatus === "RUNNING") {
      music.fadeOut(800)
      startedRef.current = false
    }
  }, [focusSession, music])

  // Strict mode failure → immediately stop
  const handleStrictFail = () => {
    music.stop()
    startedRef.current = false
  }

  return { handleStrictFail }
}
