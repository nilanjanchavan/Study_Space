"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/common/skeleton"
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
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <CardTitle>Monthly Analytics</CardTitle>
          {data && (
            <div className="text-right shrink-0">
              <p className="text-xs text-muted-foreground">Total Focus</p>
              <p className="text-lg font-semibold text-foreground">{data.totalFocusHours}h</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full h-[250px] rounded-lg" />
        ) : chartData.length === 0 || chartData.every((d) => d["Focus Minutes"] === 0) ? (
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No focus data this month.</p>
          </div>
        ) : (
          <AnalyticsBarChart
            data={chartData}
            bars={[{ key: "Focus Minutes", color: "hsl(var(--primary))" }]}
            height={250}
          />
        )}
      </CardContent>
    </Card>
  )
}
