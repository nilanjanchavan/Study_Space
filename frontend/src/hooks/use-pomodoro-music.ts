"use client"

import { useEffect, useRef } from "react"
import { useMusic } from "@/providers/music-provider"
import { loadMusicSettings } from "@/lib/settings-storage"
import type { PomodoroSessionItem } from "@/types"

const WORK_TRACK = "rain"
const BREAK_TRACKS: Record<string, string> = {
  SHORT_BREAK: "ocean",
  LONG_BREAK: "forest",
}

export function usePomodoroMusic(pomodoro: PomodoroSessionItem | null) {
  const music = useMusic()
  const prevStatusRef = useRef(pomodoro?.status)
  const prevTypeRef = useRef(pomodoro?.type)

  useEffect(() => {
    if (!pomodoro) return

    const prevStatus = prevStatusRef.current
    const prevType = prevTypeRef.current
    prevStatusRef.current = pomodoro.status
    prevTypeRef.current = pomodoro.type

    const settings = loadMusicSettings()

    // Work started (IDLE/COMPLETED → RUNNING with type=WORK)
    if (pomodoro.type === "WORK" && pomodoro.status === "RUNNING" && prevStatus !== "RUNNING") {
      if (settings.autoPlayDuringWork && settings.defaultTrack !== "none") {
        music.play(settings.defaultTrack || WORK_TRACK)
      }
    }

    // Work paused
    if (pomodoro.type === "WORK" && pomodoro.status === "PAUSED" && prevStatus === "RUNNING") {
      music.pause()
    }

    // Work resumed
    if (pomodoro.type === "WORK" && pomodoro.status === "RUNNING" && prevStatus === "PAUSED") {
      music.resume()
    }

    // Work completed → fade out
    if (pomodoro.type === "WORK" && pomodoro.status === "COMPLETED" && prevStatus === "RUNNING") {
      music.fadeOut(600)
    }

    // Break started → optionally switch to break ambience
    if (
      (pomodoro.type === "SHORT_BREAK" || pomodoro.type === "LONG_BREAK") &&
      pomodoro.status === "RUNNING" &&
      prevStatus !== "RUNNING"
    ) {
      if (settings.autoStopDuringBreaks) {
        music.fadeOut(400)
      } else {
        const breakTrack = BREAK_TRACKS[pomodoro.type] || "ocean"
        if (music.isPlaying && music.currentTrack?.id !== breakTrack) {
          music.fadeOut(400).then(() => {
            music.fadeIn(breakTrack, 600)
          })
        }
      }
    }

    // Break completed → fade out break ambience
    if (
      (prevType === "SHORT_BREAK" || prevType === "LONG_BREAK") &&
      pomodoro.status === "COMPLETED" &&
      prevStatus === "RUNNING"
    ) {
      if (!settings.autoPlayDuringWork) {
        music.fadeOut(600)
      }
    }
  }, [pomodoro, music])
}
