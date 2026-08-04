"use client"

import { useMemo } from "react"
import { GlassCard } from "@/components/design-system/glass-card"
import { Skeleton } from "@/components/design-system/skeleton"
import { SectionHeader } from "@/components/design-system/layout"
import { AnalyticsBarChart } from "./charts/bar-chart"
import type { WeeklyAnalytics } from "@/services/analytics"
import { format, parseISO } from "date-fns"

interface WeeklyChartProps {
  data: WeeklyAnalytics | undefined
  isLoading: boolean
}

export function WeeklyChart({ data, isLoading }: WeeklyChartProps) {
  const chartData = useMemo(() => {
    if (!data?.days) return []
    return data.days.map((day) => ({
      label: format(parseISO(day.date), "EEE"),
      "Focus Minutes": day.focusMinutes,
    }))
  }, [data])

  const totalMinutes = chartData.reduce((sum, d) => sum + d["Focus Minutes"], 0)

  return (
    <GlassCard className="p-4">
      <SectionHeader
        title="Weekly Analytics"
        subtitle={totalMinutes > 0 ? `${Math.round(totalMinutes / 60 * 10) / 10}h total` : undefined}
      />
      <div className="mt-3">
        {isLoading ? (
          <Skeleton className="w-full h-[220px] rounded-lg" />
        ) : chartData.length === 0 || chartData.every((d) => d["Focus Minutes"] === 0) ? (
          <div className="flex h-[220px] items-center justify-center">
            <p className="text-sm text-muted-foreground/50">No focus data this week</p>
          </div>
        ) : (
          <AnalyticsBarChart
            data={chartData}
            bars={[{ key: "Focus Minutes", color: "hsl(var(--primary))" }]}
            height={220}
          />
        )}
      </div>
    </GlassCard>
  )
}
