"use client"

import { useMemo } from "react"
import { GlassCard } from "@/components/design-system/glass-card"
import { Skeleton } from "@/components/design-system/skeleton"
import { SectionHeader } from "@/components/design-system/layout"
import { LightbulbIcon } from "lucide-react"
import type { DashboardAnalytics, WeeklyAnalytics, StreakAnalytics } from "@/services/analytics"

interface InsightsProps {
  dashboard: DashboardAnalytics | undefined
  weekly: WeeklyAnalytics | undefined
  streak: StreakAnalytics | undefined
  isLoading: boolean
}

interface Insight {
  text: string
}

function generateInsights(
  dashboard: DashboardAnalytics | undefined,
  weekly: WeeklyAnalytics | undefined,
  streak: StreakAnalytics | undefined,
): Insight[] {
  const insights: Insight[] = []
  if (!dashboard && !weekly && !streak) return insights

  if (streak) {
    if (streak.currentStreak >= 7) {
      insights.push({ text: `Amazing! You're on a ${streak.currentStreak}-day streak.` })
    } else if (streak.currentStreak >= 3) {
      insights.push({ text: `Nice! ${streak.currentStreak} days in a row.` })
    } else if (streak.currentStreak === 0 && streak.longestStreak > 0) {
      insights.push({ text: `Your longest streak was ${streak.longestStreak} day${streak.longestStreak === 1 ? "" : "s"}.` })
    }
  }

  if (dashboard) {
    const { pomodoros, todos } = dashboard

    if (pomodoros.completedPomodoros > 0) {
      insights.push({ text: `You've completed ${pomodoros.completedPomodoros} pomodoro${pomodoros.completedPomodoros === 1 ? "" : "s"} total.` })
    }

    if (pomodoros.averagePomodoroLength > 0 && pomodoros.averagePomodoroLength !== 25) {
      insights.push({ text: `Your average Pomodoro length is ${pomodoros.averagePomodoroLength} minutes.` })
    }

    if (todos.totalTodos > 0) {
      const rate = Math.round((todos.completedTodos / todos.totalTodos) * 100)
      if (rate >= 80) {
        insights.push({ text: `Great completion rate: ${rate}%.` })
      } else if (rate >= 50) {
        insights.push({ text: `You've completed ${rate}% of your todos.` })
      }
    }

    if (todos.overdueTodos > 0) {
      insights.push({ text: `You have ${todos.overdueTodos} overdue todo${todos.overdueTodos === 1 ? "" : "s"}.` })
    }

    if (pomodoros.totalFocusMinutes >= 120) {
      const hours = Math.round(pomodoros.totalFocusMinutes / 60 * 10) / 10
      insights.push({ text: `You've focused for ${hours} hours total.` })
    }
  }

  if (weekly && weekly.days.length > 0) {
    const totalWeekMinutes = weekly.days.reduce((sum, d) => sum + d.focusMinutes, 0)
    if (totalWeekMinutes > 0) {
      const avgDaily = Math.round(totalWeekMinutes / weekly.days.length)
      insights.push({ text: `You average ${avgDaily} minutes of focus per day this week.` })

      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      let maxDay = weekly.days[0]
      for (const d of weekly.days) {
        if (d.focusMinutes > maxDay.focusMinutes) maxDay = d
      }
      const maxIdx = weekly.days.indexOf(maxDay)
      if (maxDay.focusMinutes > 0) {
        insights.push({ text: `${dayNames[maxIdx]} is your most productive day.` })
      }
    }
  }

  return insights.slice(0, 5)
}

export function Insights({ dashboard, weekly, streak, isLoading }: InsightsProps) {
  const insights = useMemo(() => generateInsights(dashboard, weekly, streak), [dashboard, weekly, streak])

  return (
    <GlassCard className="p-4">
      <SectionHeader
        title="Insights"
        accent={{
          icon: <LightbulbIcon size={14} />,
          className: "bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400",
        }}
      />
      <div className="mt-3">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Skeleton className="size-6 shrink-0 rounded-md" />
                <Skeleton className="h-4 flex-1 mt-0.5" />
              </div>
            ))}
          </div>
        ) : insights.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 py-4 text-center">
            Keep using the app to generate insights
          </p>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-border/50 bg-card/50 px-3 py-2.5 transition-colors hover:bg-muted/30 dark:bg-white/[0.03]">
                <p className="text-sm text-foreground leading-relaxed flex-1">{insight.text}</p>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400">
                  <LightbulbIcon size={13} />
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
