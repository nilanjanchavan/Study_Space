"use client"

import { GlassCard } from "@/components/design-system/glass-card"
import { Skeleton } from "@/components/design-system/skeleton"
import { SectionHeader } from "@/components/design-system/layout"
import { TimerIcon, CoffeeIcon, CheckSquareIcon, TargetIcon, CircleDotIcon } from "lucide-react"
import type { DashboardAnalytics } from "@/services/analytics"
import { cn } from "@/lib/utils"

interface ProductivitySummaryProps {
  data: DashboardAnalytics | undefined
  isLoading: boolean
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: number | string
  sub?: string
  accent: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2.5 transition-colors hover:bg-muted/50">
      <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", accent)}>
        <Icon size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-semibold text-foreground tabular-nums">{value}</p>
      </div>
      {sub && (
        <span className="shrink-0 text-[10px] text-muted-foreground/60 bg-muted/50 rounded px-1.5 py-0.5 tabular-nums">
          {sub}
        </span>
      )}
    </div>
  )
}

export function ProductivitySummary({ data, isLoading }: ProductivitySummaryProps) {
  const stats = data
    ? [
        {
          icon: TimerIcon,
          label: "Focus Hours",
          value: data.pomodoros.totalFocusMinutes >= 60
            ? `${Math.floor(data.pomodoros.totalFocusMinutes / 60)}h ${data.pomodoros.totalFocusMinutes % 60}m`
            : `${data.pomodoros.totalFocusMinutes}m`,
          accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        },
        {
          icon: CoffeeIcon,
          label: "Pomodoros",
          value: data.pomodoros.completedPomodoros,
          sub: `avg ${data.pomodoros.averagePomodoroLength}m`,
          accent: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
        },
        {
          icon: CheckSquareIcon,
          label: "Todos",
          value: `${data.todos.completedTodos}/${data.todos.totalTodos}`,
          sub: `${data.todos.totalTodos > 0 ? Math.round((data.todos.completedTodos / data.todos.totalTodos) * 100) : 0}%`,
          accent: "bg-success/10 text-success",
        },
        {
          icon: TargetIcon,
          label: "Focus Sessions",
          value: data.focusSessions.completedFocusSessions,
          sub: `${data.focusSessions.totalFocusSessions} total`,
          accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
        },
        {
          icon: CircleDotIcon,
          label: "Active Session",
          value: data.current.activePomodoro
            ? data.current.activePomodoro.type
            : data.current.activeFocusSession
              ? data.current.activeFocusSession.mode
              : "None",
          accent: "bg-muted text-muted-foreground",
        },
      ]
    : []

  return (
    <GlassCard className="p-4">
      <SectionHeader title="Productivity Summary" />
      <div className="mt-3 space-y-1.5">
        {isLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg bg-muted/30 px-3 py-2.5">
                <Skeleton className="size-8 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          stats.map((stat) => (
            <SummaryStat key={stat.label} {...stat} />
          ))
        )}
      </div>
    </GlassCard>
  )
}
