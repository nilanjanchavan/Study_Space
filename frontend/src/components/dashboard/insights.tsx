"use client"

import { useMemo } from "react"
import { useDashboardAnalytics, useDailyAnalytics, useStreakAnalytics, useWeeklyAnalytics } from "@/hooks/use-analytics"
import { GlassCard } from "@/components/design-system/glass-card"
import { Skeleton } from "@/components/design-system/skeleton"
import { LightbulbIcon, SparklesIcon } from "lucide-react"

interface Insight {
  icon: React.ReactNode
  text: string
  type: "positive" | "neutral" | "tip"
}

export function Insights() {
  const { data: dashboard, isLoading: dashLoading } = useDashboardAnalytics()
  const { data: daily, isLoading: dailyLoading } = useDailyAnalytics()
  const { data: streak, isLoading: streakLoading } = useStreakAnalytics()
  const { data: weekly, isLoading: weeklyLoading } = useWeeklyAnalytics()

  const isLoading = dashLoading || dailyLoading || streakLoading || weeklyLoading
  const stats = dashboard?.data
  const dailyStats = daily?.data
  const streakData = streak?.data
  const weekData = weekly?.data

  const insights = useMemo(() => {
    const result: Insight[] = []
    if (!stats) return result

    // Streak insight
    if (streakData && streakData.currentStreak > 0) {
      result.push({
        icon: <SparklesIcon size={14} className="text-amber-500" />,
        text: streakData.currentStreak >= 7
          ? `Incredible ${streakData.currentStreak}-day streak!`
          : streakData.currentStreak >= 3
            ? `${streakData.currentStreak}-day streak — you're on fire!`
            : `${streakData.currentStreak}-day streak started`,
        type: "positive",
      })
      if (streakData.longestStreak > streakData.currentStreak) {
        result.push({
          icon: <SparklesIcon size={14} className="text-blue-500" />,
          text: `Best streak: ${streakData.longestStreak} days — keep pushing!`,
          type: "positive",
        })
      }
    }

    // Completion rate insight
    if (dailyStats) {
      if (dailyStats.completionRate >= 80) {
        result.push({
          icon: <SparklesIcon size={14} className="text-success" />,
          text: `Excellent ${dailyStats.completionRate}% completion rate today`,
          type: "positive",
        })
      } else if (dailyStats.completionRate < 50 && dailyStats.completedTodos > 0) {
        result.push({
          icon: <LightbulbIcon size={14} className="text-amber-500" />,
          text: `${dailyStats.completionRate}% completion rate — try focusing on one task at a time`,
          type: "tip",
        })
      }
    }

    // Most productive weekday from weekly data
    if (weekData?.days) {
      const dayMap = weekData.days
      const maxDay = dayMap.reduce((best, d) => d.focusMinutes > (best?.focusMinutes ?? 0) ? d : best, dayMap[0])
      if (maxDay && maxDay.focusMinutes > 0) {
        const dayName = new Date(maxDay.date).toLocaleDateString("en-US", { weekday: "long" })
        result.push({
          icon: <SparklesIcon size={14} className="text-violet-500" />,
          text: `Most productive day: ${dayName} (${maxDay.focusMinutes}min focus)`,
          type: "positive",
        })
      }
    }

    // Pomodoro completion rate
    const totalPomodoros = stats.pomodoros.completedPomodoros + stats.pomodoros.cancelledPomodoros
    if (totalPomodoros > 0) {
      const rate = Math.round((stats.pomodoros.completedPomodoros / totalPomodoros) * 100)
      if (rate >= 80) {
        result.push({
          icon: <SparklesIcon size={14} className="text-orange-500" />,
          text: `${rate}% pomodoro completion rate — strong discipline`,
          type: "positive",
        })
      } else if (rate < 60) {
        result.push({
          icon: <LightbulbIcon size={14} className="text-amber-500" />,
          text: `${rate}% pomodoro completion — try shorter sessions`,
          type: "tip",
        })
      }
    }

    // Average focus session length
    if (stats.focusSessions.completedFocusSessions > 0) {
      const avgMinutes = stats.pomodoros.totalFocusMinutes > 0 && stats.focusSessions.completedFocusSessions > 0
        ? Math.round(stats.pomodoros.totalFocusMinutes / stats.focusSessions.completedFocusSessions)
        : 0
      if (avgMinutes > 0) {
        result.push({
          icon: <LightbulbIcon size={14} className="text-blue-500" />,
          text: `Avg focus session: ${avgMinutes}min`,
          type: "neutral",
        })
      }
    }

    // Today's recommendation
    if (dailyStats && stats) {
      if (dailyStats.completedPomodoros < 2 && dailyStats.focusMinutes < 30) {
        result.push({
          icon: <SparklesIcon size={14} className="text-primary" />,
          text: "Start with one pomodoro — the hardest part is beginning",
          type: "tip",
        })
      } else if (dailyStats.completedPomodoros >= 4 && dailyStats.completedTodos >= 3) {
        result.push({
          icon: <SparklesIcon size={14} className="text-success" />,
          text: "Great momentum! Consider taking a longer break to recharge",
          type: "tip",
        })
      }
    }

    return result.slice(0, 4)
  }, [stats, dailyStats, streakData, weekData])

  if (isLoading) {
    return (
      <GlassCard className="p-4 space-y-3">
        <Skeleton className="h-4 w-1/4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </GlassCard>
    )
  }

  if (insights.length === 0) {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <LightbulbIcon size={14} className="text-muted-foreground/40" />
          <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Insights</h3>
        </div>
        <p className="text-sm text-muted-foreground/50">Complete activities to see personalized insights</p>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon size={14} className="text-muted-foreground/40" />
        <h3 className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Insights</h3>
      </div>
      <div className="space-y-2.5">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0">{insight.icon}</span>
            <p className="text-sm text-foreground/80 leading-relaxed">{insight.text}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
