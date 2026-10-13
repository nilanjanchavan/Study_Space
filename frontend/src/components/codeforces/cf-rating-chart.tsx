"use client"

import { useMemo, useState } from "react"
import { GlassCard } from "@/components/design-system/glass-card"
import { Button } from "@/components/ui/button"
import { TrendingUpIcon, TrophyIcon, ArrowUpRightIcon, ArrowDownRightIcon } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { cn } from "@/lib/utils"

interface CfRatingChartProps {
  ratingHistory: Array<{
    contestId: number
    contestName: string
    rank: number
    oldRating: number
    newRating: number
    ratingUpdateTimeSeconds: number
  }> | undefined
  currentRating: number | null
  maxRating: number | null
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: any }> }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const delta = d.newRating - d.oldRating

  return (
    <div className="rounded-xl border border-border/70 bg-card/95 backdrop-blur-md p-3 shadow-xl max-w-[280px]">
      <p className="text-xs font-semibold text-foreground truncate mb-1">{d.contestName}</p>
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground mt-2 border-t border-border/40 pt-2">
        <span>Rating:</span>
        <div className="flex items-center gap-1.5 font-bold tabular-nums">
          <span className="text-foreground">{d.newRating}</span>
          <span className={cn("text-[11px] font-semibold flex items-center", delta >= 0 ? "text-emerald-500" : "text-rose-500")}>
            {delta >= 0 ? <ArrowUpRightIcon size={12} /> : <ArrowDownRightIcon size={12} />}
            {delta >= 0 ? `+${delta}` : delta}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground mt-1">
        <span>Contest Rank:</span>
        <span className="font-semibold text-foreground tabular-nums">#{d.rank}</span>
      </div>
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground mt-1">
        <span>Date:</span>
        <span className="tabular-nums">{d.formattedDate}</span>
      </div>
    </div>
  )
}

export function CfRatingChart({ ratingHistory = [], currentRating, maxRating }: CfRatingChartProps) {
  const [viewMode, setViewMode] = useState<"all" | "recent">("all")

  const { chartData, minRating, maxRatingVal, bestRank } = useMemo(() => {
    if (!ratingHistory || ratingHistory.length === 0) {
      return { chartData: [], minRating: 1000, maxRatingVal: 2000, bestRank: null }
    }

    let history = [...ratingHistory]
    if (viewMode === "recent" && history.length > 25) {
      history = history.slice(-25)
    }

    let min = Infinity
    let max = -Infinity
    let best = Infinity

    const chartData = history.map((item, idx) => {
      if (item.newRating < min) min = item.newRating
      if (item.newRating > max) max = item.newRating
      if (item.rank < best) best = item.rank

      const date = new Date(item.ratingUpdateTimeSeconds * 1000)
      const formattedDate = date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
      const label = date.toLocaleDateString(undefined, { month: "short", year: "2-digit" })

      return {
        ...item,
        label,
        formattedDate,
        index: idx + 1,
      }
    })

    return {
      chartData,
      minRating: Math.max(0, Math.floor(min / 100) * 100 - 100),
      maxRatingVal: Math.ceil(max / 100) * 100 + 100,
      bestRank: best === Infinity ? null : best,
    }
  }, [ratingHistory, viewMode])

  return (
    <GlassCard className="p-5 border-border/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <TrendingUpIcon size={16} />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Rating Map</h3>
            <p className="text-xs text-muted-foreground">Contest performance & rating trajectory</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ratingHistory.length > 25 && (
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/40 text-xs">
              <Button
                variant={viewMode === "recent" ? "secondary" : "ghost"}
                size="sm"
                className="h-6 px-2 text-xs rounded-md"
                onClick={() => setViewMode("recent")}
              >
                Last 25
              </Button>
              <Button
                variant={viewMode === "all" ? "secondary" : "ghost"}
                size="sm"
                className="h-6 px-2 text-xs rounded-md"
                onClick={() => setViewMode("all")}
              >
                All ({ratingHistory.length})
              </Button>
            </div>
          )}
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[260px] text-center p-6 border border-dashed border-border/50 rounded-xl bg-card/20">
          <TrophyIcon size={32} className="text-muted-foreground/40 mb-2" />
          <p className="text-sm font-medium text-foreground">No contest history yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Participate in rated Codeforces contests to build your rating curve!
          </p>
        </div>
      ) : (
        <>
          <div className="w-full h-[260px] select-none">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 15, right: 15, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[minRating, maxRatingVal]}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                {maxRating && (
                  <ReferenceLine
                    y={maxRating}
                    stroke="var(--primary)"
                    strokeDasharray="3 3"
                    opacity={0.4}
                    label={{
                      value: `Peak: ${maxRating}`,
                      position: "right",
                      fill: "var(--primary)",
                      fontSize: 10,
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="newRating"
                  stroke="var(--primary)"
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: "var(--primary)" }}
                  activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--background)", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-border/40 text-xs">
            <div>
              <span className="text-muted-foreground">Total Contests:</span>
              <p className="font-bold text-foreground tabular-nums text-sm">{ratingHistory.length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Best Rank:</span>
              <p className="font-bold text-foreground tabular-nums text-sm">
                {bestRank ? `#${bestRank}` : "—"}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Current:</span>
              <p className="font-bold text-primary tabular-nums text-sm">{currentRating ?? "—"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">All-Time Peak:</span>
              <p className="font-bold text-foreground tabular-nums text-sm">{maxRating ?? "—"}</p>
            </div>
          </div>
        </>
      )}
    </GlassCard>
  )
}
