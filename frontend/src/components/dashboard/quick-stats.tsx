"use client"

import { useDashboardAnalytics, useDailyAnalytics, useWeeklyAnalytics } from "@/hooks/use-analytics"
import { FloatingCard } from "@/components/design-system/floating-card"
import { Skeleton } from "@/components/design-system/skeleton"
import { TimerIcon, FocusIcon, ListTodoIcon, TrendingUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  accent: string
}

function StatCard({ icon, label, value, accent }: StatCardProps) {
  return (
    <FloatingCard className="p-4" hover>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-caption text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-foreground tabular-nums leading-tight truncate">{value}</p>
        </div>
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", accent)}>
          {icon}
        </div>
      </div>
    </FloatingCard>
  )
}

function StatCardSkeleton() {
  return (
    <FloatingCard className="p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-10" />
        </div>
      </div>
    </FloatingCard>
  )
}

export function QuickStats() {
  const { data: dashboard, isLoading: dashLoading } = useDashboardAnalytics()
  const { data: daily } = useDailyAnalytics()
  const { data: weekly, isLoading: weeklyLoading } = useWeeklyAnalytics()

  const dailyStats = daily?.data
  const stats = dashboard?.data
  const weeklyData = weekly?.data

  const focusMinutes = dailyStats?.focusMinutes ?? 0
  const focusHours = (focusMinutes / 60).toFixed(1)
  const completedPomodoros = dailyStats?.completedPomodoros ?? stats?.pomodoros.completedPomodoros ?? 0
  const totalTodos = stats?.todos.totalTodos ?? 0
  const completedTodos = stats?.todos.completedTodos ?? 0
  const weeklyPomodoros = weeklyData?.days.reduce((sum, d) => sum + d.pomodoros, 0) ?? 0

  const isLoading = dashLoading || weeklyLoading

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard
        icon={<FocusIcon size={16} className="text-blue-500 dark:text-blue-400" />}
        label="Focus Hours"
        value={focusHours}
        accent="bg-blue-500/10 dark:bg-blue-400/10"
      />
      <StatCard
        icon={<TimerIcon size={16} className="text-orange-500 dark:text-orange-400" />}
        label="Pomodoros"
        value={completedPomodoros}
        accent="bg-orange-500/10 dark:bg-orange-400/10"
      />
      <StatCard
        icon={<ListTodoIcon size={16} className="text-green-500 dark:text-green-400" />}
        label="Tasks Done"
        value={`${completedTodos}/${totalTodos}`}
        accent="bg-green-500/10 dark:bg-green-400/10"
      />
      <StatCard
        icon={<TrendingUpIcon size={16} className="text-violet-500 dark:text-violet-400" />}
        label="This Week"
        value={`${weeklyPomodoros} pom`}
        accent="bg-violet-500/10 dark:bg-violet-400/10"
      />
    </div>
  )
}
