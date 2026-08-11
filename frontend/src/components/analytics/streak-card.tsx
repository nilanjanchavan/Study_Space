"use client"

import { GlassCard } from "@/components/design-system/glass-card"
import { Skeleton } from "@/components/design-system/skeleton"
import { SectionHeader } from "@/components/design-system/layout"
import { FlameIcon } from "lucide-react"
import type { StreakAnalytics } from "@/services/analytics"
import { cn } from "@/lib/utils"

interface StreakCardProps {
  data: StreakAnalytics | undefined
  isLoading: boolean
}

export function StreakCard({ data, isLoading }: StreakCardProps) {
  return (
    <GlassCard className="p-4">
      <SectionHeader
        title="Streaks"
        accent={{
          icon: <FlameIcon size={14} />,
          className: "bg-amber-500/10 text-amber-500 dark:bg-amber-400/10 dark:text-amber-400",
        }}
      />
      <div className="mt-3">
        {isLoading ? (
          <div className="flex items-center gap-6">
            <Skeleton className="size-16 rounded-2xl" />
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex gap-4 sm:gap-6">
              <div>
                <p className="text-[11px] text-muted-foreground">Current</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                  {data?.currentStreak ?? 0}
                  <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1">
                    {(data?.currentStreak ?? 0) === 1 ? "day" : "days"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground">Best</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
                  {data?.longestStreak ?? 0}
                  <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1">
                    {(data?.longestStreak ?? 0) === 1 ? "day" : "days"}
                  </span>
                </p>
              </div>
            </div>
            <div className={cn(
              "flex size-12 sm:size-16 shrink-0 items-center justify-center rounded-2xl",
              (data?.currentStreak ?? 0) > 0
                ? "bg-gradient-to-br from-amber-500/20 to-amber-600/15 text-amber-500 ring-1 ring-amber-500/15 shadow-[0_0_20px_-4px_rgba(245,158,11,0.4)] dark:from-amber-400/25 dark:to-amber-500/15 dark:text-amber-400 dark:ring-amber-400/15 dark:shadow-[0_0_20px_-4px_rgba(251,191,36,0.35)]"
                : "bg-muted text-muted-foreground"
            )}>
              <FlameIcon size={22} />
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  )
}
