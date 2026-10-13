"use client"

import { useMemo, useState } from "react"
import { GlassCard } from "@/components/design-system/glass-card"
import { CalendarIcon, SparklesIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface CfCalendarHeatmapProps {
  calendar: Record<string, number> | undefined
}

interface DayData {
  date: string
  count: number
  dayOfWeek: number // 0 = Sunday, 6 = Saturday
  month: number
  isCurrentYear: boolean
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function CfCalendarHeatmap({ calendar = {} }: CfCalendarHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number } | null>(null)

  // Generate the last 52 weeks of dates up to today
  const { weeks, monthLabels, totalSolvedYear, activeDays, maxDaySolves } = useMemo(() => {
    const today = new Date()
    const days: DayData[] = []

    // Start 52 weeks ago on the closest Sunday
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 364)
    // Align to Sunday
    const startDay = startDate.getDay()
    startDate.setDate(startDate.getDate() - startDay)

    let totalSolvedYear = 0
    let activeDays = 0
    let maxDaySolves = 0

    const curr = new Date(startDate)
    while (curr <= today || curr.getDay() !== 0) {
      const y = curr.getFullYear()
      const m = String(curr.getMonth() + 1).padStart(2, "0")
      const d = String(curr.getDate()).padStart(2, "0")
      const dateStr = `${y}-${m}-${d}`

      const count = calendar[dateStr] || 0
      if (curr <= today) {
        totalSolvedYear += count
        if (count > 0) activeDays++
        if (count > maxDaySolves) maxDaySolves = count
      }

      days.push({
        date: dateStr,
        count,
        dayOfWeek: curr.getDay(),
        month: curr.getMonth(),
        isCurrentYear: curr <= today,
      })

      curr.setDate(curr.getDate() + 1)
      if (days.length > 371) break
    }

    // Split into weeks of 7 days each
    const weeks: DayData[][] = []
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7))
    }

    // Determine month positions
    const monthLabels: { name: string; weekIndex: number }[] = []
    let lastMonth = -1
    weeks.forEach((week, index) => {
      const firstValidDay = week.find((d) => d.isCurrentYear)
      if (firstValidDay && firstValidDay.month !== lastMonth) {
        monthLabels.push({
          name: MONTH_NAMES[firstValidDay.month],
          weekIndex: index,
        })
        lastMonth = firstValidDay.month
      }
    })

    return { weeks, monthLabels, totalSolvedYear, activeDays, maxDaySolves }
  }, [calendar])

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted/40 border-border/20 hover:border-border/60"
    if (count === 1) return "bg-primary/20 border-primary/30 hover:border-primary/60"
    if (count === 2) return "bg-primary/45 border-primary/50 hover:border-primary/80"
    if (count <= 4) return "bg-primary/75 border-primary/80 hover:border-primary"
    return "bg-primary border-primary shadow-[0_0_8px_var(--primary)]"
  }

  return (
    <GlassCard className="p-5 border-border/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <CalendarIcon size={16} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Questions Solved Calendar</h3>
            <p className="text-xs text-muted-foreground">Submission activity over the past year</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Solved:</span>
            <span className="font-bold text-foreground tabular-nums">{totalSolvedYear}</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Active Days:</span>
            <span className="font-bold text-foreground tabular-nums">{activeDays}</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Day Record:</span>
            <span className="font-bold text-primary tabular-nums">{maxDaySolves}</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="min-w-[720px] select-none">
          {/* Month labels */}
          <div className="flex pl-8 mb-1.5 text-[11px] text-muted-foreground font-medium relative h-4">
            {monthLabels.map((m, idx) => (
              <span
                key={`${m.name}-${idx}`}
                className="absolute"
                style={{ left: `${m.weekIndex * 14 + 32}px` }}
              >
                {m.name}
              </span>
            ))}
          </div>

          <div className="flex">
            {/* Day of week labels */}
            <div className="flex flex-col justify-between pr-2 text-[10px] text-muted-foreground font-medium h-[98px]">
              <span className="leading-none">Mon</span>
              <span className="leading-none">Wed</span>
              <span className="leading-none">Fri</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredDay({ date: day.date, count: day.count })}
                      onMouseLeave={() => setHoveredDay(null)}
                      className={cn(
                        "size-[11px] rounded-[2.5px] border transition-all duration-150 cursor-pointer",
                        getIntensityClass(day.count),
                        !day.isCurrentYear && "opacity-20 pointer-events-none"
                      )}
                      title={`${day.count} ${day.count === 1 ? "problem" : "problems"} solved on ${day.date}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Legend & Hover Info */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40 text-xs">
            <div className="text-muted-foreground min-h-[18px]">
              {hoveredDay ? (
                <span className="font-medium text-foreground">
                  <strong className="text-primary font-bold">{hoveredDay.count}</strong>{" "}
                  {hoveredDay.count === 1 ? "problem" : "problems"} solved on{" "}
                  {new Date(hoveredDay.date + "T00:00:00").toLocaleDateString(undefined, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              ) : (
                <span>Hover over any day to see details</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
              <span>Less</span>
              <div className="size-[10px] rounded-[2px] bg-muted/40 border border-border/20" />
              <div className="size-[10px] rounded-[2px] bg-primary/20 border border-primary/30" />
              <div className="size-[10px] rounded-[2px] bg-primary/45 border border-primary/50" />
              <div className="size-[10px] rounded-[2px] bg-primary/75 border border-primary/80" />
              <div className="size-[10px] rounded-[2px] bg-primary border border-primary" />
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  )
}
