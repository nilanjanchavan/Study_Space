"use client"

import { useMemo } from "react"
import { useWeeklyAnalytics } from "@/hooks/use-analytics"
import { GlassCard } from "@/components/design-system/glass-card"
import { SectionHeader } from "@/components/design-system/layout"
import { Skeleton } from "@/components/design-system/skeleton"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

function getColorIntensity(minutes: number, maxMinutes: number): string {
  if (minutes === 0) return "bg-muted/40 dark:bg-white/[0.04]"
  const ratio = maxMinutes > 0 ? minutes / maxMinutes : 0
  if (ratio >= 0.75) return "bg-indigo-500 dark:bg-indigo-400"
  if (ratio >= 0.5) return "bg-indigo-500/75 dark:bg-indigo-400/75"
  if (ratio >= 0.25) return "bg-indigo-500/45 dark:bg-indigo-400/45"
  return "bg-indigo-500/25 dark:bg-indigo-400/25"
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"]

export function CalendarHeatmap() {
  const { data: weekly, isLoading } = useWeeklyAnalytics()
  const weekData = weekly?.data

  const maxMinutes = useMemo(() => {
    if (!weekData?.days) return 1
    return Math.max(...weekData.days.map((d) => d.focusMinutes), 1)
  }, [weekData])

  const totalActiveDays = weekData?.days.filter((d) => d.focusMinutes > 0).length ?? 0

  return (
    <GlassCard className="p-4">
      <SectionHeader
        title="This Week"
        subtitle={`${totalActiveDays} active days`}
        accent={{ icon: <CalendarIcon size={14} />, className: "bg-indigo-500/10 text-indigo-500" }}
      />

      <div className="mt-3">
        {isLoading ? (
          <Skeleton className="h-16 w-full rounded-lg" />
        ) : weekData?.days ? (
          <div className="flex gap-1.5">
            {weekData.days.map((day, i) => (
              <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "aspect-square w-full rounded-sm transition-colors duration-200",
                    getColorIntensity(day.focusMinutes, maxMinutes)
                  )}
                  title={`${day.date}: ${day.focusMinutes}min focused`}
                />
                <span className="text-[9px] text-muted-foreground/60 font-medium">
                  {DAY_LABELS[i] ?? ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-1.5">
            {DAY_LABELS.map((label, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="aspect-square w-full rounded-sm bg-muted/40 dark:bg-white/[0.04]" />
                <span className="text-[9px] text-muted-foreground/60 font-medium">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  )
}
