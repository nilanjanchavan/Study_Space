"use client"

import { useEffect, useState, useRef } from "react"
import type { PomodoroSessionItem } from "@/types"

import { workerTimer } from "@/lib/worker-timer"

interface TimerDisplayProps {
  session: PomodoroSessionItem | null
  plannedMinutes: number
  focusStartedAt?: string
  onFinished?: () => void
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
    return { remaining: plannedMs, progress: 0 }
  }
  const remaining = computeRemaining(session, plannedMs, now, overrideStartedMs)
  const progress = Math.min(100, Math.max(0, Math.round(((plannedMs - remaining) / plannedMs) * 100)))
  return { remaining, progress }
}

const RADIUS = 120
const STROKE = 6
const VIEWBOX_SIZE = (RADIUS + STROKE) * 2
const CENTER = VIEWBOX_SIZE / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function TimerDisplay({ session, plannedMinutes, focusStartedAt, onFinished }: TimerDisplayProps) {
  const plannedMs = plannedMinutes * 60 * 1000
  const overrideStartedMs = focusStartedAt ? new Date(focusStartedAt).getTime() : undefined
  const [remaining, setRemaining] = useState(plannedMs)
  const [progress, setProgress] = useState(0)

  const firedRef = useRef(false)
  const firedSessionIdRef = useRef<string | null>(null)

  const isComplete = session?.status === "COMPLETED"
  const isActive = session?.status === "RUNNING" || session?.status === "PAUSED"
  const isPaused = session?.status === "PAUSED"
  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE

  useEffect(() => {
    if (!isActive) {
      setRemaining(plannedMs)
      setProgress(0)
      firedRef.current = false
    }
  }, [isActive, plannedMs])

  useEffect(() => {
    if (!isActive) return

    if (session && session.id !== firedSessionIdRef.current) {
      firedRef.current = false
      firedSessionIdRef.current = session.id
    }

    let lastSecond = -1

    const tick = (now: number) => {
      const d = computeDisplay(session, plannedMs, now, overrideStartedMs)
      const currentSecond = Math.ceil(d.remaining / 1000)
      if (currentSecond !== lastSecond) {
        lastSecond = currentSecond
        setRemaining(d.remaining)
        setProgress(d.progress)
      }
      if (session?.status === "RUNNING" && d.remaining <= 0 && !firedRef.current) {
        firedRef.current = true
        onFinished?.()
      }
    }

    tick(Date.now())

    // Subscribe to Web Worker timer so this fires continuously even when tab is backgrounded
    const unsubscribeWorker = workerTimer.subscribe((now) => {
      tick(now)
    })

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        tick(Date.now())
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      unsubscribeWorker()
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [session, plannedMs, overrideStartedMs, isActive, onFinished]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer glow for active sessions */}
      {isActive && (
        <div
          className="absolute rounded-full transition-opacity duration-1000"
          style={{
            width: VIEWBOX_SIZE + 24,
            height: VIEWBOX_SIZE + 24,
            background: isPaused
              ? "oklch(0.62 0.14 25 / 0.05)"
              : "oklch(0.62 0.14 25 / 0.09)",
          }}
        />
      )}

      <svg
        width={VIEWBOX_SIZE}
        height={VIEWBOX_SIZE}
        viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
        className="relative -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          className="text-muted/30"
        />
        {/* Progress arc */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={isComplete ? "currentColor" : "var(--primary)"}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={strokeDashoffset}
          className={
            isComplete
              ? "text-success"
              : "text-primary"
          }
          style={{
            transition: isActive ? "stroke-dashoffset 0.3s linear" : "stroke-dashoffset 0.6s ease-out, stroke 0.3s ease",
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono font-bold tracking-tighter text-foreground tabular-nums select-none"
          style={{ fontSize: "clamp(2.2rem, 8vw, 3.25rem)", lineHeight: 1 }}
        >
          {formatTime(remaining)}
        </span>
      </div>

      {/* Completion pulse */}
      {isComplete && session && (
        <div
          key={session.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: VIEWBOX_SIZE,
            height: VIEWBOX_SIZE,
            animation: "timer-pulse 1.2s ease-out",
          }}
        />
      )}

      <style>{`
        @keyframes timer-pulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.35); }
          70% { box-shadow: 0 0 0 24px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>
    </div>
  )
}
