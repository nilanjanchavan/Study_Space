"use client"

import { usePomodoroSettings } from "@/hooks/use-settings"
import { useDailyAnalytics, useDashboardAnalytics } from "@/hooks/use-analytics"
import { GlassCard } from "@/components/design-system/glass-card"
import { ProgressBar } from "@/components/design-system/progress"
import { Skeleton } from "@/components/design-system/skeleton"
import { TargetIcon, CalendarDaysIcon } from "lucide-react"

export function WeeklyGoals() {
  const [settings] = usePomodoroSettings()
  const { data: daily, isLoading: dailyLoading } = useDailyAnalytics()
  const { data: dashboard, isLoading: dashLoading } = useDashboardAnalytics()

  const isLoading = dailyLoading || dashLoading
  const dailyStats = daily?.data
  const stats = dashboard?.data

  const dailyGoal = settings.dailyGoal
  const weeklyGoal = dailyGoal * 7
  const completedToday = dailyStats?.completedPomodoros ?? 0
  const completedAll = stats?.pomodoros.completedPomodoros ?? 0

  const remainingDaily = Math.max(0, dailyGoal - completedToday)
  const remainingWeekly = Math.max(0, weeklyGoal - completedAll)

  if (isLoading) {
    return (
      <GlassCard className="p-4 space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <TargetIcon size={14} className="text-muted-foreground/40" />
        <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Goals</h3>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-sm">
              <CalendarDaysIcon size={13} className="text-primary" />
              <span className="font-medium text-foreground">Daily</span>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">{completedToday}/{dailyGoal}</span>
          </div>
          <ProgressBar value={completedToday} max={dailyGoal} size="sm" />
          {remainingDaily > 0 && (
            <p className="text-[11px] text-muted-foreground/60 mt-1">{remainingDaily} remaining</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-sm">
              <TargetIcon size={13} className="text-violet-500" />
              <span className="font-medium text-foreground">Weekly</span>
            </div>
            <span className="text-xs text-muted-foreground tabular-nums">{completedAll}/{weeklyGoal}</span>
          </div>
          <ProgressBar value={completedAll} max={weeklyGoal} size="sm" />
          {remainingWeekly > 0 && (
            <p className="text-[11px] text-muted-foreground/60 mt-1">{remainingWeekly} sessions to go</p>
          )}
        </div>
      </div>
    </GlassCard>
  )
}
