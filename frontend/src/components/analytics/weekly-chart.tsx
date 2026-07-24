"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/common/skeleton"
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="w-full h-[250px] rounded-lg" />
        ) : chartData.length === 0 || chartData.every((d) => d["Focus Minutes"] === 0) ? (
          <div className="flex h-[250px] items-center justify-center">
            <p className="text-sm text-muted-foreground">No focus data this week.</p>
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
