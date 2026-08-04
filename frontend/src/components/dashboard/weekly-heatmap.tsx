"use client"

import { useMemo } from "react"
import { useWeeklyAnalytics } from "@/hooks/use-analytics"
import { GlassCard } from "@/components/design-system/glass-card"
import { SectionHeader } from "@/components/design-system/layout"
import { Skeleton } from "@/components/design-system/skeleton"
import { cn } from "@/lib/utils"

function getColorClass(minutes: number, maxMinutes: number): string {
  if (minutes === 0) return "bg-muted/40 dark:bg-white/[0.04]"
  const ratio = maxMinutes > 0 ? minutes / maxMinutes : 0
  if (ratio >= 0.75) return "bg-success dark:bg-success/80"
  if (ratio >= 0.5) return "bg-success/70 dark:bg-success/60"
  if (ratio >= 0.25) return "bg-success/40 dark:bg-success/35"
  return "bg-success/20 dark:bg-success/20"
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function WeeklyHeatmap() {
  const { data: weekly, isLoading } = useWeeklyAnalytics()
  const weekData = weekly?.data

  const { maxMinutes, totalFocusMinutes, totalPomodoros } = useMemo(() => {
    if (!weekData?.days) return { maxMinutes: 1, totalFocusMinutes: 0, totalPomodoros: 0 }
    return {
      maxMinutes: Math.max(...weekData.days.map((d) => d.focusMinutes), 1),
      totalFocusMinutes: weekData.days.reduce((s, d) => s + d.focusMinutes, 0),
      totalPomodoros: weekData.days.reduce((s, d) => s + d.pomodoros, 0),
      totalTodos: weekData.days.reduce((s, d) => s + d.completedTodos, 0),
    }
  }, [weekData])

  const totalActiveDays = weekData?.days.filter((d) => d.focusMinutes > 0).length ?? 0

  return (
    <GlassCard className="p-4">
      <SectionHeader
        title="Weekly Focus"
        subtitle={`${totalActiveDays} active days · ${totalFocusMinutes}min focused`}
      />

      <div className="mt-3">
        {isLoading ? (
          <Skeleton className="h-24 w-full rounded-lg" />
        ) : weekData?.days ? (
          <div>
            <div className="flex gap-2">
              {weekData.days.map((day, i) => (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={cn(
                      "aspect-square w-full rounded-lg transition-colors duration-200 relative group",
                      getColorClass(day.focusMinutes, maxMinutes)
                    )}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-popover text-popover-foreground text-xs rounded-lg px-3 py-1.5 shadow-floating whitespace-normal max-w-[calc(100vw-2rem)]">
                        <p>{day.focusMinutes}min focus</p>
                        <p>{day.pomodoros} pomodoros · {day.completedTodos} todos</p>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 font-medium tabular-nums">
                    {DAY_LABELS[i]}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span>Less</span>
                {[0, 25, 50, 75].map((pct) => (
                  <div key={pct} className={cn(
                    "h-3 w-3 rounded-sm",
                    getColorClass(pct === 0 ? 0 : (pct / 100) * maxMinutes, maxMinutes)
                  )} />
                ))}
                <span>More</span>
              </div>
              <span className="tabular-nums">{totalPomodoros} total pomodoros</span>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            {DAY_LABELS.map((label) => (
              <div key={label} className="flex flex-1 flex-col items-center gap-2">
                <div className="aspect-square w-full rounded-lg bg-muted/40 dark:bg-white/[0.04]" />
                <span className="text-[10px] text-muted-foreground/60 font-medium">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
