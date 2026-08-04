"use client"

import { useDashboardAnalytics, useDailyAnalytics, useWeeklyAnalytics, useMonthlyAnalytics, useStreakAnalytics } from "@/hooks/use-analytics"
import { SectionHeader } from "@/components/design-system/layout"
import { GlassCard } from "@/components/design-system/glass-card"
import { EmptyState } from "@/components/design-system/empty-state"
import { TodayActivity } from "@/components/analytics/today-activity"
import { StreakCard } from "@/components/analytics/streak-card"
import { WeeklyChart } from "@/components/analytics/weekly-chart"
import { MonthlyChart } from "@/components/analytics/monthly-chart"
import { ProductivitySummary } from "@/components/analytics/productivity-summary"
import { Insights } from "@/components/analytics/insights"
import { BarChart3Icon } from "lucide-react"

export default function AnalyticsPage() {
  const dashboard = useDashboardAnalytics()
  const daily = useDailyAnalytics()
  const weekly = useWeeklyAnalytics()
  const monthly = useMonthlyAnalytics()
  const streak = useStreakAnalytics()

  const isLoading =
    dashboard.isLoading || daily.isLoading || weekly.isLoading || monthly.isLoading || streak.isLoading

  const hasAnyData =
    (dashboard.data?.data.pomodoros.completedPomodoros ?? 0) > 0 ||
    (dashboard.data?.data.todos.totalTodos ?? 0) > 0 ||
    (weekly.data?.data.days.some((d) => d.focusMinutes > 0) ?? false)

  if (!isLoading && !hasAnyData) {
    return (
      <div className="flex flex-col gap-8 max-w-5xl">
        <SectionHeader
          title="Analytics"
          subtitle="Track your productivity over time"
        />
        <GlassCard className="p-8">
          <EmptyState
            icon={<BarChart3Icon size={32} />}
            title="No analytics yet"
            description="Start focusing, completing pomodoros, and checking off todos to see your productivity data here"
          />
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <SectionHeader
        title="Analytics"
        subtitle="Track your productivity over time"
      />

      {/* Top row: Today + Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TodayActivity data={daily.data?.data} isLoading={daily.isLoading} />
        <StreakCard data={streak.data?.data} isLoading={streak.isLoading} />
      </div>

      {/* Charts row: Weekly + Monthly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <WeeklyChart data={weekly.data?.data} isLoading={weekly.isLoading} />
        <MonthlyChart data={monthly.data?.data} isLoading={monthly.isLoading} />
      </div>

      {/* Bottom row: Productivity + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ProductivitySummary data={dashboard.data?.data} isLoading={dashboard.isLoading} />
        <Insights
          dashboard={dashboard.data?.data}
          weekly={weekly.data?.data}
          streak={streak.data?.data}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
