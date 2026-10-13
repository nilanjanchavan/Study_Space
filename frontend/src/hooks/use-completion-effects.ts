"use client"

import { useEffect, useRef } from "react"
import { showBrowserNotification, requestNotificationPermission } from "@/lib/notifications"
import { getAudioManager, COMPLETION_SOUNDS } from "@/lib/audio-manager"
import { startTitleFlash, stopTitleFlash, restoreTitle } from "@/lib/page-title"
import { toast } from "sonner"
import type { PomodoroSessionItem } from "@/types"

const COMPLETION_MESSAGES: Record<string, { title: string; body: string; toastTitle: string; toastBody: string }> = {
  WORK: {
    title: "\uD83C\uDF45 Pomodoro Complete",
    body: "Great work! Time for a break.",
    toastTitle: "\uD83C\uDF45 Pomodoro Completed",
    toastBody: "Time for a short break.",
  },
  SHORT_BREAK: {
    title: "\u2615 Break Complete",
    body: "Break finished. Time to focus again.",
    toastTitle: "\u2615 Break Finished",
    toastBody: "Let\u2019s get back to work.",
  },
  LONG_BREAK: {
    title: "\uD83C\uDF34 Long Break Complete",
    body: "Ready for another productive session?",
    toastTitle: "\uD83C\uDF34 Long Break Finished",
    toastBody: "Ready for another session?",
  },
}

export function useCompletionEffects(session: PomodoroSessionItem | null) {
  const prevStatusRef = useRef(session?.status)
  const completedIdRef = useRef<string | null>(null)
  const startedIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!session) {
      prevStatusRef.current = undefined
      return
    }

    const prevStatus = prevStatusRef.current
    prevStatusRef.current = session.status

    // ── Session / Break COMPLETED → 2-second alarm ───────────────────
    if (
      prevStatus === "RUNNING" &&
      session.status === "COMPLETED" &&
      completedIdRef.current !== session.id
    ) {
      completedIdRef.current = session.id

      const msg = COMPLETION_MESSAGES[session.type]
      if (!msg) return

      toast.success(msg.toastTitle, { description: msg.toastBody })

      // Play 2-second alarm (auto-stops)
      const soundSrc = COMPLETION_SOUNDS[session.type]
      if (soundSrc) {
        getAudioManager().playAlarm(soundSrc)
      }

      if (document.visibilityState !== "visible") {
        showBrowserNotification(msg.title, msg.body)
        startTitleFlash()
      }
    }

    // ── New auto-cycled session STARTED → start-chime ───────────────
    // Detect: previous completed/break → now RUNNING with a NEW session id
    if (
      session.status === "RUNNING" &&
      (prevStatus === "COMPLETED" || prevStatus === "CANCELLED" || prevStatus === "ABANDONED") &&
      startedIdRef.current !== session.id
    ) {
      startedIdRef.current = session.id
      // 2-second notification sound for new session start
      getAudioManager().playAlarm("/sounds/notification.mp3")
    }
  }, [session])

  useEffect(() => {
    if (document.visibilityState === "visible") {
      stopTitleFlash()
    }
  }, [session?.status])

  useEffect(() => {
    return () => {
      stopTitleFlash()
      restoreTitle()
    }
  }, [])

  useEffect(() => {
    requestNotificationPermission()
  }, [])
}
