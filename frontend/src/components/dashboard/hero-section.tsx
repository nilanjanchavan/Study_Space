"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { usePomodoroSettings } from "@/hooks/use-settings"
import { useStartPomodoro } from "@/hooks/use-pomodoro"
import { useStartFocus } from "@/hooks/use-focus"
import { GlassCard } from "@/components/design-system/glass-card"
import { CircularProgress } from "@/components/design-system/progress"
import { Button } from "@/components/ui/button"
import {
  PlayIcon,
  FocusIcon,
  ListTodoIcon,
  TimerIcon,
  FlameIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  TrendingUpIcon,
  TargetIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { DailyAnalytics } from "@/services/analytics"

interface HeroSectionProps {
  dailyStats: DailyAnalytics | undefined
  hasActiveSession: boolean
  currentStreak: number
  displayName: string
}

function useGreeting() {
  return useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }, [])
}

function useFormattedDate() {
  return useMemo(() => {
    const now = new Date()
    return now.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }, [])
}

function computeScore(dailyStats: DailyAnalytics | undefined, streak: number): number {
  if (!dailyStats) return 0
  const focusScore = Math.min(dailyStats.focusMinutes / 120, 1) * 30
  const pomoScore = Math.min(dailyStats.completedPomodoros / 8, 1) * 25
  const todoScore = Math.min(dailyStats.completedTodos / 10, 1) * 20
  const streakScore = Math.min(streak / 30, 1) * 15
  const completionScore = (dailyStats.completionRate / 100) * 10
  return Math.min(Math.round(focusScore + pomoScore + todoScore + streakScore + completionScore), 100)
}

function HeroStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="min-w-0 flex items-baseline gap-1">
        <span className="text-sm font-semibold text-foreground tabular-nums truncate">{value}</span>
        <span className="text-xs text-muted-foreground truncate hidden sm:inline">{label}</span>
      </div>
      <span className={cn("shrink-0", color)}>{icon}</span>
    </div>
  )
}

export function HeroSection({
  dailyStats,
  hasActiveSession,
  currentStreak,
  displayName,
}: HeroSectionProps) {
  const router = useRouter()
  const [settings] = usePomodoroSettings()
  const startPomodoro = useStartPomodoro()
  const startFocus = useStartFocus()
  const greeting = useGreeting()
  const dateStr = useFormattedDate()

  const dailyGoal = settings.dailyGoal
  const completedPomodoros = dailyStats?.completedPomodoros ?? 0
  const focusMinutes = dailyStats?.focusMinutes ?? 0
  const completedTodos = dailyStats?.completedTodos ?? 0
  const completionRate = dailyStats?.completionRate ?? 0
  const isGoalMet = completedPomodoros >= dailyGoal
  const completionPct = dailyGoal > 0 ? Math.round((completedPomodoros / dailyGoal) * 100) : 0
  const score = computeScore(dailyStats, currentStreak)
  const remainingPomodoros = Math.max(0, dailyGoal - completedPomodoros)

  const handleStartPomodoro = () => {
    if (hasActiveSession) { router.push("/pomodoro"); return }
    startPomodoro.mutate(
      { type: "WORK", durationMinutes: settings.workMinutes },
      {
        onSuccess: () => { toast.success("Pomodoro started!"); router.push("/pomodoro") },
        onError: () => toast.error("Failed to start pomodoro"),
      }
    )
  }

  const handleStartFocus = () => {
    if (hasActiveSession) { router.push("/focus"); return }
    startFocus.mutate(
      { plannedMinutes: 60, mode: "NORMAL" },
      {
        onSuccess: () => { toast.success("Focus session started!"); router.push("/focus") },
        onError: () => toast.error("Failed to start focus session"),
      }
    )
  }

  return (
    <GlassCard className="p-5 sm:p-6 overflow-hidden relative">
      <div aria-hidden className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-indigo-500/[0.14] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-violet-500/[0.1] blur-3xl" />
      <div className="relative flex flex-col sm:flex-row items-start gap-6">
        {/* Left: Content */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Greeting + Date */}
          <div className="flex items-baseline justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-display text-foreground truncate">
                {greeting}, <span className="text-serif-accent">{displayName}</span>
              </h1>
              <p className="text-caption text-muted-foreground mt-0.5">{dateStr}</p>
            </div>
          </div>

          {/* Today's Mission */}
          <div className="flex items-center gap-2">
            <p className="text-sm text-foreground/80">
              {hasActiveSession ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  Session in progress
                </span>
              ) : isGoalMet ? (
                "Daily goal reached. Keep the momentum going."
              ) : (
                <span><strong>{remainingPomodoros}</strong> pomodoro{remainingPomodoros !== 1 ? "s" : ""} to hit your daily goal</span>
              )}
            </p>
            <TargetIcon size={14} className="text-primary shrink-0" />
          </div>

          {/* Quick Stats Row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <HeroStat icon={<CheckCircle2Icon size={14} />} label="done" value={String(completedPomodoros)} color="text-success" />
            <HeroStat icon={<TimerIcon size={14} />} label="focused" value={`${focusMinutes}min`} color="text-primary" />
            <HeroStat icon={<ListTodoIcon size={14} />} label="tasks" value={String(completedTodos)} color="text-orange-500" />
            {currentStreak > 0 && (
              <HeroStat icon={<FlameIcon size={14} />} label="day streak" value={String(currentStreak)} color="text-amber-500" />
            )}
            <HeroStat icon={<TrendingUpIcon size={14} />} label="rate" value={`${completionRate}%`} color="text-violet-500" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {hasActiveSession ? (
              <Button onClick={() => router.push("/pomodoro")} className="gap-2 h-9 px-4">
                Resume Session
                <ArrowRightIcon size={15} />
              </Button>
            ) : (
              <Button onClick={handleStartPomodoro} disabled={startPomodoro.isPending} className="gap-2 h-9 px-4">
                Start Pomodoro
                <PlayIcon size={15} />
              </Button>
            )}
            <Button variant="outline" onClick={handleStartFocus} disabled={startFocus.isPending} className="gap-2 h-9 px-3 text-xs sm:text-sm">
              <span className="hidden sm:inline">Focus</span>
              <FocusIcon size={14} />
            </Button>
            <Button variant="outline" onClick={() => router.push("/todos")} className="gap-2 h-9 px-3 text-xs sm:text-sm">
              <span className="hidden sm:inline">Todos</span>
              <ListTodoIcon size={14} />
            </Button>
          </div>
        </div>

        {/* Right: Progress Ring + Score */}
        <div className="flex w-full shrink-0 items-center justify-center gap-3 sm:w-auto sm:justify-start">
          <div className="relative">
            <CircularProgress value={completionPct} size={96} strokeWidth={6} accentColor gradient />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-foreground tabular-nums leading-none">{completedPomodoros}</span>
              <span className="text-[10px] text-muted-foreground mt-px">/ {dailyGoal}</span>
            </div>
          </div>
          {score > 0 && (
            <div className="flex flex-col items-center">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                score >= 80 ? "bg-success/15 text-success" :
                score >= 60 ? "bg-primary/15 text-primary" :
                score >= 40 ? "bg-amber-500/15 text-amber-500" :
                "bg-muted text-muted-foreground"
              )}>
                {score}
              </div>
              <p className="text-[9px] text-muted-foreground mt-0.5">Score</p>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
