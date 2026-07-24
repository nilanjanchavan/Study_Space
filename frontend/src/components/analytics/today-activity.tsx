"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/common/skeleton"
import { TimerIcon, CoffeeIcon, CheckCircleIcon, PercentIcon } from "lucide-react"
import type { DailyAnalytics } from "@/services/analytics"

interface TodayActivityProps {
  data: DailyAnalytics | undefined
  isLoading: boolean
}

function StatItem({ icon: Icon, label, value, unit }: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  value: number | string
  unit?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon size={16} className="text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-foreground">
          {value}
          {unit && <span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  )
}

export function TodayActivity({ data, isLoading }: TodayActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 shrink-0 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-10" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <StatItem icon={TimerIcon} label="Focus Time" value={data?.focusMinutes ?? 0} unit="min" />
            <StatItem icon={CoffeeIcon} label="Pomodoros" value={data?.completedPomodoros ?? 0} />
            <StatItem icon={CheckCircleIcon} label="Todos Done" value={data?.completedTodos ?? 0} />
            <StatItem icon={PercentIcon} label="Completion" value={`${data?.completionRate ?? 0}%`} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
