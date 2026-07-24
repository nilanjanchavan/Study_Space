"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/common/skeleton"
import { TimerIcon, CoffeeIcon, CheckSquareIcon, TargetIcon, CircleDotIcon } from "lucide-react"
import type { DashboardAnalytics } from "@/services/analytics"

interface ProductivitySummaryProps {
  data: DashboardAnalytics | undefined
  isLoading: boolean
}

function SummaryStat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: number | string
  sub?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <Icon size={14} className="text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-base font-semibold text-foreground">{value}</p>
      </div>
      {sub && (
        <span className="shrink-0 text-[10px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
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
        },
        {
          icon: CoffeeIcon,
          label: "Pomodoros",
          value: data.pomodoros.completedPomodoros,
          sub: `avg ${data.pomodoros.averagePomodoroLength}m`,
        },
        {
          icon: CheckSquareIcon,
          label: "Todos",
          value: `${data.todos.completedTodos}/${data.todos.totalTodos}`,
          sub: `${data.todos.totalTodos > 0 ? Math.round((data.todos.completedTodos / data.todos.totalTodos) * 100) : 0}%`,
        },
        {
          icon: TargetIcon,
          label: "Focus Sessions",
          value: data.focusSessions.completedFocusSessions,
          sub: `${data.focusSessions.totalFocusSessions} total`,
        },
        {
          icon: CircleDotIcon,
          label: "Active Session",
          value: data.current.activePomodoro
            ? data.current.activePomodoro.type
            : data.current.activeFocusSession
              ? data.current.activeFocusSession.mode
              : "None",
        },
      ]
    : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productivity Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                <Skeleton className="size-8 shrink-0 rounded-md" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {stats.map((stat) => (
              <SummaryStat key={stat.label} {...stat} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
