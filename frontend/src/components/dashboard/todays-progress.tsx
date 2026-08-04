"use client"

import { useDashboardAnalytics, useDailyAnalytics, useStreakAnalytics } from "@/hooks/use-analytics"
import { FloatingCard } from "@/components/design-system/floating-card"
import { SectionHeader } from "@/components/design-system/layout"
import { Skeleton } from "@/components/design-system/skeleton"
import { FocusIcon, TimerIcon, ListTodoIcon, FlameIcon, TrendingUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatItemProps {
  icon: React.ReactNode
  label: string
  value: string | number
  accent: string
  iconColor: string
}

function StatItem({ icon, label, value, accent, iconColor, className }: StatItemProps & { className?: string }) {
  return (
    <FloatingCard className={cn("p-4", className)} hover>
      <div className="flex items-center gap-3">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", accent)}>
          <span className={iconColor}>{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-caption text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground tabular-nums leading-tight">{value}</p>
        </div>
      </div>
    </FloatingCard>
  )
}

function StatSkeleton() {
  return (
    <FloatingCard className="p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    </FloatingCard>
  )
}

export function TodaysProgress() {
  const { data: dashboard, isLoading: dashLoading } = useDashboardAnalytics()
  const { data: daily, isLoading: dailyLoading } = useDailyAnalytics()
  const { data: streak, isLoading: streakLoading } = useStreakAnalytics()

  const dailyStats = daily?.data
  const stats = dashboard?.data
  const streakData = streak?.data
  const isLoading = dashLoading || dailyLoading || streakLoading

  const focusMinutes = dailyStats?.focusMinutes ?? 0
  const focusHours = (focusMinutes / 60).toFixed(1)
  const completedPomodoros = dailyStats?.completedPomodoros ?? stats?.pomodoros.completedPomodoros ?? 0
  const totalTodos = stats?.todos.totalTodos ?? 0
  const completedTodos = stats?.todos.completedTodos ?? 0
  const currentStreak = streakData?.currentStreak ?? 0
  const completionRate = dailyStats?.completionRate ?? 0

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SectionHeader title="Today's Progress" />
        <div className="grid grid-cols-2 gap-3">
          <StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton /><StatSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <SectionHeader title="Today's Progress" />
      <div className="grid grid-cols-2 gap-3">
        <StatItem
          icon={<FocusIcon size={18} />}
          label="Focus Hours"
          value={focusHours}
          accent="bg-blue-500/10"
          iconColor="text-blue-500 dark:text-blue-400"
        />
        <StatItem
          icon={<TimerIcon size={18} />}
          label="Pomodoros"
          value={completedPomodoros}
          accent="bg-orange-500/10"
          iconColor="text-orange-500 dark:text-orange-400"
        />
        <StatItem
          icon={<ListTodoIcon size={18} />}
          label="Tasks Done"
          value={totalTodos > 0 ? `${completedTodos}/${totalTodos}` : "0"}
          accent="bg-green-500/10"
          iconColor="text-green-500 dark:text-green-400"
        />
        <StatItem
          icon={<FlameIcon size={18} />}
          label="Current Streak"
          value={`${currentStreak}d`}
          accent={currentStreak > 0 ? "bg-amber-500/10" : "bg-muted"}
          iconColor={currentStreak > 0 ? "text-amber-500 dark:text-amber-400" : "text-muted-foreground"}
        />
        <StatItem
          icon={<TrendingUpIcon size={18} />}
          label="Completion Rate"
          value={`${completionRate}%`}
          accent="bg-violet-500/10"
          iconColor="text-violet-500 dark:text-violet-400"
          className="col-span-2"
        />
      </div>
    </div>
  )
}
