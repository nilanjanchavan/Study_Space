"use client"

import { GlassCard } from "@/components/design-system/glass-card"
import { BarChart3Icon, TagIcon } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface CfAnalyticsProps {
  ratingDistribution: Array<{ bracket: string; count: number }> | undefined
  topicTags: Array<{ tag: string; count: number }> | undefined
}

function CustomBarTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border/70 bg-card/95 backdrop-blur-md px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <p className="text-xs text-primary font-bold mt-0.5">
        {payload[0].value} {payload[0].value === 1 ? "problem" : "problems"}
      </p>
    </div>
  )
}

export function CfAnalytics({ ratingDistribution = [], topicTags = [] }: CfAnalyticsProps) {
  const hasRatingData = ratingDistribution.some((d) => d.count > 0)
  const maxTagCount = topicTags.length > 0 ? Math.max(...topicTags.map((t) => t.count)) : 1

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Rating Bracket Breakdown */}
      <GlassCard className="p-5 border-border/60 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3Icon size={16} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Difficulty Breakdown</h3>
              <p className="text-xs text-muted-foreground">Solved problems across rating tiers</p>
            </div>
          </div>

          {!hasRatingData ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground/60">
              No rated problems solved yet
            </div>
          ) : (
            <div className="w-full h-[200px] select-none">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingDistribution} margin={{ top: 10, right: 10, bottom: 5, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} vertical={false} />
                  <XAxis
                    dataKey="bracket"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="count"
                    fill="var(--primary)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Top Topic Tags */}
      <GlassCard className="p-5 border-border/60 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <TagIcon size={16} />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Top Topic Tags</h3>
              <p className="text-xs text-muted-foreground">Dominant categories in solved problems</p>
            </div>
          </div>

          {topicTags.length === 0 ? (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground/60">
              No problem tags available
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
              {topicTags.slice(0, 8).map((item) => {
                const pct = Math.round((item.count / maxTagCount) * 100)
                return (
                  <div key={item.tag} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground capitalize truncate">{item.tag}</span>
                      <span className="text-muted-foreground tabular-nums font-semibold shrink-0">
                        {item.count} solved
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted/70 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/80 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  )
}
