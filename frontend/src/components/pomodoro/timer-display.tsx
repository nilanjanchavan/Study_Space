"use client"

import { useEffect, useState } from "react"
import type { PomodoroSessionItem } from "@/types"

interface TimerDisplayProps {
  session: PomodoroSessionItem | null
  plannedMinutes: number
  focusStartedAt?: string
}

function computeRemaining(session: PomodoroSessionItem, plannedMs: number, now: number, overrideStartedMs?: number): number {
  const startedMs = overrideStartedMs ?? new Date(session.startedAt).getTime()

  let pausedMs = session.accumulatedPausedMs
  if (session.status === "PAUSED" && session.pausedAt) {
    pausedMs += now - new Date(session.pausedAt).getTime()
  }

  const elapsed = session.status === "PAUSED" && session.pausedAt
    ? new Date(session.pausedAt).getTime() - startedMs - session.accumulatedPausedMs
    : now - startedMs - pausedMs

  return Math.max(0, plannedMs - elapsed)
}

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
}

function computeDisplay(session: PomodoroSessionItem | null, plannedMs: number, now: number, overrideStartedMs?: number) {
  if (!session) return { remaining: plannedMs, progress: 0 }
  if (session.status === "COMPLETED" || session.status === "CANCELLED" || session.status === "ABANDONED") {
    return { remaining: 0, progress: 100 }
  }
  const remaining = computeRemaining(session, plannedMs, now, overrideStartedMs)
  const progress = Math.round(((plannedMs - remaining) / plannedMs) * 100)
  return { remaining, progress }
}

export function TimerDisplay({ session, plannedMinutes, focusStartedAt }: TimerDisplayProps) {
  const plannedMs = plannedMinutes * 60 * 1000
  const overrideStartedMs = focusStartedAt ? new Date(focusStartedAt).getTime() : undefined
  const [remaining, setRemaining] = useState(plannedMs)
  const [progress, setProgress] = useState(0)

  const isComplete = session?.status === "COMPLETED"

  useEffect(() => {
    const isActive = session?.status === "RUNNING" || session?.status === "PAUSED"
    if (!isActive) {
      const rafId = requestAnimationFrame(() => {
        const d = computeDisplay(session, plannedMs, Date.now(), overrideStartedMs)
        setRemaining(d.remaining)
        setProgress(d.progress)
      })
      return () => cancelAnimationFrame(rafId)
    }

    let rafId: number
    let lastSecond = -1

    const tick = () => {
      const now = Date.now()
      const d = computeDisplay(session, plannedMs, now, overrideStartedMs)
      const currentSecond = Math.ceil(d.remaining / 1000)
      if (currentSecond !== lastSecond) {
        lastSecond = currentSecond
        setRemaining(d.remaining)
        setProgress(d.progress)
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        const now = Date.now()
        const d = computeDisplay(session, plannedMs, now, overrideStartedMs)
        lastSecond = Math.ceil(d.remaining / 1000)
        setRemaining(d.remaining)
        setProgress(d.progress)
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      cancelAnimationFrame(rafId)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [session, plannedMs, overrideStartedMs])

  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative flex items-center justify-center">
        <svg width="140" height="140" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-border"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className={
              isComplete
                ? "text-emerald-500 dark:text-emerald-400 transition-colors duration-300"
                : "text-primary transition-all duration-1000 ease-linear"
            }
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <span className="absolute text-4xl font-mono font-semibold tracking-tight text-foreground tabular-nums">
          {formatTime(remaining)}
        </span>
        {isComplete && session && (
          <div
            key={session.id}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{ animation: "timer-pulse 1.2s ease-out" }}
          />
        )}
      </div>
      <style>{`
        @keyframes timer-pulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.35); }
          70% { box-shadow: 0 0 0 20px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  )
}
