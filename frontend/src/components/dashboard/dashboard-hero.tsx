"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { usePomodoroSettings } from "@/hooks/use-settings"
import { useStartPomodoro } from "@/hooks/use-pomodoro"
import { useStartFocus } from "@/hooks/use-focus"
import { GlassCard } from "@/components/design-system/glass-card"
import { Button } from "@/components/ui/button"
import { CircularProgress } from "@/components/design-system/progress"
import { BadgeRunning } from "@/components/design-system/premium-badge"
import {
  PlayIcon,
  FocusIcon,
  CheckCircle2Icon,
  TimerIcon,
  FlameIcon,
  ListTodoIcon,
  ArrowRightIcon,
} from "lucide-react"
import { toast } from "sonner"

interface DashboardHeroProps {
  completedPomodoros: number
  totalFocusMinutes: number
  hasActiveSession: boolean
  pendingTodos: number
}

function useFormattedDate() {
  return useMemo(() => {
    const now = new Date()
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }, [])
}

export function DashboardHero({ completedPomodoros, totalFocusMinutes, hasActiveSession, pendingTodos }: DashboardHeroProps) {
  const router = useRouter()
  const [settings] = usePomodoroSettings()
  const startPomodoro = useStartPomodoro()
  const startFocus = useStartFocus()
  const dateStr = useFormattedDate()

  const dailyGoal = settings.dailyGoal
  const remaining = Math.max(0, dailyGoal - completedPomodoros)
  const isGoalMet = completedPomodoros >= dailyGoal
  const completionPct = dailyGoal > 0 ? Math.round((completedPomodoros / dailyGoal) * 100) : 0

  const handleStartPomodoro = () => {
    if (hasActiveSession) {
      router.push("/pomodoro")
      return
    }
    startPomodoro.mutate(
      { type: "WORK", durationMinutes: settings.workMinutes },
      {
        onSuccess: () => {
          toast.success("Pomodoro started!")
          router.push("/pomodoro")
        },
        onError: () => toast.error("Failed to start pomodoro"),
      }
    )
  }

  const handleStartFocus = () => {
    if (hasActiveSession) {
      router.push("/focus")
      return
    }
    startFocus.mutate(
      { plannedMinutes: 60, mode: "NORMAL" },
      {
        onSuccess: () => {
          toast.success("Focus session started!")
          router.push("/focus")
        },
        onError: () => toast.error("Failed to start focus session"),
      }
    )
  }

  return (
    <GlassCard className="p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Info + Actions */}
        <div className="flex-1 space-y-5">
          <div>
            <p className="text-caption text-muted-foreground">{dateStr}</p>
            <h1 className="text-heading font-heading text-foreground mt-0.5">
              {isGoalMet ? "Great work today!" : "Today's Focus"}
            </h1>
            <p className="text-body text-muted-foreground mt-1">
              {hasActiveSession ? (
                <span className="inline-flex items-center gap-1.5">
                  <BadgeRunning>Session in progress</BadgeRunning>
                </span>
              ) : isGoalMet ? (
                "Daily goal reached. Keep the momentum going."
              ) : (
                `${remaining} pomodoro${remaining !== 1 ? "s" : ""} to hit your daily goal`
              )}
            </p>
          </div>

          {/* Quick Stats Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
              <span className="tabular-nums font-medium truncate">{completedPomodoros}</span>
              <span className="truncate">done</span>
              <CheckCircle2Icon size={14} className="text-success shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
              <span className="tabular-nums font-medium truncate">{totalFocusMinutes}</span>
              <span className="truncate">min</span>
              <TimerIcon size={14} className="text-primary shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
              <span className="tabular-nums font-medium truncate">{pendingTodos}</span>
              <span className="truncate">todos</span>
              <ListTodoIcon size={14} className="text-orange-500 shrink-0" />
            </div>
            {completedPomodoros > 0 && (
              <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
                <span className="tabular-nums font-medium truncate">{completionPct}%</span>
                <FlameIcon size={14} className="text-amber-500 shrink-0" />
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {hasActiveSession ? (
              <Button onClick={() => router.push("/pomodoro")} className="gap-2">
                Resume Session
                <ArrowRightIcon size={14} />
              </Button>
            ) : (
              <>
                <Button onClick={handleStartPomodoro} disabled={startPomodoro.isPending} className="gap-2">
                  Start Pomodoro
                  <PlayIcon size={14} />
                </Button>
                <Button variant="outline" onClick={handleStartFocus} disabled={startFocus.isPending} className="gap-2">
                  Start Focus
                  <FocusIcon size={14} />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Right: Progress Ring */}
        <div className="flex justify-center sm:justify-end">
          <div className="relative">
            <CircularProgress
              value={completionPct}
              size={140}
              strokeWidth={10}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-foreground tabular-nums leading-none">
                {completedPomodoros}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                / {dailyGoal}
              </span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
