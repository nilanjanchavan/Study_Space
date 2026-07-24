"use client"

import { useMemo } from "react"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { cn } from "@/lib/utils"

interface ChartBar {
  key: string
  color?: string
}

interface ChartDataPoint {
  label: string
  [key: string]: string | number
}

interface AnalyticsBarChartProps {
  data: ChartDataPoint[]
  bars: ChartBar[]
  height?: number
  className?: string
  showGrid?: boolean
  showTooltip?: boolean
  yFormatter?: (v: number) => string
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ dataKey: string; color: string; value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border bg-card px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="text-xs text-muted-foreground">
          <span
            className="inline-block size-2 rounded-full mr-1.5"
            style={{ backgroundColor: entry.color }}
          />
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

export function AnalyticsBarChart({
  data,
  bars,
  height = 250,
  className,
  showGrid = true,
  showTooltip = true,
  yFormatter = (v) => String(v),
}: AnalyticsBarChartProps) {
  const content = useMemo(
    () => (
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          )}
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={yFormatter}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          {showTooltip && <Tooltip content={<CustomTooltip />} />}
          {bars.map((bar) => (
            <Bar
              key={bar.key}
              dataKey={bar.key}
              fill={bar.color ?? "hsl(var(--primary))"}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    ),
    [data, bars, height, showGrid, showTooltip, yFormatter],
  )

  return <div className={cn("w-full", className)}>{content}</div>
}
