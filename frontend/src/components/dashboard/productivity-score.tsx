"use client"

import { useMemo } from "react"
import { useDashboardAnalytics, useDailyAnalytics, useStreakAnalytics, useMonthlyAnalytics } from "@/hooks/use-analytics"
import { FloatingCard } from "@/components/design-system/floating-card"
import { CircularProgress } from "@/components/design-system/progress"
import { SectionHeader } from "@/components/design-system/layout"
import { Skeleton } from "@/components/design-system/skeleton"
import { TrendingUpIcon, TrendingDownIcon, MinusIcon, ZapIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function computeProductivityScore(
  dailyStats: { focusMinutes: number; completedPomodoros: number; completedTodos: number; completionRate: number } | undefined,
  streak: number
): number {
  if (!dailyStats) return 0
  const focusScore = Math.min(dailyStats.focusMinutes / 120, 1) * 30
  const pomoScore = Math.min(dailyStats.completedPomodoros / 8, 1) * 25
  const todoScore = Math.min(dailyStats.completedTodos / 10, 1) * 20
  const streakScore = Math.min(streak / 30, 1) * 15
  const completionScore = (dailyStats.completionRate / 100) * 10
  return Math.min(Math.round(focusScore + pomoScore + todoScore + streakScore + completionScore), 100)
}

export function ProductivityScore() {
  const { isLoading: dashLoading } = useDashboardAnalytics()
  const { data: daily, isLoading: dailyLoading } = useDailyAnalytics()
  const { data: streak, isLoading: streakLoading } = useStreakAnalytics()
  const { data: monthly, isLoading: monthlyLoading } = useMonthlyAnalytics()

  const isLoading = dashLoading || dailyLoading || streakLoading || monthlyLoading
  const dailyStats = daily?.data
  const streakData = streak?.data
  const monthlyData = monthly?.data

  const score = useMemo(
    () => computeProductivityScore(dailyStats, streakData?.currentStreak ?? 0),
    [dailyStats, streakData]
  )

  const trend = useMemo(() => {
    if (!monthlyData?.weeklyBreakdown || monthlyData.weeklyBreakdown.length < 2) return { direction: "flat" as const, value: 0, label: "Not enough data" }
    const weeks = monthlyData.weeklyBreakdown
    const current = weeks[weeks.length - 1]
    const previous = weeks[weeks.length - 2]
    if (!current || !previous || previous.focusMinutes === 0) return { direction: "flat" as const, value: 0, label: "Not enough data" }
    const change = Math.round(((current.focusMinutes - previous.focusMinutes) / previous.focusMinutes) * 100)
    if (change > 0) return { direction: "up" as const, value: change, label: `${change}% more focused than last week` }
    if (change < 0) return { direction: "down" as const, value: Math.abs(change), label: `${Math.abs(change)}% less focused than last week` }
    return { direction: "flat" as const, value: 0, label: "Same as last week" }
  }, [monthlyData])

  const explanation = useMemo(() => {
    if (score === 0) return "Start your day to see your score"
    const parts: string[] = []
    if (dailyStats) {
      if (dailyStats.focusMinutes >= 60) parts.push("great focus time")
      if (dailyStats.completedPomodoros >= 4) parts.push("solid pomodoro count")
      if (dailyStats.completedTodos >= 3) parts.push("good task completion")
      if (streakData && streakData.currentStreak >= 3) parts.push(`${streakData.currentStreak}-day streak`)
    }
    return parts.length > 0 ? parts.join(" · ") : "Keep going to build momentum"
  }, [score, dailyStats, streakData])

  if (isLoading) {
    return (
      <FloatingCard className="p-4">
        <Skeleton className="h-4 w-1/3 mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </FloatingCard>
    )
  }

  return (
    <FloatingCard className="p-4">
      <SectionHeader
        className="mb-4"
        title="Productivity Score"
        accent={{ icon: <ZapIcon size={14} />, className: "bg-indigo-500/10 text-indigo-500" }}
        action={
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            trend.direction === "up" ? "text-success" :
            trend.direction === "down" ? "text-destructive" :
            "text-muted-foreground"
          )}>
            {trend.direction !== "flat" && `${trend.value}%`}
            {trend.direction === "up" ? <TrendingUpIcon size={14} /> :
             trend.direction === "down" ? <TrendingDownIcon size={14} /> :
             <MinusIcon size={14} />}
          </div>
        }
      />

      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <CircularProgress value={score} size={88} strokeWidth={6} gradient />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground tabular-nums">{score}</span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground leading-relaxed">{explanation}</p>
          <p className="text-[11px] text-muted-foreground/60 mt-1.5">{trend.label}</p>
        </div>
      </div>
    </FloatingCard>
  )
}
