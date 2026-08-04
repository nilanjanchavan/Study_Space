"use client"

import { useMemo } from "react"
import { GlassCard } from "@/components/design-system/glass-card"
import { Skeleton } from "@/components/design-system/skeleton"
import { SectionHeader } from "@/components/design-system/layout"
import { AnalyticsBarChart } from "./charts/bar-chart"
import type { MonthlyAnalytics } from "@/services/analytics"

interface MonthlyChartProps {
  data: MonthlyAnalytics | undefined
  isLoading: boolean
}

export function MonthlyChart({ data, isLoading }: MonthlyChartProps) {
  const chartData = useMemo(() => {
    if (!data?.weeklyBreakdown) return []
    return data.weeklyBreakdown.map((week, i) => ({
      label: `Week ${i + 1}`,
      "Focus Minutes": week.focusMinutes,
    }))
  }, [data])

  return (
    <GlassCard className="p-4">
      <SectionHeader
        title="Monthly Analytics"
        subtitle={data ? `${data.totalFocusHours}h total` : undefined}
      />
      <div className="mt-3">
        {isLoading ? (
          <Skeleton className="w-full h-[220px] rounded-lg" />
        ) : chartData.length === 0 || chartData.every((d) => d["Focus Minutes"] === 0) ? (
          <div className="flex h-[220px] items-center justify-center">
            <p className="text-sm text-muted-foreground/50">No focus data this month</p>
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
